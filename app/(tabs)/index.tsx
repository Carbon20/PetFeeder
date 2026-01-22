import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Modal,
  Animated,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  AppState,
  useColorScheme,
  Switch,
  BackHandler,
} from "react-native";
import { Audio } from "expo-av";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import ConfettiCannon from "react-native-confetti-cannon";
import RNModal from "react-native-modal";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import DateTimePicker from "@react-native-community/datetimepicker"; // yeni eklendi

/** Tema renkleri tanımı */
const THEME_COLORS = [
  { key: "mavi", label: "Mavi", main: "#118AB2", grad: ["#96d7eb", "#118AB2"] },
  { key: "sari", label: "Sarı", main: "#FFD166", grad: ["#FFF3C3", "#FFD166"] },
  { key: "yesil", label: "Yeşil", main: "#06D6A0", grad: ["#b6f7d2", "#06D6A0"] },
  { key: "bordo", label: "Bordo", main: "#7b1f25", grad: ["#e89ea7", "#7b1f25"] },
  { key: "mor", label: "Mor", main: "#5C258D", grad: ["#b998e5", "#5C258D"] },
  { key: "turuncu", label: "Turuncu", main: "#F3722C", grad: ["#ffe2c6", "#F3722C"] },
  { key: "siyahgold", label: "Siyah Gold", main: "#ffca08", grad: ["#2d2a26", "#ffca08"] }
];
const COLOR_THEME_KEY = "petfeeder_theme_color";

type TaskRepeatType = "none" | "daily" | "weekly";

type Task = {
  id: string;
  text: string;
  done: boolean;
  mamaValue: number;
  type: "küçük" | "orta" | "büyük" | "özel";
  date: string; // TR locale string
  order?: number;
  repeat?: TaskRepeatType;
  description?: string; // Açıklama eklendi
  alarmTimestamp?: number; // Yeni eklenen alarm bilgisi (Unix ms)
};
type PetType = "dog" | "cat";

type Pet = {
  type: PetType;
  age: number;
  mama: number;
  level: number;
};
const DEFAULT_MAMA_PER_TASK = 4;
const TASKS_KEY = "petfeeder_tasks";
const PET_KEY = "petfeeder_pet";
const DARKMODE_KEY = "petfeeder_darkmode";

// Bildirim fonksiyonu
async function scheduleNotification(taskTitle: string, hour: number, minute: number, selectedDate: Date) {
  if (Platform.OS !== "android") return;
  let perms = await Notifications.getPermissionsAsync();
  if (!perms.granted) {
    perms = await Notifications.requestPermissionsAsync();
    if (!perms.granted) {
      Alert.alert("Bildirim izni gerekli", "Görev bildirimi için izin vermeniz gerekir.");
      return;
    }
  }
  // Hedef saat ve dakika ile selectedDate'in gün+ay+yıl'ını birleştir
  const fireDate = new Date(selectedDate);
  fireDate.setHours(hour, minute, 0, 0);

  // Eğer zaman geçmişse bildirim gönderme!
  if (fireDate < new Date()) {
    Alert.alert("Bildirim zamanı geçmiş", "Lütfen ileri bir zaman seçiniz.");
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "PetFeeder Görev Zamanı!",
      body: taskTitle,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      date: fireDate,
    },
  });
}

async function saveTasksToStorage(tasks: Task[]) {
  try { await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); }
  catch (e) { console.log("Görevler kaydedilemedi", e); }
}
async function loadTasksFromStorage(): Promise<Task[]> {
  try { const data = await AsyncStorage.getItem(TASKS_KEY); if (data) return JSON.parse(data); }
  catch (e) { console.log("Görevler okunamadı", e); }
  return [];
}
async function savePetToStorage(pet: Pet) {
  try { await AsyncStorage.setItem(PET_KEY, JSON.stringify(pet)); }
  catch (e) { console.log("Evcil hayvan kaydedilemedi", e); }
}
async function loadPetFromStorage(): Promise<Pet | null> {
  try { const data = await AsyncStorage.getItem(PET_KEY); if (data) return JSON.parse(data); }
  catch (e) { console.log("Evcil hayvan okunamadı", e); }
  return null;
}

