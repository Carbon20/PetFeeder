import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface PomodoroSession {
    id: string;
    duration: number;      // seconds
    type: 'work' | 'short' | 'long';
    completedAt: number;   // timestamp ms
}

interface PomodoroTabProps {
    themeCard: string;
    themeText: string;
    themeSubText: string;
    actionColor: string;
    darkMode: boolean;
    t: Record<string, any>;
    soundEnabled: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'petfeeder_pomodoro_sessions';
const SETTINGS_KEY = 'petfeeder_pomodoro_settings';

const pad = (n: number) => String(n).padStart(2, '0');

const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${pad(m)}:${pad(s)}`;
};

const formatDateTime = (ts: number) => {
    const d = new Date(ts);
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return time;
};

const formatDateGroup = (ts: number, t: Record<string, any>) => {
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
        a.getDate() === b.getDate() &&
        a.getMonth() === b.getMonth() &&
        a.getFullYear() === b.getFullYear();

    if (isSameDay(d, today)) return t.today || 'Bugün';
    if (isSameDay(d, yesterday)) return t.yesterday || 'Dün';
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
};

const groupByDay = (sessions: PomodoroSession[], t: Record<string, any>) => {
    const groups = new Map<string, { label: string; ts: number; items: PomodoroSession[] }>();
    for (const s of sessions) {
        const d = new Date(s.completedAt);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (!groups.has(key)) {
            groups.set(key, {
                label: formatDateGroup(s.completedAt, t),
                ts: s.completedAt,
                items: [],
            });
        }
        groups.get(key)!.items.push(s);
    }
    return Array.from(groups.values()).sort((a, b) => b.ts - a.ts);
};

// ─── Ring Progress ───────────────────────────────────────────────────────────
function RingProgress({
    progress,
    color,
    size = 220,
}: {
    progress: number; // 0–1  (1 = full, 0 = empty)
    color: string;
    size?: number;
}) {
    const strokeWidth = 12;

    return (
        <View
            style={{
                width: size,
                height: size,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* Background ring */}
            <View
                style={{
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderColor: 'rgba(150,150,150,0.15)',
                }}
            />
            {/* Progress ring using border-color quarters trick */}
            <View
                style={{
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderColor: 'transparent',
                    borderTopColor: progress > 0 ? color : 'transparent',
                    borderRightColor: progress >= 0.25 ? color : 'transparent',
                    borderBottomColor: progress >= 0.5 ? color : 'transparent',
                    borderLeftColor: progress >= 0.75 ? color : 'transparent',
                    transform: [{ rotate: '-90deg' }],
                }}
            />
        </View>
    );
}

// ─── Duration Picker Modal ────────────────────────────────────────────────────
type PomodoroMode = 'work' | 'short' | 'long';

interface DurationPickerProps {
    visible: boolean;
    darkMode: boolean;
    themeCard: string;
    themeText: string;
    themeSubText: string;
    actionColor: string;
    durations: Record<PomodoroMode, number>;
    t: Record<string, any>;
    onSave: (d: Record<PomodoroMode, number>) => void;
    onClose: () => void;
}

const STEP = 60; // 1-minute steps
const MIN_MINUTES = 1;
const MAX_MINUTES = 120;

function DurationPicker({
    visible, darkMode, themeCard, themeText, themeSubText, actionColor,
    durations, t, onSave, onClose,
}: DurationPickerProps) {
    const [local, setLocal] = useState({ ...durations });

    // sync when opened
    useEffect(() => {
        if (visible) setLocal({ ...durations });
    }, [visible]);

    const adjust = (mode: PomodoroMode, delta: number) => {
        setLocal(prev => {
            const next = prev[mode] + delta * STEP;
            const clamped = Math.max(MIN_MINUTES * 60, Math.min(MAX_MINUTES * 60, next));
            return { ...prev, [mode]: clamped };
        });
    };

    const modeLabel: Record<PomodoroMode, string> = {
        work: t.pomodoroWork || 'Çalışma',
        short: t.pomodoroShort || 'Kısa Mola',
        long: t.pomodoroLong || 'Uzun Mola',
    };
    const modeColor: Record<PomodoroMode, string> = {
        work: actionColor,
        short: '#10b981',
        long: '#8b5cf6',
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                <View style={{ backgroundColor: themeCard, borderRadius: 24, padding: 24, width: '100%', maxWidth: 360 }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: themeText, marginBottom: 20, textAlign: 'center' }}>
                        {t.pomodoroSetDurations || 'Süreleri Ayarla'}
                    </Text>

                    {(['work', 'short', 'long'] as PomodoroMode[]).map(m => (
                        <View key={m} style={{ marginBottom: 16 }}>
                            <Text style={{ color: modeColor[m], fontWeight: '700', fontSize: 13, marginBottom: 8 }}>
                                {modeLabel[m]}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <TouchableOpacity
                                    onPress={() => adjust(m, -1)}
                                    style={{
                                        width: 44, height: 44, borderRadius: 12,
                                        backgroundColor: darkMode ? '#3f3f46' : '#f4f4f5',
                                        alignItems: 'center', justifyContent: 'center',
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <Text style={{ fontSize: 22, fontWeight: '700', color: themeText }}>−</Text>
                                </TouchableOpacity>

                                <View style={{ flex: 1, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 28, fontWeight: '900', color: themeText }}>
                                        {Math.floor(local[m] / 60)}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: themeSubText }}>{t.minutes || 'dk'}</Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => adjust(m, 1)}
                                    style={{
                                        width: 44, height: 44, borderRadius: 12,
                                        backgroundColor: darkMode ? '#3f3f46' : '#f4f4f5',
                                        alignItems: 'center', justifyContent: 'center',
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <Text style={{ fontSize: 22, fontWeight: '700', color: themeText }}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                        <TouchableOpacity
                            onPress={onClose}
                            style={{
                                flex: 1, paddingVertical: 14, borderRadius: 16,
                                backgroundColor: darkMode ? '#3f3f46' : '#f4f4f5',
                                alignItems: 'center',
                            }}
                            activeOpacity={0.85}
                        >
                            <Text style={{ color: themeSubText, fontWeight: '700' }}>{t.cancel || 'İptal'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => { onSave(local); onClose(); }}
                            style={{
                                flex: 1, paddingVertical: 14, borderRadius: 16,
                                backgroundColor: actionColor, alignItems: 'center',
                            }}
                            activeOpacity={0.85}
                        >
                            <Text style={{ color: '#fff', fontWeight: '800' }}>{t.save || 'Kaydet'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// ─── Default Durations ────────────────────────────────────────────────────────
const DEFAULT_DURATIONS: Record<PomodoroMode, number> = {
    work: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function PomodoroTab({
    themeCard,
    themeText,
    themeSubText,
    actionColor,
    darkMode,
    t,
    soundEnabled,
}: PomodoroTabProps) {
    const [durations, setDurations] = useState<Record<PomodoroMode, number>>(DEFAULT_DURATIONS);
    const [mode, setMode] = useState<PomodoroMode>('work');
    const [seconds, setSeconds] = useState(DEFAULT_DURATIONS['work']);
    const [running, setRunning] = useState(false);
    const [sessions, setSessions] = useState<PomodoroSession[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // refs for closure-safe access
    const durationsRef = useRef(durations);
    useEffect(() => { durationsRef.current = durations; }, [durations]);
    const modeRef = useRef(mode);
    useEffect(() => { modeRef.current = mode; }, [mode]);
    const sessionsRef = useRef<PomodoroSession[]>(sessions);
    useEffect(() => { sessionsRef.current = sessions; }, [sessions]);

    // ── Load persisted data ──
    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY).then(raw => {
            if (raw) setSessions(JSON.parse(raw));
        });
        AsyncStorage.getItem(SETTINGS_KEY).then(raw => {
            if (raw) {
                const saved = JSON.parse(raw) as Record<PomodoroMode, number>;
                setDurations(saved);
                setSeconds(saved['work']);
            }
        });
    }, []);

    // ── Save sessions ──
    const saveSessions = useCallback((updated: PomodoroSession[]) => {
        setSessions(updated);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => { });
    }, []);

    // ── Pulse animation ──
    useEffect(() => {
        if (running) {
            const loop = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.04, duration: 800, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                ])
            );
            loop.start();
            return () => loop.stop();
        } else {
            pulseAnim.setValue(1);
        }
    }, [running, pulseAnim]);

    // ── Auto-switch to break after work session ──
    const handleSessionComplete = useCallback((completedMode: PomodoroMode) => {
        const currentSessions = sessionsRef.current;
        const currentDurations = durationsRef.current;

        const newSession: PomodoroSession = {
            id: Date.now().toString(),
            duration: currentDurations[completedMode],
            type: completedMode,
            completedAt: Date.now(),
        };
        saveSessions([newSession, ...currentSessions]);

        if (soundEnabled) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        // Auto-switch: work → short break, break → work
        if (completedMode === 'work') {
            const workCount = currentSessions.filter(s => s.type === 'work').length + 1;
            const nextMode: PomodoroMode = workCount % 4 === 0 ? 'long' : 'short';
            setMode(nextMode);
            setSeconds(currentDurations[nextMode]);
            modeRef.current = nextMode;
        } else {
            setMode('work');
            setSeconds(currentDurations['work']);
            modeRef.current = 'work';
        }
        setRunning(false);
    }, [saveSessions, soundEnabled]);

    // ── Timer tick ──
    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(() => {
                setSeconds(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current!);
                        handleSessionComplete(modeRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [running, handleSessionComplete]);

    // ── Handlers ──
    const handleModeChange = (m: PomodoroMode) => {
        setMode(m);
        setSeconds(durations[m]);
        setRunning(false);
    };

    const handleStartStop = () => {
        if (seconds === 0) {
            setSeconds(durations[mode]);
            setRunning(false);
            return;
        }
        setRunning(r => !r);
        if (soundEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleReset = () => {
        setRunning(false);
        setSeconds(durations[mode]);
        if (soundEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleSaveDurations = (newDurations: Record<PomodoroMode, number>) => {
        setDurations(newDurations);
        setSeconds(newDurations[mode]);
        setRunning(false);
        AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newDurations)).catch(() => { });
    };

    // ── Derived values ──
    const totalDuration = durations[mode];
    // progress: 1 = full (start), 0 = empty (end)
    const progress = totalDuration > 0 ? seconds / totalDuration : 0;

    const completedToday = sessions.filter(s => {
        const d = new Date(s.completedAt);
        const today = new Date();
        return (
            d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear()
        );
    }).length;

    const modeLabel: Record<PomodoroMode, string> = {
        work: t.pomodoroWork || 'Çalışma',
        short: t.pomodoroShort || 'Kısa Mola',
        long: t.pomodoroLong || 'Uzun Mola',
    };

    const modeColor: Record<PomodoroMode, string> = {
        work: actionColor,
        short: '#10b981',
        long: '#8b5cf6',
    };

    const currentColor = modeColor[mode];
    const groups = groupByDay(sessions, t);

    return (
        <>
            <DurationPicker
                visible={showSettings}
                darkMode={darkMode}
                themeCard={themeCard}
                themeText={themeText}
                themeSubText={themeSubText}
                actionColor={actionColor}
                durations={durations}
                t={t}
                onSave={handleSaveDurations}
                onClose={() => setShowSettings(false)}
            />

            <ScrollView
                contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingTop: 32, paddingBottom: 140 }}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Mode Chips + Settings ── */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
                    {(['work', 'short', 'long'] as PomodoroMode[]).map(m => (
                        <TouchableOpacity
                            key={m}
                            onPress={() => handleModeChange(m)}
                            style={{
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 20,
                                backgroundColor: mode === m ? modeColor[m] : (darkMode ? '#3f3f46' : '#f4f4f5'),
                            }}
                            activeOpacity={0.85}
                        >
                            <Text style={{
                                color: mode === m ? '#fff' : themeSubText,
                                fontWeight: '700',
                                fontSize: 13,
                            }}>
                                {modeLabel[m]}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    {/* Settings gear */}
                    <TouchableOpacity
                        onPress={() => setShowSettings(true)}
                        style={{
                            width: 36, height: 36, borderRadius: 12,
                            backgroundColor: darkMode ? '#3f3f46' : '#f4f4f5',
                            alignItems: 'center', justifyContent: 'center',
                        }}
                        activeOpacity={0.85}
                    >
                        <Text style={{ fontSize: 16 }}>⚙️</Text>
                    </TouchableOpacity>
                </View>

                {/* ── Ring + Timer ── */}
                <View style={{ alignItems: 'center', marginBottom: 32 }}>
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <RingProgress progress={progress} color={currentColor} size={220} />
                            <View style={{ position: 'absolute', alignItems: 'center' }}>
                                <Text style={{ fontSize: 52, fontWeight: '900', color: themeText, letterSpacing: -2 }}>
                                    {formatDuration(seconds)}
                                </Text>
                                <Text style={{ fontSize: 13, fontWeight: '600', color: themeSubText, marginTop: 4 }}>
                                    {modeLabel[mode]}
                                </Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Today's count badge */}
                    <View style={{
                        marginTop: 16,
                        backgroundColor: currentColor + '20',
                        paddingHorizontal: 14,
                        paddingVertical: 6,
                        borderRadius: 14,
                    }}>
                        <Text style={{ color: currentColor, fontWeight: '700', fontSize: 13 }}>
                            🍅 {completedToday} {t.pomodoroCompleted || 'oturum tamamlandı'}
                        </Text>
                    </View>
                </View>

                {/* ── Buttons ── */}
                <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center', marginBottom: 32 }}>
                    {/* Start / Stop */}
                    <TouchableOpacity
                        onPress={handleStartStop}
                        style={{
                            flex: 1,
                            maxWidth: 180,
                            paddingVertical: 16,
                            borderRadius: 20,
                            backgroundColor: currentColor,
                            alignItems: 'center',
                            elevation: 4,
                            shadowColor: currentColor,
                            shadowOpacity: 0.4,
                            shadowRadius: 8,
                            shadowOffset: { width: 0, height: 4 },
                        }}
                        activeOpacity={0.85}
                    >
                        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 17 }}>
                            {seconds === 0 ? '↺' : running ? (t.pause || 'Durdur') : (t.start || 'Başlat')}
                        </Text>
                    </TouchableOpacity>

                    {/* Reset */}
                    <TouchableOpacity
                        onPress={handleReset}
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: 16,
                            backgroundColor: darkMode ? '#3f3f46' : '#f4f4f5',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        activeOpacity={0.85}
                    >
                        <Text style={{ fontSize: 20 }}>↺</Text>
                    </TouchableOpacity>
                </View>

                {/* ── History Toggle ── */}
                <TouchableOpacity
                    onPress={() => setShowHistory(h => !h)}
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: themeCard,
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 12,
                    }}
                    activeOpacity={0.85}
                >
                    <Text style={{ fontWeight: '800', fontSize: 15, color: themeText }}>
                        {t.pomodoroHistory || 'Oturum Geçmişi'}
                    </Text>
                    <Text style={{ color: themeSubText, fontSize: 18 }}>{showHistory ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {/* ── History List ── */}
                {showHistory && (
                    <View style={{ backgroundColor: themeCard, borderRadius: 16, padding: 16 }}>
                        {groups.length === 0 ? (
                            <Text style={{ color: themeSubText, textAlign: 'center', paddingVertical: 12 }}>
                                {t.pomodoroNoHistory || 'Henüz oturum yok'}
                            </Text>
                        ) : (
                            groups.map(group => (
                                <View key={group.ts} style={{ marginBottom: 16 }}>
                                    {/* Date header */}
                                    <View style={{
                                        alignSelf: 'flex-start',
                                        backgroundColor: actionColor + '22',
                                        paddingHorizontal: 10,
                                        paddingVertical: 3,
                                        borderRadius: 8,
                                        marginBottom: 8,
                                    }}>
                                        <Text style={{ color: actionColor, fontWeight: '800', fontSize: 12 }}>
                                            {group.label}
                                        </Text>
                                    </View>

                                    {group.items.map((s, idx) => (
                                        <View
                                            key={s.id}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                paddingVertical: 8,
                                                borderBottomWidth: idx !== group.items.length - 1 ? 1 : 0,
                                                borderBottomColor: darkMode ? '#3f3f46' : '#f3f4f6',
                                            }}
                                        >
                                            {/* Dot */}
                                            <View style={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: 5,
                                                backgroundColor: modeColor[s.type] || actionColor,
                                                marginRight: 12,
                                            }} />

                                            {/* Mode label */}
                                            <Text style={{ flex: 1, fontWeight: '700', color: themeText, fontSize: 14 }}>
                                                {modeLabel[s.type]}
                                            </Text>

                                            {/* Duration */}
                                            <Text style={{ color: themeSubText, fontSize: 13, marginRight: 12 }}>
                                                {formatDuration(s.duration)}
                                            </Text>

                                            {/* Time */}
                                            <Text style={{ color: themeSubText, fontSize: 13 }}>
                                                {formatDateTime(s.completedAt)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            ))
                        )}
                    </View>
                )}
            </ScrollView>
        </>
    );
}
