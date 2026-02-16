import { doc, getDoc } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { auth, db } from "../app/(tabs)/firebaseConfig";
import {
    createHousehold,
    getMyHouseholdId,
    joinHousehold,
    useHouseholdData,
    useSyncPetData,
} from "../services/firebaseHelper";
import ModernAlert, { type ModernAlertButton } from "../src/components/ModernAlert";
import ModernButton from "../src/components/ModernButton";
import { THEME_COLORS } from "../src/constants";
import { styles } from "../src/styles";
import { UserData } from "../src/types";

const theme = THEME_COLORS[0];

export interface PartnerPairingScreenProps {
  onClose?: () => void;
  onHouseholdChange?: (householdId: string | null) => void;
  t?: Record<string, any>;
  themeCard?: string;
  themeText?: string;
  actionColor?: string;
  darkMode?: boolean;
}

const defaultT: Record<string, string> = {
  coupleModeTitle: "Çift Modu",
  coupleModeSubtitle: "Partnerinizle ortak bir evcil hayvan paylaşın.",
  createInviteCode: "Davet Kodu Oluştur",
  createInviteDesc: "Davet kodunu partnerinizle paylaşın; kodla eve katılsın.",
  joinWithCode: "Davet kodu ile katıl",
  joinWithCodeDesc: "Partnerinizin verdiği 6 haneli kodu girin.",
  join: "Katıl",
  yourInviteCode: "Davet kodunuz",
  shareCodeHint: "Bu kodu partnerinizle paylaşın; eşleşene kadar bekleyin.",
  yourPartner: "Partnerin",
  sharedPet: "Ortak hayvanınız",
  loading: "Yükleniyor...",
  signInToPair: "Partnerinizle eşleşmek için giriş yapmalısınız.",
  partnerDefaultName: "Eş",
  level: "Seviye",
  hunger: "Açlık",
  inviteCodePlaceholder: "000000",
  alertWarning: "Uyarı",
  alertError: "Hata",
  cancel: "Vazgeç",
};