export default function Index() {
  // --- DARK MODE, RENK, STATE ---
  const systemColorScheme = useColorScheme();
  const [darkMode, setDarkMode] = useState<boolean>(systemColorScheme === "dark");
  const [themeColorKey, setThemeColorKey] = useState<string>("mavi"); // default mavi
  const selectedTheme = THEME_COLORS.find(t => t.key === themeColorKey) || THEME_COLORS[0];

  // ------------- Diğer State -------------
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [selectedType, setSelectedType] = useState<Task["type"]>("küçük");
  const [selectedRepeat, setSelectedRepeat] = useState<TaskRepeatType>("none");
  const [pet, setPet] = useState<Pet>({ type: "cat", age: 0, mama: 0, level: 1 });
  const [screen, setScreen] = useState<"home" | "tasks" | "history" | "settings">("home");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPetTypeModal, setShowPetTypeModal] = useState(false);
  const [chosenPetType, setChosenPetType] = useState<PetType | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [timerVisible, setTimerVisible] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const timerRef = useRef<any>(null);
  const [linkedTaskId, setLinkedTaskId] = useState<string | null>(null);

  // Alarm ekleme için yeni state
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [alarmDate, setAlarmDate] = useState<Date>(new Date());

  // Görev detay modalı için:
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(null);

  // Tema seçimi modalı için
  const [showThemeModal, setShowThemeModal] = useState(false);

  // Sayaç arka plan için
  const timerTargetEndRef = useRef<number | null>(null);
  const appStateRef = useRef<string>(AppState.currentState);

  const mamaValues: Record<Task["type"], number> = {
    küçük: 2, orta: 4, büyük: 6, özel: 10,
  };

  useEffect(() => {
    if (Platform.OS === "android") {
      // Bildirim açılışta izin sorusu - ilk yüklemede passif bırak, notification fonksiyonunda zaten tekrar soruluyor
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    }
  }, []);

  // ... (devamı aynen - BACK BUTTON, DARK MODE STORAGE, diğerleri değişmedi)

  // -------- görev ekleme
  const addTask = async () => {
    if (!newTaskText.trim()) {
      Alert.alert("Uyarı", "Görev adı boş olamaz");
      return;
    }
    const mamaValue = mamaValues[selectedType];
    const today = new Date().toLocaleDateString("tr-TR");

    let alarmTimestamp: number | undefined = undefined;
    if (alarmEnabled && alarmDate) {
      alarmTimestamp = alarmDate.getTime();
      // Bildirim Zamanı (taskTitle, hour, minute)
      await scheduleNotification(
        newTaskText.trim(),
        alarmDate.getHours(),
        alarmDate.getMinutes(),
        alarmDate
      );
    }
    const t: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      done: false,
      mamaValue,
      type: selectedType,
      date: today,
      order: tasks.length,
      repeat: selectedRepeat,
      description: newTaskDescription.trim() ? newTaskDescription.trim() : undefined,
      alarmTimestamp,
    };
    setTasks((s) => [t, ...s]);
    setNewTaskText("");
    setNewTaskDescription("");
    setSelectedRepeat("none");
    setAlarmEnabled(false);
    setAlarmDate(new Date());
    setShowAddModal(false);
  };

  // ... (geri kalan kod aynen!)

  // RNModal içeriğinde alarm ekleme arayüzü ekleniyor
  // Diğer değişiklikler minimum UI, inline style ile

  // ... 

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: darkMode ? "#222" : "#e6f7ff" }}>
      <LinearGradient colors={darkMode ? ["#292929", "#222"] : selectedTheme.grad} style={styles.container}>
        {/* ... diğer componentler ... */}
        <RNModal isVisible={showAddModal} onBackdropPress={() => setShowAddModal(false)}>
          <View style={[styles.modalContent, { backgroundColor: darkMode ? "#2e2e2e" : "#fff" }]}>
            <Text style={{ fontWeight: "700", fontSize: 18, marginBottom: 8, color: darkMode ? "#fff" : "#222" }}>Yeni Bir Görev</Text>
            <TextInput
              placeholder="Örn: 30 dk yürüyüş"
              style={styles.input}
              placeholderTextColor={darkMode ? "#bbb" : "#555"}
              value={newTaskText}
              onChangeText={setNewTaskText}
            />
            <TextInput
              placeholder="Açıklama (isteğe bağlı)"
              style={styles.input}
              placeholderTextColor={darkMode ? "#bbb" : "#555"}
              value={newTaskDescription}
              onChangeText={setNewTaskDescription}
              multiline={true}
            />
            {/* Alarm/hatırlatıcı ekleme */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, marginTop: 2 }}>
              <Switch value={alarmEnabled} onValueChange={setAlarmEnabled} />
              <Text style={{ marginLeft: 8, color: darkMode ? "#fff" : "#222" }}>Alarm ekle</Text>
              {alarmEnabled && (
                <TouchableOpacity style={{ marginLeft: 12, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 5 }}
                  onPress={() => setShowTimePicker(true)}>
                  <Text style={{ color: "#006" }}>
                    {alarmDate ? alarmDate.toLocaleDateString("tr-TR") + " " + alarmDate.toLocaleTimeString("tr-TR").slice(0,5) : "Saat seç"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {showTimePicker && (
              <DateTimePicker
                value={alarmDate}
                mode="datetime"
                is24Hour={true}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, date) => {
                  setShowTimePicker(false);
                  if (date) setAlarmDate(date);
                }}
              />
            )}
            <View style={styles.pickerRow}>
              <Text style={{ marginRight: 8, color: darkMode ? "#fff" : "#222" }}>Görev büyüklüğü:</Text>
              <Picker selectedValue={selectedType} onValueChange={(v) => setSelectedType(v as Task["type"])} style={{ flex: 1 }}>
                <Picker.Item label="Küçük Görev (+2 mama)" value="küçük" />
                <Picker.Item label="Orta Görev (+4 mama)" value="orta" />
                <Picker.Item label="Büyük Görev (+6 mama)" value="büyük" />
                <Picker.Item label="Özel Görev (+10 mama)" value="özel" />
              </Picker>
            </View>
            <View style={styles.pickerRow}>
              <Text style={{ marginRight: 8, color: darkMode ? "#fff" : "#222" }}>Görev Tekrarı:</Text>
              <Picker selectedValue={selectedRepeat} onValueChange={(v) => setSelectedRepeat(v as TaskRepeatType)} style={{ flex: 1 }}>
                <Picker.Item label="Tek Seferlik" value="none" />
                <Picker.Item label="Her Gün" value="daily" />
                <Picker.Item label="Her Hafta" value="weekly" />
              </Picker>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
              <Button title="Vazgeç" onPress={() => setShowAddModal(false)} color="#888" />
              <Button title="Kaydet" onPress={addTask} color={selectedTheme.main} />
            </View>
          </View>
        </RNModal>
        {/* ...diğer modallar ve ekranlar... */}
      </LinearGradient>
    </SafeAreaView>
  );
}

