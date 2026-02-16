import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as Notifications from "expo-notifications";
import { CalendarBlank, CheckSquare, FlowerLotus, GearSix, House } from "phosphor-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, AppState, BackHandler, KeyboardAvoidingView, Linking, Modal, Platform, SafeAreaView, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import RNModal from "react-native-modal";
import PagerView from "react-native-pager-view";

// --- IMPORTS ---
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { addDoc, collection, doc, getDoc, increment, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { getMyHouseholdId, sendNudge, useHouseholdData, useNudgeListener, usePartnerPetData } from "../../services/firebaseHelper";
import { ErrorBoundary } from "../../src/components/ErrorBoundary";
import { QuickTaskObject } from "../../src/types/components";
import { isNetworkError, updateNetworkState } from "../../src/utils/network";
import { auth, db } from "./firebaseConfig";

// LOCAL IMPORTS
import ModernAlert, { type ModernAlertButton } from "../../src/components/ModernAlert";
import ModernButton from "../../src/components/ModernButton";
import PatternBackground from "../../src/components/PatternBackground";
import PetPreview from "../../src/components/PetPreview";
import Toast from "../../src/components/Toast";
import { CURRENT_APP_VERSION, monthNamesEn, monthNamesTr, REVENUECAT_API_KEY, SKUS, STORAGE_KEYS, STORE_URL, THEME_COLORS, TRANSLATIONS, weekdayShortEn, weekdayShortTr } from "../../src/constants";
import { styles } from "../../src/styles";
import { Pet, PetType, Task, TaskRepeatType, UserData } from "../../src/types";
import { buildMonthGrid, buildReminderDateTime, formatTime, generateTwoRandomDateTimesWithinAWeek, isVersionLess } from "../../src/utils";

// NEW TABS IMPORTS
import PartnerPairingScreen from "../../screens/PartnerPairingScreen";
import CalendarTab from "../../src/tabs/CalendarTab";
import HomeTab from "../../src/tabs/HomeTab";
import SettingsTab from "../../src/tabs/SettingsTab";
import TasksTab from "../../src/tabs/TasksTab";
import GardenScreen from "./garden";

const PenguinAsset = require("../../assets/images/penguinn.png");

// Notifications Setup
Notifications.setNotificationHandler({ 
  handleNotification: async () => ({ 
    shouldShowAlert: true, 
    shouldPlaySound: false, 
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }), 
});
async function registerForPushNotificationsAsync() { 
  try { 
    const { status: existingStatus } = await Notifications.getPermissionsAsync(); 
    if (existingStatus !== "granted") await Notifications.requestPermissionsAsync(); 
  } catch (e) { 
    console.log("Bildirim izni hatası", e); 
  } 
}
async function scheduleAlarm(when: Date, title: string, body: string) { 
  try { 
    await Notifications.scheduleNotificationAsync({ 
      content: { title, body, sound: true }, 
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when }, 
    }); 
  } catch (e) { 
    console.log("Bildirim zamanlama hatası", e); 
  } 
}
async function scheduleWeeklyRandomReminders() { 
  try { 
    const tsRaw = await AsyncStorage.getItem(STORAGE_KEYS.WEEKLY_RANDOM_TS); 
    if (tsRaw) { 
      const { until } = JSON.parse(tsRaw); 
      if (until && until > Date.now()) return; 
    } 
    const times = generateTwoRandomDateTimesWithinAWeek(); 
    const ids: string[] = []; 
    for (const t of times) { 
      const seconds = Math.max(5, Math.round((t.getTime() - Date.now()) / 1000)); 
      const id = await Notifications.scheduleNotificationAsync({ 
        content: { title: "Evciline mama verdin mi?", body: "Evcil dostun mama bekliyor!" }, 
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, repeats: false }, 
      }); 
      ids.push(id); 
    } 
    await AsyncStorage.setItem(STORAGE_KEYS.WEEKLY_RANDOM_IDS, JSON.stringify(ids)); 
    await AsyncStorage.setItem(STORAGE_KEYS.WEEKLY_RANDOM_TS, JSON.stringify({ until: Date.now() + 7 * 24 * 60 * 60 * 1000 })); 
  } catch {} 
}

