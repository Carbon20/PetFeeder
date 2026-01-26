import { Animated } from 'react-native';
import { Pet, Task, ThemeColor, UserData } from './index';
import { User } from 'firebase/auth';

// HomeTab Props
export interface HomeTabProps {
  pet: Pet;
  progressPercent: number;
  progressAnim: Animated.Value;
  confetti: boolean;
  simpleMode: boolean;
  themeCard: string;
  themeText: string;
  themeSubText: string;
  actionColor: string;
  t: Record<string, any>;
  büyümeHedefi: number;
  setShowAddModal: (show: boolean) => void;
  openTimerForTask: (taskId: string | null, presetSeconds?: number) => void;
  quickTaskText: string;
  setQuickTaskText: (text: string) => void;
  addTask: (quickTextOrObj?: string | QuickTaskObject, quickDate?: string) => void;
  todayTasks: Task[];
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;
  sortTasks: (a: Task, b: Task) => number;
}

// TasksTab Props
export interface TasksTabProps {
  tasks: Task[];
  sortTasks: (a: Task, b: Task) => number;
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;
  themeCard: string;
  themeText: string;
  themeSubText: string;
  actionColor: string;
  t: Record<string, any>;
}

// CalendarTab Props
export interface CalendarTabProps {
  currentMonth: number;
  currentYear: number;
  shiftMonth: (delta: number) => void;
  monthNames: string[];
  weekdayShort: string[];
  daysSafe: (number | null)[];
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  calendarQuickTaskText: string;
  setCalendarQuickTaskText: (text: string) => void;
  addTask: (quickTextOrObj?: string | QuickTaskObject, quickDate?: string) => void;
  tasks: Task[];
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;
  themeCard: string;
  themeText: string;
  themeSubText: string;
  actionColor: string;
  t: Record<string, any>;
}

// SettingsTab Props
export interface SettingsTabProps {
  language: 'tr' | 'en';
  setLanguage: (lang: 'tr' | 'en') => void;
  user: User | null;
  userDoc: UserData | null;
  handleLogout: () => void;
  isRegistering: boolean;
  setAuthModalVisible: (show: boolean) => void;
  setIsRegistering: (is: boolean) => void;
  simpleMode: boolean;
  setSimpleMode: (mode: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  themeColorKey: string;
  setThemeColorKey: (key: string) => void;
  resetAll: () => void;
  handlePurchase: (sku: string) => void;
  hasUnlimitedNameChange: boolean;
  freeNameChangeUsed: boolean;
  settingsPetName: string;
  setSettingsPetName: (name: string) => void;
  handleUpdateName: () => void;
  setShowSupportModal: (show: boolean) => void;
  THEME_COLORS: ThemeColor[];
  SKUS: Record<string, string>;
  STORAGE_KEYS: Record<string, string>;
  t: Record<string, any>;
  themeText: string;
  themeSubText: string;
  themeCard: string;
  actionColor: string;
  selectedTheme: ThemeColor;
}

// ModernButton Props
export interface ModernButtonProps {
  title: string;
  onPress: () => void;
  color: string;
  style?: any;
  disabled?: boolean;
}

// QuickTaskObject
export interface QuickTaskObject {
  text: string;
  date?: string;
  type?: Task['type'];
  repeat?: Task['repeat'];
}