// styles burada aynen devam
const styles = StyleSheet.create({
  container: { flex: 1 },
  headerShifted: { paddingHorizontal: 8, paddingTop: 34, paddingBottom: 6 },
  header: { padding: 16 },
  title: { fontSize: 28, fontWeight: "800", textAlign: "center" },
  subtitle: { textAlign: "center", color: "#555", marginTop: 4 },
  navRow: { flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 8, marginBottom: 8 },
  navBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  navActive: { backgroundColor: "rgba(17,138,178,0.12)" },
  navText: { fontWeight: "700" },
  petCard: {
    marginVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },
  petImage: { width: 150, height: 150 },
  progressBarBackground: {
    width: 240,
    height: 14,
    backgroundColor: "#f0f3f5",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
  },
  progressBar: { height: "100%", borderRadius: 12 },
  actionsBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    marginTop: 18,
    marginBottom: 6,
  },
  actionBtnMain: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#118AB2",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 15,
    marginHorizontal: 7,
    shadowColor: "#118AB2",
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 2,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 15,
    borderWidth: 1.25,
    borderColor: "#118AB2",
    marginHorizontal: 7,
    elevation: 1,
  },
  controls: { flexDirection: "row", justifyContent: "space-between", marginHorizontal: 20, marginTop: 12 },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  ghostBtn: {
    borderWidth: 1,
    borderColor: "#118AB2",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    minWidth: 120,
    alignItems: "center",
  },
  ghostBtnText: { color: "#118AB2", fontWeight: "700" },
  section: { flex: 1, paddingHorizontal: 12, marginTop: 8 },
  sectionMini: { marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 8 },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  taskDone: { opacity: 0.6 },
  taskText: { fontWeight: "700", fontSize: 15 },
  taskMeta: { color: "#666", fontSize: 12, marginTop: 6 },
  iconBtn: { marginLeft: 8, padding: 8 },
  logBox: { backgroundColor: "#fff", marginTop: 8, padding: 12, borderRadius: 12 },
  modalContent: { backgroundColor: "#fff", padding: 14, borderRadius: 12 },
  input: { borderWidth: 1, borderColor: "#f0f0f0", padding: 12, borderRadius: 10, marginBottom: 8, backgroundColor: "#fff" },
  pickerRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 8, padding: 6 },
  onboardWrap: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)" },
  onboardCard: { width: "86%", padding: 18, backgroundColor: "#fff", borderRadius: 12, alignItems: "center" },
  statRow: { flexDirection: "row", justifyContent: "space-between" },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  statNum: { fontSize: 18, fontWeight: "800" },
  statLabel: { color: "#666", marginTop: 4 },
  petSelect: { padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "#eee" },
  petSelectActive: { backgroundColor: "rgba(6,214,160,0.12)", borderColor: "rgba(6,214,160,0.3)" },
  timerBtnOption: { backgroundColor: "#F2F7FA", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 18, marginHorizontal: 6 },
  timerStartBtn: { backgroundColor: "#118AB2", padding: 10, borderRadius: 10, minWidth: 120, alignItems: "center" },
  timerPauseBtn: { backgroundColor: "#FFD166", padding: 10, borderRadius: 10, minWidth: 120, alignItems: "center" },
  timerResetBtn: { borderWidth: 1, borderColor: "#118AB2", padding: 10, borderRadius: 10, minWidth: 120, alignItems: "center" },
});