export default function PartnerPairingScreen({
  onClose,
  onHouseholdChange,
  t: tProp,
  themeCard = "#ffffff",
  themeText = "#2d3748",
  actionColor = theme.main,
  darkMode = false,
}: PartnerPairingScreenProps) {
  const t = (tProp ?? defaultT) as Record<string, string>;
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [loadingHousehold, setLoadingHousehold] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [alertState, setAlertState] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons?: ModernAlertButton[];
  }>({ visible: false, title: "", message: "" });

  const showAlert = useCallback(
    (title: string, message: string, buttons?: ModernAlertButton[]) => {
      const safeButtons =
        buttons && buttons.length > 0
          ? buttons
          : [{ text: t.cancel || "OK", variant: "primary" as const }];
      setAlertState({ visible: true, title, message, buttons: safeButtons });
    },
    [t.cancel]
  );
  const closeAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, visible: false }));
  }, []);

  const { householdData, loading: householdLoading } = useHouseholdData(householdId);
  const { petData, loading: petLoading } = useSyncPetData(householdId);

  const currentUserId = auth.currentUser?.uid ?? null;
  const memberIds = householdData?.members ? Object.keys(householdData.members) : [];
  const otherMemberId = memberIds.find((id) => id !== currentUserId) ?? null;
  const hasPartner = memberIds.length >= 2;

  const refreshHouseholdId = useCallback(async () => {
    setLoadingHousehold(true);
    try {
      const id = await getMyHouseholdId();
      setHouseholdId(id);
    } finally {
      setLoadingHousehold(false);
    }
  }, []);

  useEffect(() => {
    refreshHouseholdId();
  }, [refreshHouseholdId]);

  useEffect(() => {
    if (!otherMemberId) {
      setPartnerName(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const userSnap = await getDoc(doc(db, "users", otherMemberId));
        if (cancelled) return;
        const data = userSnap.data() as UserData | undefined;
        setPartnerName(data?.username ?? t.partnerDefaultName);
      } catch {
        if (!cancelled) setPartnerName(t.partnerDefaultName);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [otherMemberId, t.partnerDefaultName]);

  const handleCreateHousehold = async () => {
    if (!auth.currentUser) {
      showAlert(t.alertWarning, t.signInToPair);
      return;
    }
    setActionLoading(true);
    try {
      const { householdId: newId } = await createHousehold();
      setHouseholdId(newId);
      onHouseholdChange?.(newId);
    } catch (e) {
      showAlert(t.alertError, e instanceof Error ? e.message : "");
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinHousehold = async () => {
    const code = inviteCodeInput.trim().replace(/\s/g, "");
    if (code.length !== 6) {
      showAlert(t.alertWarning, "6");
      return;
    }
    if (!auth.currentUser) {
      showAlert(t.alertWarning, t.signInToPair);
      return;
    }
    setActionLoading(true);
    try {
      const newId = await joinHousehold(code);
      setHouseholdId(newId);
      setInviteCodeInput("");
      onHouseholdChange?.(newId);
    } catch (e) {
      showAlert(t.alertError, e instanceof Error ? e.message : "");
    } finally {
      setActionLoading(false);
    }
  };

  const bgColor = darkMode ? "#18181b" : theme.bg;
  const subTextColor = darkMode ? "#a1a1aa" : "#666";

  if (loadingHousehold) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: bgColor }}>
        <ActivityIndicator size="large" color={actionColor} />
        <Text allowFontScaling={false} style={{ marginTop: 12, fontSize: 16, color: themeText }}>{t.loading}</Text>
      </View>
    );
  }

  if (!auth.currentUser) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: bgColor }}>
        <Text allowFontScaling={false} style={{ fontSize: 18, fontWeight: "700", color: themeText, textAlign: "center" }}>
          {t.signInToPair}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: bgColor }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollGrowPadded, { paddingTop: 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text allowFontScaling={false} style={[styles.titleModern1, { color: themeText, marginBottom: 8 }]}>
          {t.coupleModeTitle}
        </Text>
        <Text allowFontScaling={false} style={[styles.subtitle, { color: themeText, opacity: 0.9, marginBottom: 24 }]}>
          {t.coupleModeSubtitle}
        </Text>

        {!householdId ? (
          <>
            <View style={[styles.sectionCard, { backgroundColor: themeCard, marginBottom: 20 }]}>
              <Text allowFontScaling={false} style={[styles.sectionTitle, { color: themeText }]}>{t.createInviteCode}</Text>
              <Text allowFontScaling={false} style={{ fontSize: 14, color: darkMode ? "#a1a1aa" : "#666", marginBottom: 16 }}>
                {t.createInviteDesc}
              </Text>
              <ModernButton
                title={t.createInviteCode}
                onPress={handleCreateHousehold}
                color={actionColor}
                disabled={actionLoading}
              />
            </View>

            <View style={[styles.sectionCard, { backgroundColor: themeCard }]}>
              <Text allowFontScaling={false} style={[styles.sectionTitle, { color: themeText }]}>{t.joinWithCode}</Text>
              <Text allowFontScaling={false} style={{ fontSize: 14, color: darkMode ? "#a1a1aa" : "#666", marginBottom: 12 }}>
                {t.joinWithCodeDesc}
              </Text>
              <TextInput
                allowFontScaling={false}
                style={[
                  styles.inputModern,
                  {
                    backgroundColor: darkMode ? "#333" : "#f3f4f6",
                    borderWidth: 2,
                    borderColor: darkMode ? "#444" : "rgba(0,0,0,0.06)",
                    color: themeText,
                  },
                ]}
                placeholder={t.inviteCodePlaceholder}
                placeholderTextColor="#9ca3af"
                value={inviteCodeInput}
                onChangeText={setInviteCodeInput}
                maxLength={6}
                keyboardType="number-pad"
              />
              <ModernButton
                title={t.join}
                onPress={handleJoinHousehold}
                color={actionColor}
                disabled={actionLoading}
              />
            </View>
          </>
        ) : (
          <>
            {householdData?.inviteCode && !hasPartner && (
              <View style={[styles.sectionCard, { backgroundColor: themeCard, marginBottom: 20 }]}>
                <Text allowFontScaling={false} style={[styles.sectionTitle, { color: themeText }]}>{t.yourInviteCode}</Text>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: 28,
                    fontWeight: "800",
                    letterSpacing: 6,
                    color: actionColor,
                    textAlign: "center",
                    marginVertical: 12,
                  }}
                >
                  {householdData.inviteCode}
                </Text>
                <Text allowFontScaling={false} style={{ fontSize: 13, color: darkMode ? "#a1a1aa" : "#666", textAlign: "center" }}>
                  {t.shareCodeHint}
                </Text>
              </View>
            )}

            {hasPartner && partnerName && (
              <View style={[styles.sectionCard, { backgroundColor: themeCard, marginBottom: 16 }]}>
                <Text allowFontScaling={false} style={[styles.sectionTitle, { color: themeText }]}>{t.yourPartner}</Text>
                <Text allowFontScaling={false} style={{ fontSize: 20, fontWeight: "700", color: actionColor }}>
                  {partnerName}
                </Text>
              </View>
            )}

            {(petLoading || householdLoading) && !petData ? (
              <View style={[styles.sectionCard, { backgroundColor: themeCard, alignItems: "center", padding: 32 }]}>
                <ActivityIndicator size="large" color={actionColor} />
                <Text allowFontScaling={false} style={{ marginTop: 12, color: themeText }}>{t.loading}</Text>
              </View>
            ) : petData ? (
              <View style={[styles.petCard, { backgroundColor: themeCard, padding: 20 }]}>
                <Text allowFontScaling={false} style={[styles.sectionTitle, { color: themeText, marginBottom: 8 }]}>
                  {t.sharedPet}
                </Text>
                <Text allowFontScaling={false} style={{ fontSize: 22, fontWeight: "800", color: actionColor }}>
                  {petData.name}
                </Text>
                <View style={{ flexDirection: "row", marginTop: 12, gap: 16 }}>
                  <Text allowFontScaling={false} style={{ fontSize: 14, color: darkMode ? "#a1a1aa" : "#666" }}>{t.level} {petData.level}</Text>
                  <Text allowFontScaling={false} style={{ fontSize: 14, color: darkMode ? "#a1a1aa" : "#666" }}>XP: {petData.xp}</Text>
                  <Text allowFontScaling={false} style={{ fontSize: 14, color: darkMode ? "#a1a1aa" : "#666" }}>{t.hunger}: %{petData.hunger}</Text>
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
      <ModernAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onClose={closeAlert}
        themeCard={themeCard}
        themeText={themeText}
        themeSubText={subTextColor}
        actionColor={actionColor}
      />
    </KeyboardAvoidingView>
  );
}
