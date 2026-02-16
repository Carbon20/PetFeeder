/**
 * Couple Mode (Ortak Evcil Hayvan) - Firebase Realtime Database yardımcı servisleri
 *
 * Veri yapısı:
 * households/
 *   {householdId}/
 *     inviteCode: string (6 hane)
 *     petData: { name, level, xp, hunger }
 *     members: { [userId]: true }
 * inviteCodes/
 *   {code}: householdId  (davet kodu ile hızlı arama)
 */

import { auth, realtimeDb } from "@/app/(tabs)/firebaseConfig";
import {
    get,
    off,
    onValue,
    push,
    ref,
    set,
    update,
    type DatabaseReference,
} from "firebase/database";
import { useEffect, useState } from "react";

// --- Tipler ---

export interface PetData {
  name: string;
  level: number;
  xp: number;
  hunger: number; // 0-100 arası, 0 aç 100 tok
}

export interface HouseholdMembers {
  [userId: string]: boolean;
}

export interface HouseholdData {
  inviteCode: string;
  petData: PetData;
  members: HouseholdMembers;
}

const DEFAULT_PET_DATA: PetData = {
  name: "Evcil Hayvan",
  level: 1,
  xp: 0,
  hunger: 80,
};

const MAX_MEMBERS = 2;
const INVITE_CODE_LENGTH = 6;

// --- Yardımcı: 6 haneli rastgele davet kodu ---
function generateInviteCode(): string {
  let code = "";
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

/**
 * Yeni bir ev (household) oluşturur ve 6 haneli benzersiz davet kodu üretir.
 * Oluşturan kullanıcı otomatik olarak members'a eklenir.
 * @returns { householdId, inviteCode } veya hata fırlatır
 */
export async function createHousehold(): Promise<{
  householdId: string;
  inviteCode: string;
}> {
  const user = auth.currentUser;
  if (!user) throw new Error("Ev oluşturmak için giriş yapmalısınız.");

  let inviteCode: string = "";

  // Benzersiz kod bulana kadar dene (en fazla 10 deneme)
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generateInviteCode();
    const codeRef = ref(realtimeDb, `inviteCodes/${candidate}`);
    const snapshot = await get(codeRef);
    if (!snapshot.exists()) {
      inviteCode = candidate;
      break;
    }
    if (attempt === 9) throw new Error("Davet kodu oluşturulamadı, tekrar deneyin.");
  }
  if (!inviteCode) throw new Error("Davet kodu oluşturulamadı, tekrar deneyin.");

  const householdsRef = ref(realtimeDb, "households");
  const newHouseholdRef = push(householdsRef);
  const householdId = newHouseholdRef.key;
  if (!householdId) throw new Error("Ev ID oluşturulamadı.");

  const householdData: HouseholdData = {
    inviteCode,
    petData: { ...DEFAULT_PET_DATA },
    members: { [user.uid]: true },
  };

  try {
    await set(newHouseholdRef, householdData);
    await set(ref(realtimeDb, `inviteCodes/${inviteCode}`), householdId);
  } catch (error: any) {
    if (error?.code === 'PERMISSION_DENIED' || error?.message?.includes('permission')) {
      throw new Error("Firebase Realtime Database izinleri eksik. Lütfen Firebase Console'da güvenlik kurallarını kontrol edin.");
    }
    throw error;
  }

  return { householdId, inviteCode };
}

/**
 * Girilen 6 haneli davet kodu ile eve üye olur.
 * En fazla 2 üye (MAX_MEMBERS) kabul edilir.
 * @param inviteCode - 6 haneli davet kodu
 * @returns householdId veya hata fırlatır
 */
export async function joinHousehold(inviteCode: string): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Eve katılmak için giriş yapmalısınız.");

  const code = inviteCode.trim().replace(/\s/g, "").slice(0, INVITE_CODE_LENGTH);
  if (code.length !== INVITE_CODE_LENGTH) {
    throw new Error("Davet kodu 6 haneli olmalıdır.");
  }

  const codeRef = ref(realtimeDb, `inviteCodes/${code}`);
  const codeSnapshot = await get(codeRef);
  if (!codeSnapshot.exists()) {
    throw new Error("Geçersiz veya süresi dolmuş davet kodu.");
  }

  const householdId = codeSnapshot.val() as string;
  const householdRef = ref(realtimeDb, `households/${householdId}`);
  const householdSnapshot = await get(householdRef);

  if (!householdSnapshot.exists()) {
    throw new Error("Ev bulunamadı.");
  }

  const data = householdSnapshot.val() as HouseholdData;
  const memberIds = data.members ? Object.keys(data.members) : [];

  if (memberIds.includes(user.uid)) {
    return householdId; // Zaten üye
  }

  if (memberIds.length >= MAX_MEMBERS) {
    throw new Error("Bu evde en fazla 2 kişi olabilir.");
  }

  try {
    await update(householdRef, {
      [`members/${user.uid}`]: true,
    });
  } catch (error: any) {
    if (error?.code === 'PERMISSION_DENIED' || error?.message?.includes('permission')) {
      throw new Error("Firebase Realtime Database izinleri eksik. Lütfen Firebase Console'da güvenlik kurallarını kontrol edin.");
    }
    throw error;
  }

  return householdId;
}

/**
 * Hayvanın durumunu anlık (realtime) dinleyen hook.
 * householdId geçerli olduğu sürece households/{id}/petData dinlenir.
 * @param householdId - Ev ID (null/undefined ise abonelik yok)
 * @returns { petData, loading, error }
 */