export default function Index() {
  const [language, setLanguage] = useState<'tr' | 'en'>('tr');
  const t = TRANSLATIONS[language];
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [simpleMode, setSimpleMode] = useState<boolean>(false); 
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true); 
  const [themeColorKey, setThemeColorKey] = useState<string>("mavi"); 
  const selectedTheme = useMemo(() => THEME_COLORS.find((t) => t.key === themeColorKey) || THEME_COLORS[0], [themeColorKey]);
  const [hydrated, setHydrated] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState(""); 
  const [selectedType, setSelectedType] = useState<Task["type"]>("orta");
  const [selectedRepeat, setSelectedRepeat] = useState<TaskRepeatType>("none");
  const [pet, setPet] = useState<Pet>({ type: "cat", age: 0, mama: 0, name: "Sonny" });
  const [page, setPage] = useState(1); 
  const pagerRef = useRef<PagerView>(null); 
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPetTypeModal, setShowPetTypeModal] = useState(false);
  const [showColorOnboardModal, setShowColorOnboardModal] = useState(false); 
  const [chosenPetType, setChosenPetType] = useState<PetType | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [petNameInput, setPetNameInput] = useState("");
  const [settingsPetName, setSettingsPetName] = useState(pet.name);
  const [hasUnlimitedNameChange, setHasUnlimitedNameChange] = useState(false);
  const [freeNameChangeUsed, setFreeNameChangeUsed] = useState(false); 
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserData | null>(null); 
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authUsername, setAuthUsername] = useState(""); 
  const [isRegistering, setIsRegistering] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [timerVisible, setTimerVisible] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [linkedTaskId, setLinkedTaskId] = useState<string | null>(null);
  const timerTargetEndRef = useRef<number | null>(null);
  const appStateRef = useRef<string>(AppState.currentState);
  const now = new Date();
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDay, setReminderDay] = useState<number>(now.getDate());
  const [reminderMonth, setReminderMonth] = useState<number>(now.getMonth() + 1);
  const [reminderYear, setReminderYear] = useState<number>(now.getFullYear());
  const [reminderHour, setReminderHour] = useState<number>(now.getHours());
  const [reminderMinute, setReminderMinute] = useState<number>(Math.floor(now.getMinutes() / 5) * 5);
  const [quickTaskText, setQuickTaskText] = useState("");
  const [calendarQuickTaskText, setCalendarQuickTaskText] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [lastAction, setLastAction] = useState<{ type: 'complete' | 'delete'; task: Task; previousPet?: Pet } | null>(null);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [supportLoading, setSupportLoading] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [alertState, setAlertState] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons?: ModernAlertButton[];
  }>({ visible: false, title: "", message: "" });
  // Couple Mode (household + partner)
  const [coupleHouseholdId, setCoupleHouseholdId] = useState<string | null>(null);
  const [couplePartnerName, setCouplePartnerName] = useState<string | null>(null);
  const { householdData: coupleHouseholdData } = useHouseholdData(coupleHouseholdId);
  const coupleMemberIds = coupleHouseholdData?.members
    ? Object.keys(coupleHouseholdData.members)
    : [];
  const coupleHasPartner = coupleMemberIds.length >= 2;
  const otherMemberId =
    user && coupleMemberIds.length
      ? coupleMemberIds.find((id) => id !== user.uid) ?? null
      : null;
  const [showPartnerScreen, setShowPartnerScreen] = useState(false);
  const [showBuyCoinsModal, setShowBuyCoinsModal] = useState(false);
  
  // Couple Mode v2: Partner pet & nudge
  const { partnerPet, loading: partnerPetLoading } = usePartnerPetData(otherMemberId);
  const { lastNudge } = useNudgeListener(coupleHouseholdId);
  const [lastSeenNudgeAt, setLastSeenNudgeAt] = useState<number>(0);
  const [showNudgeToast, setShowNudgeToast] = useState(false);

  const themeBg = darkMode ? "#18181b" : selectedTheme.bg; 
  const themeCard = darkMode ? "#27272a" : "#ffffff";
  const themeText = darkMode ? "#ffffff" : "#2d3748";
  const themeSubText = darkMode ? "#a1a1aa" : "#718096";
  const actionColor = selectedTheme.main;
  const monthNames = language === 'tr' ? monthNamesTr : monthNamesEn;
  const weekdayShort = language === 'tr' ? weekdayShortTr : weekdayShortEn;
  const mamaValues: Record<Task["type"], number> = { küçük: 2, orta: 4, büyük: 6, özel: 10 };
  const hungerWeights: Record<Task["type"], number> = { küçük: 1, orta: 1.5, büyük: 2, özel: 3 };
  const dailyHungerTarget = 8;
  const todayKey = new Date().toLocaleDateString("tr-TR");
  const petOptions = useMemo(
    () => [
      {
        id: "cat" as PetType,
        name: t.cat,
        type: "lottie" as const,
        source: require("../../assets/animations/cat_neutral.json"),
      },
      {
        id: "dog" as PetType,
        name: t.dog,
        type: "lottie" as const,
        source: require("../../assets/animations/dog_neutral.json"),
      },
      {
        id: "penguin" as PetType,
        name: t.penguin || "Penguin",
        type: "image" as const,
        source: PenguinAsset,
      },
    ],
    [t]
  );
  const showAlert = useCallback(
    (title: string, message: string, buttons?: ModernAlertButton[]) => {
      const safeButtons =
        buttons && buttons.length > 0
          ? buttons
          : [{ text: t.alertOk || "OK", variant: "primary" as const }];
      setAlertState({ visible: true, title, message, buttons: safeButtons });
    },
    [t.alertOk]
  );
  const closeAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, visible: false }));
  }, []);
  const hungerPercent = useMemo(() => {
    const completedWeighted = tasks.reduce((sum, task) => {
      if (!task.done) return sum;
      if (task.date !== todayKey) return sum;
      return sum + (hungerWeights[task.type] ?? 1);
    }, 0);
    return Math.min(100, Math.round((completedWeighted / dailyHungerTarget) * 100));
  }, [tasks, todayKey, hungerWeights, dailyHungerTarget]);

  useEffect(() => {
    (async () => {
      const storedTasks = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      if (storedTasks) setTasks(JSON.parse(storedTasks).sort((a:Task, b:Task) => (a.order ?? 0) - (b.order ?? 0)));
      const storedPet = await AsyncStorage.getItem(STORAGE_KEYS.PET);
      if (storedPet) { const p = JSON.parse(storedPet); const safeType: PetType = p.type === "dog" || p.type === "penguin" ? p.type : "cat"; setPet({ type: safeType, age: typeof p.age === "number" ? p.age : 0, mama: typeof p.mama === "number" ? p.mama : 0, name: typeof p.name === "string" && p.name ? p.name : "Sonny" }); }
      const savedDM = await AsyncStorage.getItem(STORAGE_KEYS.DARKMODE); if (savedDM !== null) setDarkMode(savedDM === "true");
      const savedSimpleMode = await AsyncStorage.getItem(STORAGE_KEYS.SIMPLE_MODE); if (savedSimpleMode !== null) setSimpleMode(savedSimpleMode === "true");
      const savedSoundEnabled = await AsyncStorage.getItem(STORAGE_KEYS.SOUND_ENABLED); if (savedSoundEnabled !== null) setSoundEnabled(savedSoundEnabled === "true");
      const colorKey = await AsyncStorage.getItem(STORAGE_KEYS.COLOR_THEME); if (colorKey && THEME_COLORS.find((x) => x.key === colorKey)) setThemeColorKey(colorKey); else if (!colorKey) await AsyncStorage.setItem(STORAGE_KEYS.COLOR_THEME, "mavi");
      const savedLang = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE); if (savedLang === 'en' || savedLang === 'tr') setLanguage(savedLang);
      const ptype = await AsyncStorage.getItem(STORAGE_KEYS.PET_TYPE);
      const colorShown = await AsyncStorage.getItem(STORAGE_KEYS.COLOR_ONBOARD_SHOWN);
      const onboardShown = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARD_SHOWN);
      if (!ptype) setShowPetTypeModal(true); else if (!colorShown) setShowColorOnboardModal(true); else if (!onboardShown) setShowOnboarding(true);
      const savedNamePurchase = await AsyncStorage.getItem(STORAGE_KEYS.PURCHASE_UNLIMITED_NAME); if (savedNamePurchase === 'true') setHasUnlimitedNameChange(true);
      const savedFreeNameUsed = await AsyncStorage.getItem(STORAGE_KEYS.FREE_NAME_CHANGE_USED); if (savedFreeNameUsed === 'true') setFreeNameChangeUsed(true);
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    const checkForUpdate = async () => { try { const docRef = doc(db, "config", "app_settings"); const docSnap = await getDoc(docRef); if (docSnap.exists()) { const data = docSnap.data(); if (data.min_version && isVersionLess(CURRENT_APP_VERSION, data.min_version)) setShowUpdateModal(true); } } catch (err) {} };
    checkForUpdate();
  }, []);

  // Kullanıcı giriş yaptığında kendi household ID'sini al
  useEffect(() => {
    if (!user) {
      setCoupleHouseholdId(null);
      setCouplePartnerName(null);
      return;
    }
    (async () => {
      try {
        const id = await getMyHouseholdId();
        setCoupleHouseholdId(id);
      } catch (e) {
        console.log("Household fetch error", e);
      }
    })();
  }, [user]);

  // Partner adını Firestore'dan getir
  useEffect(() => {
    if (!otherMemberId) {
      setCouplePartnerName(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", otherMemberId));
        if (cancelled) return;
        const data = snap.data() as UserData | undefined;
        const fallback =
          (t.partnerDefaultName as string | undefined) ||
          (TRANSLATIONS[language].partnerDefaultName as string | undefined) ||
          "Eş";
        setCouplePartnerName(data?.username ?? fallback);
      } catch {
        if (!cancelled) {
          const fallback =
            (t.partnerDefaultName as string | undefined) ||
            (TRANSLATIONS[language].partnerDefaultName as string | undefined) ||
            "Eş";
          setCouplePartnerName(fallback);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [otherMemberId, language, t]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) { setAuthModalVisible(false); try { const docRef = doc(db, "users", currentUser.uid); const docSnap = await getDoc(docRef); if (docSnap.exists()) setUserDoc(docSnap.data() as UserData); } catch(e) {} } 
      else { const isGuest = await AsyncStorage.getItem(STORAGE_KEYS.IS_GUEST); if (isGuest !== 'true') setAuthModalVisible(true); setUserDoc(null); }
    });
    return unsubscribe;
  }, []);


  const handleAuth = useCallback(async () => {
    if (!authEmail || !authPassword) { showAlert(t.alertWarning, "Email ve şifre boş olamaz."); return; }
    if (isRegistering && !authUsername.trim()) { showAlert(t.alertWarning, t.alertUsernameEmpty); return; }
    setAuthLoading(true);
    try {
      if (isRegistering) { 
        const cred = await createUserWithEmailAndPassword(auth, authEmail, authPassword); 
        const newUserData: UserData = { uid: cred.user.uid, username: authUsername.trim(), totalMama: pet.mama, isSponsor: false }; 
        await setDoc(doc(db, "users", cred.user.uid), newUserData); 
        setUserDoc(newUserData); 
        showAlert(t.alertSuccess, t.authSuccess); 
      } else { 
        await signInWithEmailAndPassword(auth, authEmail, authPassword); 
        showAlert(t.alertSuccess, t.authSuccess); 
      }
      setAuthEmail(""); setAuthPassword(""); setAuthUsername("");
      updateNetworkState(true);
    } catch (error: unknown) { 
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (isNetworkError(error)) {
        updateNetworkState(false);
        showAlert(t.alertError, "İnternet bağlantınızı kontrol edin.");
      } else {
        showAlert(t.alertError, t.authError + errorMessage); 
      }
    } finally { setAuthLoading(false); }
  }, [authEmail, authPassword, authUsername, isRegistering, pet.mama, t]);

  const handleLogout = useCallback(async () => { 
    try { 
      await signOut(auth); 
    } catch (error: unknown) {
      console.error('Logout error:', error);
    }
  }, []);
  const handleGuestMode = async () => { await AsyncStorage.setItem(STORAGE_KEYS.IS_GUEST, "true"); setAuthModalVisible(false); };
  const triggerAuthNudge = async () => { if (!user) { const chance = Math.random(); if (chance < 0.2) setAuthModalVisible(true); } };

  useEffect(() => {
    const setupPurchases = async () => {
      Purchases.configure({ apiKey: REVENUECAT_API_KEY });
      let appUserID = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      if (user) { appUserID = user.uid; } else if (!appUserID) { appUserID = 'petfeeder_' + Date.now() + Math.random(); await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, appUserID); }
      Purchases.logIn(appUserID);
      Purchases.addCustomerInfoUpdateListener(async (customerInfo) => {
        if (customerInfo.entitlements.active['sinirsiz_isim']) { await AsyncStorage.setItem(STORAGE_KEYS.PURCHASE_UNLIMITED_NAME, 'true'); setHasUnlimitedNameChange(true); }
      });
      try { const offerings = await Purchases.getOfferings(); if (offerings.current && offerings.current.availablePackages.length > 0) setPackages(offerings.current.availablePackages); } catch (e) {}
    };
    setupPurchases();
  }, [user]); 

  useEffect(() => { if (pet.name) setSettingsPetName(pet.name); }, [pet.name]);
  useEffect(() => { AsyncStorage.setItem(STORAGE_KEYS.DARKMODE, darkMode ? "true" : "false"); }, [darkMode]);
  useEffect(() => { AsyncStorage.setItem(STORAGE_KEYS.SIMPLE_MODE, simpleMode ? "true" : "false"); }, [simpleMode]);
  useEffect(() => { AsyncStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, soundEnabled ? "true" : "false"); }, [soundEnabled]);
  useEffect(() => { AsyncStorage.setItem(STORAGE_KEYS.COLOR_THEME, themeColorKey); }, [themeColorKey]);
  useEffect(() => { AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language); }, [language]);
  useEffect(() => { if (hydrated) AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks)).catch(() => {}); }, [tasks, hydrated]);
  useEffect(() => { 
    if (hydrated) {
      AsyncStorage.setItem(STORAGE_KEYS.PET, JSON.stringify(pet)).catch(() => {});
      // Sync pet to Firestore for couple mode
      if (user) {
        updateDoc(doc(db, "users", user.uid), { pet }).catch(() => {});
      }
    }
  }, [pet, hydrated, user]);
  useEffect(() => { registerForPushNotificationsAsync(); scheduleWeeklyRandomReminders(); }, []);

  const büyümeHedefi = (pet.age + 1) * 50;
  const progressPercent = Math.min((pet.mama / büyümeHedefi) * 100, 100);

  useEffect(() => {
    const ratio = Math.min((pet.mama / büyümeHedefi) * 100, 100);
    Animated.timing(progressAnim, { toValue: ratio, duration: 400, useNativeDriver: false }).start();
    if (ratio >= 100) { 
      if (!simpleMode) setConfetti(true); 
      const timeoutId = setTimeout(() => setConfetti(false), 3000); 
      return () => clearTimeout(timeoutId); 
    }
  }, [pet.mama, büyümeHedefi, simpleMode]);

  useEffect(() => { 
    let interval: ReturnType<typeof setInterval> | null = null; 
    if (timerRunning && timerSeconds > 0) { 
      interval = setInterval(() => { 
        setTimerSeconds((prev) => { 
          if (prev <= 1) { 
            if (interval) clearInterval(interval); 
            setTimerRunning(false); 
            setMinimized(false); 
            timerTargetEndRef.current = null; 
            return 0; 
          } 
          return prev - 1; 
        }); 
      }, 1000); 
    } 
    return () => { 
      if (interval) clearInterval(interval); 
    }; 
  }, [timerRunning, timerSeconds]);
  useEffect(() => { const sub = AppState.addEventListener("change", (nextState) => { const prevState = appStateRef.current; appStateRef.current = nextState; if (prevState.match(/active/) && nextState.match(/inactive|background/) && timerRunning) { timerTargetEndRef.current = Date.now() + timerSeconds * 1000; } else if (prevState.match(/inactive|background/) && nextState === "active") { if (timerTargetEndRef.current && timerRunning) { const diff = Math.round((timerTargetEndRef.current - Date.now()) / 1000); if (diff <= 0) { setTimerSeconds(0); setTimerRunning(false); timerTargetEndRef.current = null; } else { setTimerSeconds(diff); } } } }); return () => sub.remove();   }, [timerRunning, timerSeconds]);
  useEffect(() => { const backAction = () => { if (page !== 0) { pagerRef.current?.setPage(0); return true; } return false; }; const handler = BackHandler.addEventListener("hardwareBackPress", backAction); return () => handler.remove(); }, [page]);
  
  // Nudge listener - partner'dan high-five geldiğinde toast göster
  useEffect(() => {
    if (!lastNudge || !user) return;
    if (lastNudge.by === user.uid) return; // Kendi gönderdiğim nudge
    if (lastNudge.at <= lastSeenNudgeAt) return; // Daha önce görüldü
    
    setLastSeenNudgeAt(lastNudge.at);
    setShowNudgeToast(true);
    if (soundEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const timer = setTimeout(() => setShowNudgeToast(false), 3000);
    return () => clearTimeout(timer);
  }, [lastNudge, user, lastSeenNudgeAt, soundEnabled]);

  const playSound = async (which: PetType) => { if (!soundEnabled) return; if (which === "penguin") return; try { const file = which === "dog" ? require("../../assets/sounds/bark_short.mp3") : require("../../assets/sounds/meow_short.mp3"); const { sound } = await Audio.Sound.createAsync(file); await sound.playAsync(); setTimeout(() => sound.unloadAsync(), 900); } catch (e) {} };

  const addTask = useCallback((quickTextOrObj?: string | QuickTaskObject, quickDate?: string) => {
    let text = newTaskText.trim(); 
    let desc = newTaskDescription.trim(); 
    let type = selectedType; 
    let repeat = selectedRepeat; 
    let dateStr = new Date().toLocaleDateString("tr-TR");
    let dateFromInput = false;
    
    if (typeof quickTextOrObj === 'string') { 
      text = quickTextOrObj; 
      if (quickDate) { dateStr = quickDate; dateFromInput = true; } 
    } else if (quickTextOrObj && typeof quickTextOrObj === 'object') { 
      text = quickTextOrObj.text; 
      if(quickTextOrObj.date) { dateStr = quickTextOrObj.date; dateFromInput = true; } 
      if(quickTextOrObj.type) type = quickTextOrObj.type; 
      if(quickTextOrObj.repeat) repeat = quickTextOrObj.repeat; 
    }
    
    if (!text) { showAlert(t.alertWarning, t.alertTaskEmpty); return; }
    const mamaValue = mamaValues[type] || 4; 
    const remindDate = reminderEnabled ? buildReminderDateTime(reminderDay, reminderMonth, reminderYear, reminderHour, reminderMinute) : undefined; 
    if (remindDate && !dateFromInput) {
      dateStr = remindDate.toLocaleDateString("tr-TR");
    }
    const remindDateTime = remindDate ? remindDate.getTime() : undefined;
    const tsk: Task = { 
      id: Date.now().toString(), 
      text: text, 
      description: desc, 
      done: false, 
      mamaValue, 
      type, 
      date: dateStr, 
      order: tasks.length, 
      repeat, 
      remindAt: remindDateTime, 
    };
    if (remindDate && remindDate.getTime() > Date.now()) { 
      scheduleAlarm(remindDate, t.appName, `${tsk.text} 🐾`); 
    }
    setTasks((s) => [tsk, ...s]); 
    setNewTaskText(""); 
    setNewTaskDescription(""); 
    setSelectedRepeat("none"); 
    setReminderEnabled(false); 
    setShowAddModal(false); 
    triggerAuthNudge();
  }, [newTaskText, newTaskDescription, selectedType, selectedRepeat, reminderEnabled, reminderDay, reminderMonth, reminderYear, reminderHour, reminderMinute, tasks.length, t]);

  const completeTask = useCallback(async (id: string) => {
    setTasks((prev) => {
      const original = prev.find((p) => p.id === id); 
      if (!original || original.done) return prev;
      const updated = prev.map((t) => (t.id === id ? { ...t, done: true } : t));
      const mamaKazan = original.mamaValue;
      const newMama = pet.mama + mamaKazan; 
      const currentBüyümeHedefi = (pet.age + 1) * 50; 
      let newAge = pet.age; 
      let updatedMama = newMama;
      if (newMama >= currentBüyümeHedefi) { 
        newAge += 1; 
        updatedMama = newMama - currentBüyümeHedefi; 
      }
      const updatedPet = { ...pet, mama: updatedMama, age: newAge }; 
      
      // Son işlemi kaydet (geri alma için)
      setLastAction({ type: 'complete', task: original, previousPet: pet });
      setToastMessage(t.toastTaskCompleted);
      setToastVisible(true);
      
      // Kalp animasyonunu tetikle
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 1200);
      
      setPet(updatedPet); 
      if (newAge > pet.age) {
        const msg = (t.ageUpMsg as string).replace("{age}", String(newAge));
        showAlert(t.ageUpTitle as string, msg);
      }
      playSound(pet.type); 
      if(soundEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (user) { 
        try { 
          const userRef = doc(db, "users", user.uid); 
          updateDoc(userRef, { totalMama: increment(mamaKazan) }).catch((err: unknown) => {
            if (isNetworkError(err)) {
              updateNetworkState(false);
            }
            console.error('Firebase update error:', err);
          }); 
        } catch (err: unknown) {
          if (isNetworkError(err)) {
            updateNetworkState(false);
          }
          console.error('Firebase error:', err);
        }
      }
      return updated;
    });
  }, [pet, soundEnabled, user, t]);

  const deleteTask = useCallback((id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    if (taskToDelete) {
      // Son işlemi kaydet (geri alma için)
      setLastAction({ type: 'delete', task: taskToDelete });
      setToastMessage(t.toastTaskDeleted);
      setToastVisible(true);
    }
    setTasks((p) => p.filter((t) => t.id !== id));
  }, [tasks, t]);
  const resetAll = () => {
    showAlert(t.alertWarning, t.alertResetConfirm, [
      { text: t.no, variant: "default" },
      {
        text: t.yes,
        variant: "primary",
        onPress: () => {
          setTasks([]);
          const resetPet: Pet = { type: "cat", age: 0, mama: 0, name: "Sonny" };
          setPet(resetPet);
          AsyncStorage.setItem(STORAGE_KEYS.PET_TYPE, "cat");
          AsyncStorage.setItem(STORAGE_KEYS.PET, JSON.stringify(resetPet));
        },
      },
    ]);
  };
  const handlePetTypeChoose = async () => { const petTypeToSet = chosenPetType ?? "cat"; const petName = petNameInput.trim() || "Sonny"; try { await AsyncStorage.setItem(STORAGE_KEYS.PET_TYPE, petTypeToSet); } catch {} setPet((p) => ({ ...p, type: petTypeToSet, name: petName, age: 0, mama: 0 })); setShowPetTypeModal(false); setShowColorOnboardModal(true); };
  const handleColorChoose = async (colorKey: string) => { setThemeColorKey(colorKey); try { await AsyncStorage.setItem(STORAGE_KEYS.COLOR_ONBOARD_SHOWN, "true"); } catch {} setShowColorOnboardModal(false); setShowOnboarding(true); };
  const closeOnboarding = async () => { try { await AsyncStorage.setItem(STORAGE_KEYS.ONBOARD_SHOWN, "1"); } catch {} setShowOnboarding(false); };
  const openTimerForTask = (taskId: string | null = null, presetSeconds = 25 * 60) => { setLinkedTaskId(taskId); setTimerSeconds(presetSeconds); setTimerRunning(false); setMinimized(false); setTimerVisible(true); };
  const handlePurchase = async (sku: string) => {
    const packageToBuy = packages.find((pkg) => pkg.product.identifier === sku); if (!packageToBuy) { showAlert(t.alertError, "Bu ürün şu an mağazada bulunamıyor."); return; }
    try { const { customerInfo } = await Purchases.purchasePackage(packageToBuy);
    if (customerInfo.entitlements.active['sinirsiz_isim']) { await AsyncStorage.setItem(STORAGE_KEYS.PURCHASE_UNLIMITED_NAME, 'true'); setHasUnlimitedNameChange(true); } } catch (e: any) { if (!e.userCancelled) showAlert(t.alertError, t.alertPurchaseFail); }
  };
  
  const handleSupportMessage = async () => {
    if (!supportMessage.trim()) {
      showAlert(t.alertWarning, t.supportMessageEmpty);
      return;
    }
    setSupportLoading(true);
    try {
      const messageData = {
        message: supportMessage.trim(),
        userId: user?.uid || 'guest',
        username: userDoc?.username || user?.email || 'Misafir Kullanıcı',
        userEmail: user?.email || 'guest@example.com',
        timestamp: serverTimestamp(),
        read: false,
        appVersion: CURRENT_APP_VERSION
      };
      await addDoc(collection(db, "support_messages"), messageData);
      showAlert(t.alertSuccess, t.supportSuccess);
      setSupportMessage("");
      setShowSupportModal(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (isNetworkError(error)) {
        updateNetworkState(false);
        showAlert(t.alertError, "İnternet bağlantınızı kontrol edin.");
      } else {
        showAlert(t.alertError, t.supportError + errorMessage);
      }
    } finally {
      setSupportLoading(false);
    }
  };
  const handleUpdateName = async () => { const newName = settingsPetName.trim() || "Sonny"; setPet(p => ({ ...p, name: newName })); if (!hasUnlimitedNameChange) { setFreeNameChangeUsed(true); await AsyncStorage.setItem(STORAGE_KEYS.FREE_NAME_CHANGE_USED, 'true'); } showAlert(t.alertSuccess, t.alertNameUpdated.replace('{name}', newName)); };
  
  // High-five handler
  const handleHighFive = useCallback(async () => {
    if (!coupleHouseholdId) return;
    try {
      await sendNudge(coupleHouseholdId);
      if (soundEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('High-five gönderilemedi:', error);
    }
  }, [coupleHouseholdId, soundEnabled]);
  
  const today = new Date().toLocaleDateString("tr-TR");
  const todayTasks = useMemo(() => tasks.filter((t) => t.date === today), [tasks, today]);
  const myCompletedToday = useMemo(() => todayTasks.filter(t => t.done).length, [todayTasks]);
  function shiftMonth(delta: number) { let m = currentMonth + delta; let y = currentYear; while (m < 0) { m += 12; y -= 1; } while (m > 11) { m -= 12; y += 1; } setCurrentMonth(m); setCurrentYear(y); }
  const daysSafe = useMemo(() => { try { const arr = buildMonthGrid(currentYear, currentMonth); return Array.isArray(arr) ? arr : []; } catch { return []; } }, [currentYear, currentMonth]);
  const sortTasks = useCallback((a: Task, b: Task) => { 
    if (a.remindAt && !b.remindAt) return -1; 
    if (!a.remindAt && b.remindAt) return 1; 
    if (a.remindAt && b.remindAt) return a.remindAt - b.remindAt; 
    return (a.order ?? 0) - (b.order ?? 0); 
  }, []);

  const handleUndo = () => {
    if (!lastAction) return;
    
    if (lastAction.type === 'delete') {
      // Silinen görevi geri ekle
      setTasks((prev) => {
        const exists = prev.find((t) => t.id === lastAction.task.id);
        if (exists) return prev;
        return [...prev, lastAction.task].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      });
    } else if (lastAction.type === 'complete') {
      // Tamamlanan görevi geri al
      setTasks((prev) => prev.map((t) => (t.id === lastAction.task.id ? { ...t, done: false } : t)));
      
      // Pet durumunu geri al
      if (lastAction.previousPet) {
        setPet(lastAction.previousPet);
        
        // Firebase'den de geri al (eğer kullanıcı giriş yaptıysa)
        if (user) {
          const mamaKazan = lastAction.task.mamaValue;
          try {
            const userRef = doc(db, "users", user.uid);
            updateDoc(userRef, { totalMama: increment(-mamaKazan) }).catch(() => {});
          } catch {}
        }
      }
    }
    
    setLastAction(null);
  };

  // Modern Başlık - Alternatif 2: Gradient Accent Style
  const renderModernHeader = () => {
    if (simpleMode) {
      return <Text style={[styles.title, { color: themeText }]}>{t.simpleModeHeader}</Text>;
    }

    // Hem to-do hem hayvan temasına uygun ikon - modern ve minimalist pati ikonu
    const petTodoIconUrl = "https://cdn-icons-png.flaticon.com/512/194/194279.png";

    return (
      <View style={styles.headerRowClean}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 }}>
          <Image
            source={{ uri: petTodoIconUrl }}
            style={[styles.headerLogo, { tintColor: actionColor, marginTop: 2 }]}
            contentFit="contain"
            transition={200}
          />
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
              <Text allowFontScaling={false} style={[styles.titleModern2, { color: themeText }]}>PetFeeder</Text>
              <Text allowFontScaling={false} style={[styles.titleModern2, { color: actionColor }]}>:To-Do List</Text>
            </View>
            <Text allowFontScaling={false} style={[styles.subtitle, { color: themeSubText }]}>{t.subtitle}</Text>
          </View>
        </View>
        {t.madeBy ? <Text allowFontScaling={false} style={[styles.madeByCentered, { color: themeSubText }]}>{t.madeBy}</Text> : null}
      </View>
    );
  };

  const tabItems = [
    { key: "garden", label: t.navGarden, Icon: FlowerLotus },
    { key: "home", label: t.navHome, Icon: House },
    { key: "tasks", label: t.navTasks, Icon: CheckSquare },
    { key: "calendar", label: t.navCalendar, Icon: CalendarBlank },
    { key: "settings", label: t.navSettings, Icon: GearSix },
  ];
  const visibleTabs = simpleMode
    ? tabItems.filter((item) => item.key !== "garden")
    : tabItems;
  const homeIndex = visibleTabs.findIndex((item) => item.key === "home");
  const Nav = () => (
    <View style={styles.navRow}>
      {visibleTabs.map((item, index) => {
        const active = page === index; const IconComp = item.Icon;
        return ( <TouchableOpacity key={item.key} onPress={() => pagerRef.current?.setPage(index)} style={styles.navBtn} activeOpacity={0.9}> <IconComp size={22} weight={active ? "fill" : "regular"} color={active ? actionColor : themeSubText} /> <Text style={{ fontSize: 10, marginTop: 2, fontWeight: "700", color: active ? actionColor : themeSubText }}>{item.label}</Text> {active && <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: actionColor, marginTop: 3 }} />} </TouchableOpacity> ); 
      })}
    </View>
  );

  const TimerMini = () => { if (!(minimized && timerTargetEndRef.current && timerSeconds > 0)) return null; return ( <TouchableOpacity style={[styles.timerMini, {backgroundColor: actionColor}]} onPress={() => { setTimerVisible(true); setMinimized(false); }} activeOpacity={0.94}> <Text style={styles.timerMiniTitle}>{t.timerRunning}</Text> <Text style={[styles.timerMiniTime, {color: '#fff'}]}>{formatTime(timerSeconds)}</Text> </TouchableOpacity> ); };
  const headerNode = page === homeIndex ? (
    <View style={styles.headerShifted}>
      {renderModernHeader()}
    </View>
  ) : null;
  useEffect(() => {
    const targetIndex = homeIndex >= 0 ? homeIndex : 0;
    if (simpleMode && page !== targetIndex) {
      setPage(targetIndex);
      pagerRef.current?.setPage(targetIndex);
      return;
    }
    if (page >= visibleTabs.length) {
      setPage(targetIndex);
      pagerRef.current?.setPage(targetIndex);
    }
  }, [simpleMode, homeIndex, page, visibleTabs.length]);

  // -- RENDER --
  return (
    <ErrorBoundary>
      <View style={{ flex: 1, backgroundColor: themeBg }}>
        <PatternBackground darkMode={darkMode} color={selectedTheme} />
        <SafeAreaView style={{ flex: 1 }}>
        <Modal visible={showUpdateModal} transparent animationType="slide"> <View style={{flex:1, backgroundColor:'rgba(0,0,0,0.8)', justifyContent:'center', alignItems:'center'}}> <View style={{width:'85%', padding:20, backgroundColor: themeCard, borderRadius:24, alignItems:'center'}}> <Text style={{fontSize:40, marginBottom:10}}>🚀</Text> <Text style={{fontSize:20, fontWeight:'bold', color: themeText, marginBottom:10}}>{t.updateTitle}</Text> <Text style={{textAlign:'center', color:themeSubText, marginBottom:20}}>{t.updateMsg}</Text> <ModernButton title={t.updateBtn} color={actionColor} onPress={() => Linking.openURL(STORE_URL)} style={{width: '100%'}} /> </View> </View> </Modal>
        <Modal visible={showColorOnboardModal} transparent animationType="fade"> <View style={styles.onboardWrap}> <View style={[styles.onboardCard, { alignItems: "center", backgroundColor: themeCard }]}> <Text style={{ fontSize: 21, fontWeight: "800", marginBottom: 10, color: themeText }}>{t.themeSelectTitle}</Text> <Text style={{ marginBottom: 18, textAlign: "center", color: themeSubText }}>{t.themeSelectDesc}</Text> <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}> {THEME_COLORS.map((theme) => ( <TouchableOpacity key={theme.key} style={[styles.themeBubble, { backgroundColor: theme.main, borderColor: themeColorKey === theme.key ? theme.accent : "transparent", borderWidth: themeColorKey === theme.key ? 4 : 0 }]} onPress={() => handleColorChoose(theme.key)} /> ))} </View> </View> </View> </Modal>

        <Modal visible={showPetTypeModal} transparent animationType="fade"> <View style={styles.onboardWrap}> <View style={[styles.onboardCard, { alignItems: "center", backgroundColor: themeCard }]}> <Text style={{ fontWeight: "700", color: themeText, marginBottom: 8 }}>{t.languageSelect}</Text> <View style={{ flexDirection: 'row', marginBottom: 16 }}> <TouchableOpacity onPress={() => setLanguage('tr')} style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: language === 'tr' ? actionColor : 'transparent', borderWidth: 1, borderColor: actionColor, borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}> <Text style={{ color: language === 'tr' ? '#fff' : themeText, fontWeight:'700' }}>TR</Text> </TouchableOpacity> <TouchableOpacity onPress={() => setLanguage('en')} style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: language === 'en' ? actionColor : 'transparent', borderWidth: 1, borderColor: actionColor, borderTopRightRadius: 8, borderBottomRightRadius: 8 }}> <Text style={{ color: language === 'en' ? '#fff' : themeText, fontWeight:'700' }}>EN</Text> </TouchableOpacity> </View> <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8, color: themeText }}>{t.petSelectTitle}</Text> <Text style={{ marginBottom: 12, color: themeSubText }}>{t.petSelectDesc}</Text> <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginBottom: 8 }}> {petOptions.map((option) => { const isLocked = option.id === 'penguin'; return ( <TouchableOpacity key={option.id} style={[styles.petSelect, { padding: 10, borderRadius: 16, marginHorizontal: 4, marginVertical: 4, position: 'relative' }, chosenPetType === option.id && {borderColor: actionColor, backgroundColor: selectedTheme.bg}]} onPress={() => !isLocked && setChosenPetType(option.id)} disabled={isLocked} activeOpacity={isLocked ? 1 : 0.9}> <PetPreview type={option.type} source={option.source} size={64} /> <Text style={{ marginTop: 4, color: themeText, fontSize: 12 }}>{option.name}</Text> {isLocked && ( <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}> <Text style={{ fontSize: 28, marginBottom: 4 }}>🔒</Text> <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{language === 'tr' ? 'Yakında' : 'Coming soon'}</Text> </View> )} </TouchableOpacity> ); })} </View> <Text style={{ marginTop: 12, marginBottom: 8, color: themeSubText, alignSelf: 'flex-start' }}>{t.petNameLabel}</Text> <TextInput placeholder={t.petNameInputPlace} value={petNameInput} onChangeText={setPetNameInput} placeholderTextColor={themeSubText} style={[styles.inputModern, { color: themeText, backgroundColor: darkMode ? '#333' : '#f4f4f5' }]} /> <View style={{marginTop: 16, width: '100%'}}> <ModernButton title={t.continue} onPress={handlePetTypeChoose} color={actionColor} /> </View> </View> </View> </Modal>

        <PagerView style={styles.pager} initialPage={homeIndex >= 0 ? homeIndex : 0} scrollEnabled={true} onPageSelected={e => setPage(e.nativeEvent.position)} keyboardDismissMode="on-drag" ref={pagerRef}>
          {visibleTabs.map((item) => {
            if (item.key === "garden") {
              return (
                <View key="garden" style={styles.page}>
                  <GardenScreen
                    hungerPercent={hungerPercent}
                  />
                  <View style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.75)', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    zIndex: 999
                  }}>
                    <Text style={{ fontSize: 64, marginBottom: 16 }}>🔒</Text>
                    <Text style={{ fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 8 }}>COMING SOON</Text>
                    <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center', paddingHorizontal: 32 }}>
                      Petlerim feature is coming soon!
                    </Text>
                  </View>
                </View>
              );
            }
            if (item.key === "home") {
              return (
                <View key="home" style={styles.page}>
                  <HomeTab
                    header={headerNode}
                    pet={pet} progressPercent={progressPercent} progressAnim={progressAnim} confetti={confetti} simpleMode={simpleMode}
                    hungerPercent={hungerPercent}
                    themeCard={themeCard} themeText={themeText} themeSubText={themeSubText} actionColor={actionColor} t={t}
                    büyümeHedefi={büyümeHedefi}
                    coupleEnabled={!!coupleHouseholdId}
                    coupleHasPartner={coupleHasPartner}
                    couplePartnerName={couplePartnerName}
                    partnerPet={partnerPet}
                    partnerPetLoading={partnerPetLoading}
                    myCompletedToday={myCompletedToday}
                    partnerCompletedToday={0}
                    onHighFive={handleHighFive}
                    setShowAddModal={setShowAddModal} openTimerForTask={openTimerForTask}
                    quickTaskText={quickTaskText} setQuickTaskText={setQuickTaskText} addTask={addTask}
                    todayTasks={todayTasks} completeTask={completeTask} deleteTask={deleteTask} sortTasks={sortTasks}
                    showHeart={showHeart}
                  />
                </View>
              );
            }
            if (item.key === "tasks") {
              return (
                <View key="tasks" style={styles.page}>
                  <TasksTab
                    header={null}
                    tasks={tasks} sortTasks={sortTasks} completeTask={completeTask} deleteTask={deleteTask}
                    themeCard={themeCard} themeText={themeText} themeSubText={themeSubText} actionColor={actionColor} t={t}
                  />
                </View>
              );
            }
            if (item.key === "calendar") {
              return (
                <View key="calendar" style={styles.page}>
                  <CalendarTab
                    header={null}
                    currentMonth={currentMonth} currentYear={currentYear} shiftMonth={shiftMonth} monthNames={monthNames} weekdayShort={weekdayShort} daysSafe={daysSafe}
                    selectedDate={selectedDate} setSelectedDate={setSelectedDate}
                    calendarQuickTaskText={calendarQuickTaskText} setCalendarQuickTaskText={setCalendarQuickTaskText} addTask={addTask}
                    tasks={tasks} completeTask={completeTask} deleteTask={deleteTask}
                    themeCard={themeCard} themeText={themeText} themeSubText={themeSubText} actionColor={actionColor} t={t}
                  />
                </View>
              );
            }
            return (
              <View key="settings" style={styles.page}>
                <SettingsTab
                  header={null}
                  pet={pet}
                  language={language} setLanguage={setLanguage} user={user} userDoc={userDoc} handleLogout={handleLogout}
                  isRegistering={isRegistering} setAuthModalVisible={setAuthModalVisible} setIsRegistering={setIsRegistering}
                  simpleMode={simpleMode} setSimpleMode={setSimpleMode} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled}
                  darkMode={darkMode} setDarkMode={setDarkMode} themeColorKey={themeColorKey} setThemeColorKey={setThemeColorKey}
                  handlePurchase={handlePurchase} hasUnlimitedNameChange={hasUnlimitedNameChange}
                  freeNameChangeUsed={freeNameChangeUsed} settingsPetName={settingsPetName} setSettingsPetName={setSettingsPetName} handleUpdateName={handleUpdateName}
                  setShowSupportModal={setShowSupportModal} setShowPartnerScreen={setShowPartnerScreen} setShowBuyCoinsModal={setShowBuyCoinsModal} THEME_COLORS={THEME_COLORS} SKUS={SKUS} STORAGE_KEYS={STORAGE_KEYS} t={t}
                  themeText={themeText} themeSubText={themeSubText} themeCard={themeCard} actionColor={actionColor} selectedTheme={selectedTheme}
                />
              </View>
            );
          })}
        </PagerView>

        {/* MODALS START */}
        <Modal visible={authModalVisible} transparent animationType="slide">
          <KeyboardAvoidingView 
            style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.5)'}} 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            <ScrollView 
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            >
              <View style={[styles.authCard, { backgroundColor: themeCard }]}>
                <Text style={{ fontSize: 24, fontWeight: "900", marginBottom: 10, color: themeText }}>{t.authTitle}</Text>
                <Text style={{ marginBottom: 20, color: themeSubText }}>{t.authDesc}</Text>
                {isRegistering && (
                  <TextInput 
                    placeholder={t.usernamePlace} 
                    placeholderTextColor={themeSubText} 
                    style={[styles.inputModern, {backgroundColor: darkMode ? '#333' : '#f4f4f5', color: themeText}]} 
                    value={authUsername} 
                    onChangeText={setAuthUsername} 
                  />
                )}
                <TextInput 
                  placeholder={t.emailPlace} 
                  placeholderTextColor={themeSubText} 
                  style={[styles.inputModern, {backgroundColor: darkMode ? '#333' : '#f4f4f5', color: themeText}]} 
                  autoCapitalize="none" 
                  keyboardType="email-address" 
                  value={authEmail} 
                  onChangeText={setAuthEmail} 
                />
                <TextInput 
                  placeholder={t.passPlace} 
                  placeholderTextColor={themeSubText} 
                  style={[styles.inputModern, {backgroundColor: darkMode ? '#333' : '#f4f4f5', color: themeText}]} 
                  secureTextEntry 
                  value={authPassword} 
                  onChangeText={setAuthPassword} 
                />
                {authLoading ? (
                  <ActivityIndicator size="large" color={actionColor} style={{ marginVertical: 10 }} />
                ) : (
                  <View style={{ width: '100%', marginVertical: 10 }}>
                    <ModernButton title={isRegistering ? t.registerBtn : t.loginBtn} color={actionColor} onPress={handleAuth} />
                  </View>
                )}
                <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)} style={{ padding: 10 }}>
                  <Text style={{ color: actionColor, fontWeight: '800' }}>{isRegistering ? t.toggleToLogin : t.toggleToRegister}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleGuestMode} style={{ marginTop: 10 }}>
                  <Text style={{ color: themeSubText, textDecorationLine: 'underline' }}>{t.guestBtn}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
        <RNModal isVisible={showAddModal} onBackdropPress={() => setShowAddModal(false)} style={{margin:0, justifyContent:'flex-end'}}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            style={{ maxHeight: '90%' }}
          >
            <ScrollView 
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              showsVerticalScrollIndicator={true}
            >
              <View style={{ backgroundColor: themeCard, padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
                <Text style={{ fontSize: 20, fontWeight: "900", marginBottom: 16, color: themeText }}>{t.addTaskTitle}</Text>
                <TextInput 
                  placeholder={t.addTaskPlace} 
                  placeholderTextColor="#999" 
                  style={[styles.inputModern, {backgroundColor: darkMode ? '#333' : '#f4f4f5', color: themeText}]} 
                  value={newTaskText} 
                  onChangeText={setNewTaskText} 
                />
                <TextInput 
                  placeholder={t.addDescPlace} 
                  placeholderTextColor="#999" 
                  style={[styles.inputModern, {backgroundColor: darkMode ? '#333' : '#f4f4f5', color: themeText, height: 80, textAlignVertical: 'top'}]} 
                  value={newTaskDescription} 
                  onChangeText={setNewTaskDescription} 
                  multiline={true} 
                />
                <Text style={{ marginBottom: 8, fontWeight:'700', color: themeText }}>{t.taskType}</Text>
                <View style={{ flexDirection: "row", marginBottom: 16 }}>
                  {(['küçük', 'orta', 'büyük', 'özel'] as Task["type"][]).map((typeKey) => (
                    <TouchableOpacity 
                      key={typeKey} 
                      onPress={() => setSelectedType(typeKey)} 
                      style={{ flex: 1, alignItems:'center', justifyContent:'center', padding: 10, borderRadius: 12, backgroundColor: selectedType === typeKey ? actionColor : 'transparent', borderWidth: 2, borderColor: selectedType === typeKey ? actionColor : '#eee', marginRight: 6 }}
                    >
                      <Text style={{ color: selectedType === typeKey ? '#fff' : themeSubText, fontWeight: "800", fontSize: 12 }}>
                        {typeKey === 'küçük' ? t.types.kucuk : typeKey === 'orta' ? t.types.orta : typeKey === 'büyük' ? t.types.buyuk : t.types.ozel}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={{ marginTop: 6, marginBottom: 8, fontWeight:'700', color: themeText }}>{t.repeat}</Text>
                <Picker selectedValue={selectedRepeat} onValueChange={(v) => setSelectedRepeat(v as TaskRepeatType)} style={{backgroundColor: darkMode ? '#333' : '#f4f4f5', marginBottom: 16}}>
                  <Picker.Item label={t.repeatNone} value="none" color={themeText} />
                  <Picker.Item label={t.repeatDaily} value="daily" color={themeText} />
                  <Picker.Item label={t.repeatWeekly} value="weekly" color={themeText} />
                </Picker>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, justifyContent:'space-between' }}>
                  <Text style={{ color: themeText, fontWeight:'700' }}>{t.setReminder}</Text>
                  <Switch value={reminderEnabled} onValueChange={setReminderEnabled} />
                </View>
                {reminderEnabled && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: themeText, marginBottom: 8 }}>{t.dateTime}</Text>
                    <Text style={{ color: themeText, marginBottom: 4 }}>{t.dateLabel || "Tarih"}</Text>
                    <View style={{ flexDirection: "row", marginBottom: 10 }}>
                      <View style={{ flex: 1, backgroundColor: darkMode ? "#333" : "#f4f4f5", borderRadius: 10, marginRight: 6 }}>
                        <Picker selectedValue={reminderDay} style={{ flex: 1 }} onValueChange={(v) => setReminderDay(Number(v))}>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => <Picker.Item key={d} label={d < 10 ? `0${d}` : String(d)} value={d} />)}
                        </Picker>
                      </View>
                      <View style={{ flex: 1, backgroundColor: darkMode ? "#333" : "#f4f4f5", borderRadius: 10, marginRight: 6 }}>
                        <Picker selectedValue={reminderMonth} style={{ flex: 1 }} onValueChange={(v) => setReminderMonth(Number(v))}>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <Picker.Item key={m} label={m < 10 ? `0${m}` : String(m)} value={m} />)}
                        </Picker>
                      </View>
                      <View style={{ flex: 1, backgroundColor: darkMode ? "#333" : "#f4f4f5", borderRadius: 10 }}>
                        <Picker selectedValue={reminderYear} style={{ flex: 1 }} onValueChange={(v) => setReminderYear(Number(v))}>
                          {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() + i).map((y) => <Picker.Item key={y} label={String(y)} value={y} />)}
                        </Picker>
                      </View>
                    </View>
                    <Text style={{ color: themeText, marginBottom: 4 }}>{t.timeLabel || "Saat"}</Text>
                    <View style={{ flexDirection: "row" }}>
                      <View style={{ flex: 1, backgroundColor: darkMode ? "#333" : "#f4f4f5", borderRadius: 10, marginRight: 6 }}>
                        <Picker selectedValue={reminderHour} style={{ flex: 1 }} onValueChange={(v) => setReminderHour(Number(v))}>
                          {Array.from({ length: 24 }, (_, i) => i).map((h) => <Picker.Item key={h} label={h < 10 ? `0${h}` : String(h)} value={h} />)}
                        </Picker>
                      </View>
                      <View style={{ flex: 1, backgroundColor: darkMode ? "#333" : "#f4f4f5", borderRadius: 10 }}>
                        <Picker selectedValue={reminderMinute} style={{ flex: 1 }} onValueChange={(v) => setReminderMinute(Number(v))}>
                          {[0,5,10,15,20,25,30,35,40,45,50,55].map((m) => <Picker.Item key={m} label={m < 10 ? `0${m}` : String(m)} value={m} />)}
                        </Picker>
                      </View>
                    </View>
                  </View>
                )}
                <ModernButton title={t.save} onPress={() => addTask()} color={actionColor} />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </RNModal>
        <RNModal isVisible={timerVisible} onBackdropPress={() => { setTimerVisible(false); setMinimized(true); }}> <View style={{ backgroundColor: themeCard, padding: 24, borderRadius: 24, alignItems: "center" }}> <Text style={{ fontSize: 20, fontWeight: "800", marginBottom: 8, color: themeText }}>{t.timerTitle}</Text> <Text style={{ fontSize: 50, fontWeight: "900", marginVertical: 16, color: themeText }}>{formatTime(timerSeconds)}</Text> <View style={{ flexDirection: "row", marginBottom: 16 }}> {[5, 15, 25].map(min => ( <TouchableOpacity key={min} onPress={() => { setTimerSeconds(min * 60); setTimerRunning(false); }} style={styles.timerBtnOption}> <Text style={{fontWeight:'700', color: themeText}}>{min}dk</Text> </TouchableOpacity> ))} </View> <View style={{ width: "100%" }}> {!timerRunning ? ( <ModernButton title={t.start} onPress={() => { setTimerRunning(true); setMinimized(false); timerTargetEndRef.current = Date.now() + timerSeconds * 1000; }} color={actionColor} /> ) : ( <ModernButton title={t.pause} onPress={() => { setTimerRunning(false); setMinimized(false); timerTargetEndRef.current = null; }} color="#FFB703" /> )} <View style={{height:10}} /> <TouchableOpacity onPress={() => { setTimerSeconds(25 * 60); setTimerRunning(false); setMinimized(false); timerTargetEndRef.current = null; }} style={[styles.timerResetBtn, { borderColor: actionColor }]}> <Text style={{ color: actionColor, fontWeight: "700" }}>{t.reset}</Text> </TouchableOpacity> </View> <TouchableOpacity onPress={() => { setTimerVisible(false); setMinimized(true); }} style={{ marginTop: 16 }}> <Text style={{ color: themeSubText }}>{t.timerClose}</Text> </TouchableOpacity> </View> </RNModal>
        <Modal visible={showOnboarding} animationType="slide" transparent> <View style={styles.onboardWrap}> <View style={[styles.onboardCard, { backgroundColor: themeCard, width: "92%", maxWidth: 560, paddingVertical: 18, paddingHorizontal: 22 }]}> <Text style={{ fontSize: 24, fontWeight: "900", marginBottom: 8, color: themeText }}>{t.onboardTitle}</Text> <Text style={{ marginBottom: 6, color: themeText }}>{t.onboardDesc}</Text> <Text style={{ marginBottom: 12, color: themeSubText }}>{t.onboardSub}</Text> <ModernButton title={t.startBtn} onPress={closeOnboarding} color={actionColor} style={{width: '100%'}} /> </View> </View> </Modal>
        <Modal visible={showPartnerScreen} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={{ flex: 1, backgroundColor: themeCard }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: darkMode ? "#333" : "#eee" }}>
              <View style={{ width: 72 }} />
              <Text allowFontScaling={false} style={{ fontSize: 18, fontWeight: "800", color: themeText }}>{t.coupleModeTitle}</Text>
              <TouchableOpacity onPress={() => setShowPartnerScreen(false)} style={{ padding: 8 }}>
                <Text allowFontScaling={false} style={{ fontSize: 16, fontWeight: "700", color: actionColor }}>{t.cancel}</Text>
              </TouchableOpacity>
            </View>
            <PartnerPairingScreen 
              onClose={() => setShowPartnerScreen(false)} 
              onHouseholdChange={(id) => {
                setCoupleHouseholdId(id);
                if (id) {
                  setShowPartnerScreen(false);
                }
              }}
              t={t as Record<string, any>} 
              themeCard={themeCard} 
              themeText={themeText} 
              actionColor={actionColor} 
              darkMode={darkMode} 
            />
          </SafeAreaView>
        </Modal>
        <Modal visible={showBuyCoinsModal} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 24 }}>
            <View style={{ backgroundColor: themeCard, padding: 24, borderRadius: 24, width: "100%", maxWidth: 340, alignItems: 'center' }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🔒</Text>
              <Text style={{ fontSize: 20, fontWeight: "800", marginBottom: 10, color: themeText }}>COMING SOON</Text>
              <Text style={{ marginBottom: 20, color: themeSubText, fontSize: 14, textAlign: 'center' }}>Buying coins will be available soon!</Text>
              <ModernButton title={t.cancel} color={themeSubText} onPress={() => setShowBuyCoinsModal(false)} />
            </View>
          </View>
        </Modal>
        <RNModal isVisible={showSupportModal} onBackdropPress={() => setShowSupportModal(false)} style={{margin:0, justifyContent:'center'}}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            <View style={{ backgroundColor: themeCard, padding: 24, borderRadius: 24, margin: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: "900", marginBottom: 10, color: themeText }}>{t.supportModalTitle}</Text>
              <Text style={{ marginBottom: 16, color: themeSubText, fontSize: 14 }}>{t.supportDesc}</Text>
              <TextInput
                placeholder={t.supportMessagePlace}
                value={supportMessage}
                onChangeText={setSupportMessage}
                placeholderTextColor={themeSubText}
                style={[styles.inputModern, { 
                  color: themeText, 
                  backgroundColor: darkMode ? '#333' : '#f4f4f5',
                  height: 120,
                  textAlignVertical: 'top',
                  marginBottom: 16
                }]}
                multiline={true}
                numberOfLines={5}
              />
              {supportLoading ? (
                <ActivityIndicator size="large" color={actionColor} style={{ marginVertical: 10 }} />
              ) : (
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <ModernButton title={t.cancel} color={themeSubText} onPress={() => { setShowSupportModal(false); setSupportMessage(""); }} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ModernButton title={t.supportSendBtn} color={actionColor} onPress={handleSupportMessage} />
                  </View>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </RNModal>
        <ModernAlert
          visible={alertState.visible}
          title={alertState.title}
          message={alertState.message}
          buttons={alertState.buttons}
          onClose={closeAlert}
          themeCard={themeCard}
          themeText={themeText}
          themeSubText={themeSubText}
          actionColor={actionColor}
        />
        {/* MODALS END */}

        <Nav />
        <TimerMini />
        
        <Toast
          visible={toastVisible}
          message={toastMessage}
          onUndo={handleUndo}
          onDismiss={() => {
            setToastVisible(false);
            setLastAction(null);
          }}
          themeCard={themeCard}
          themeText={themeText}
          actionColor={actionColor}
          undoText={t.toastUndo}
        />
        
        {/* Nudge Toast */}
        {showNudgeToast && (
          <View style={{
            position: 'absolute',
            top: 60,
            left: 20,
            right: 20,
            backgroundColor: actionColor,
            paddingHorizontal: 20,
            paddingVertical: 14,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
            zIndex: 9999,
          }}>
            <Text style={{ fontSize: 24, marginRight: 10 }}>🙌</Text>
            <Text style={{ flex: 1, color: '#fff', fontSize: 15, fontWeight: '700' }}>
              {couplePartnerName || 'Partner'} sana high-five gönderdi!
            </Text>
          </View>
        )}
      </SafeAreaView>
      </View>
    </ErrorBoundary>
  );
}