export function useSyncPetData(householdId: string | null | undefined): {
  petData: PetData | null;
  loading: boolean;
  error: Error | null;
} {
  const [petData, setPetData] = useState<PetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!householdId) {
      setPetData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const petDataRef: DatabaseReference = ref(
      realtimeDb,
      `households/${householdId}/petData`
    );

    const unsubscribe = onValue(
      petDataRef,
      (snapshot) => {
        setError(null);
        const val = snapshot.val();
        setPetData(val ? { ...DEFAULT_PET_DATA, ...val } : null);
        setLoading(false);
      },
      (err) => {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    );

    return () => {
      off(petDataRef);
    };
  }, [householdId]);

  return { petData, loading, error };
}

/**
 * Pet verisini güncellemek için (örn. XP artışı, açlık değişimi).
 * Kısmi güncelleme yapılır; sadece verilen alanlar değişir.
 */
export async function updatePetData(
  householdId: string,
  updates: Partial<PetData>
): Promise<void> {
  const petDataRef = ref(realtimeDb, `households/${householdId}/petData`);
  const snapshot = await get(petDataRef);
  const current = (snapshot.val() || { ...DEFAULT_PET_DATA }) as PetData;
  await set(petDataRef, { ...current, ...updates });
}

/**
 * Ev verisini (members + inviteCode) anlık dinleyen hook.
 * Partner bilgisi ve üye sayısı için kullanılır.
 */
export function useHouseholdData(householdId: string | null | undefined): {
  householdData: HouseholdData | null;
  loading: boolean;
  error: Error | null;
} {
  const [householdData, setHouseholdData] = useState<HouseholdData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!householdId) {
      setHouseholdData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const householdRef = ref(realtimeDb, `households/${householdId}`);
    const unsubscribe = onValue(
      householdRef,
      (snapshot) => {
        setError(null);
        const val = snapshot.val();
        setHouseholdData(val || null);
        setLoading(false);
      },
      (err) => {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    );

    return () => off(householdRef);
  }, [householdId]);

  return { householdData, loading, error };
}

/**
 * Kullanıcının üye olduğu ev ID'sini bulur (varsa).
 * Realtime Database'de "members" içinde userId aramak için
 * tüm households taranır; üye sayısı az olduğu için kabul edilebilir.
 * Daha büyük ölçekte userHouseholds/{userId}: householdId index'i eklenebilir.
 */
export async function getMyHouseholdId(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;

  const householdsRef = ref(realtimeDb, "households");
  const snapshot = await get(householdsRef);
  if (!snapshot.exists()) return null;

  const households = snapshot.val() as Record<string, HouseholdData>;
  for (const [id, data] of Object.entries(households)) {
    if (data.members && data.members[user.uid]) return id;
  }
  return null;
}

// --- Couple Mode v2: Partner Pet Data ---

/**
 * Partner kullanıcının pet verisini Firestore'dan dinler.
 * @param partnerId - Partner user ID
 * @returns { partnerPet, loading, error }
 */
export function usePartnerPetData(partnerId: string | null | undefined): {
  partnerPet: any | null;
  loading: boolean;
  error: Error | null;
} {
  const [partnerPet, setPartnerPet] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!partnerId) {
      setPartnerPet(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Firestore'dan partner pet verisini dinle
    const { doc: firestoreDoc, onSnapshot } = require('firebase/firestore');
    const { db } = require('@/app/(tabs)/firebaseConfig');
    
    const userRef = firestoreDoc(db, 'users', partnerId);
    
    const unsubscribe = onSnapshot(
      userRef,
      (snapshot: any) => {
        if (snapshot.exists()) {
          const userData = snapshot.data();
          // Pet verisi user doc içinde veya ayrı bir field olabilir
          setPartnerPet(userData?.pet || null);
          setError(null);
        } else {
          setPartnerPet(null);
        }
        setLoading(false);
      },
      (err: any) => {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [partnerId]);

  return { partnerPet, loading, error };
}

/**
 * Partner kullanıcının görev istatistiklerini getirir.
 * @param partnerId - Partner user ID
 * @returns { completedToday, loading }
 */
export function usePartnerTaskStats(partnerId: string | null | undefined): {
  completedToday: number;
  loading: boolean;
} {
  const [completedToday, setCompletedToday] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!partnerId) {
      setCompletedToday(0);
      setLoading(false);
      return;
    }

    // Partner'ın bugünkü tamamlanmış görev sayısını hesapla
    // Şimdilik placeholder, gerçek implementasyon task verisi gerektirir
    setCompletedToday(0);
    setLoading(false);
  }, [partnerId]);

  return { completedToday, loading };
}

/**
 * Household'a nudge (high-five) event'i yazar.
 * @param householdId - Household ID
 */
export async function sendNudge(householdId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Nudge göndermek için giriş yapmalısınız.');

  const nudgeRef = ref(realtimeDb, `households/${householdId}/lastNudge`);
  await set(nudgeRef, {
    by: user.uid,
    at: Date.now(),
  });
}

/**
 * Household'dan nudge event'ini dinler.
 * @param householdId - Household ID
 * @returns { lastNudge, loading }
 */
export function useNudgeListener(householdId: string | null | undefined): {
  lastNudge: { by: string; at: number } | null;
  loading: boolean;
} {
  const [lastNudge, setLastNudge] = useState<{ by: string; at: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!householdId) {
      setLastNudge(null);
      setLoading(false);
      return;
    }

    const nudgeRef = ref(realtimeDb, `households/${householdId}/lastNudge`);
    
    const unsubscribe = onValue(
      nudgeRef,
      (snapshot) => {
        const val = snapshot.val();
        setLastNudge(val || null);
        setLoading(false);
      },
      (err) => {
        console.error('Nudge dinleme hatası:', err);
        setLoading(false);
      }
    );

    return () => off(nudgeRef);
  }, [householdId]);

  return { lastNudge, loading };
}
