import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles';
import { Task as TaskType } from '../types';
import { CalendarTabProps } from '../types/components';
import { fixDateStringWithYear, keyOf } from '../utils';

export default function CalendarTab({
  header,
  currentMonth, currentYear, shiftMonth, monthNames, weekdayShort, daysSafe,
  selectedDate, setSelectedDate,
  calendarQuickTaskText, setCalendarQuickTaskText, addTask,
  tasks, completeTask, deleteTask,
  themeCard, themeText, themeSubText, actionColor, t
}: CalendarTabProps) {
  const topPadding = header ? 10 : 32;

  const today = new Date();
  const todayKey = keyOf(today.getDate(), today.getMonth(), today.getFullYear());

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollGrowPadded, { paddingTop: topPadding }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {header}

        {/* ── Calendar Card ── */}
        <View style={[styles.sectionCard, { backgroundColor: themeCard }]}>

          {/* Month Navigation */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <TouchableOpacity
              onPress={() => shiftMonth(-1)}
              style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: actionColor + '18',
                alignItems: 'center', justifyContent: 'center',
              }}
              activeOpacity={0.75}
            >
              <Text style={{ fontSize: 18, fontWeight: '700', color: actionColor, lineHeight: 22 }}>‹</Text>
            </TouchableOpacity>

            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: themeText, letterSpacing: -0.3 }}>
                {monthNames[currentMonth]}
              </Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: themeSubText, marginTop: 1 }}>
                {currentYear}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => shiftMonth(1)}
              style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: actionColor + '18',
                alignItems: 'center', justifyContent: 'center',
              }}
              activeOpacity={0.75}
            >
              <Text style={{ fontSize: 18, fontWeight: '700', color: actionColor, lineHeight: 22 }}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Weekday Headers */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 4 }}>
            {weekdayShort.map((d: string) => (
              <Text
                key={d}
                style={{
                  width: "14.28%",
                  textAlign: "center",
                  fontWeight: "700",
                  fontSize: 11,
                  color: themeSubText,
                  marginBottom: 10,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {d}
              </Text>
            ))}

            {/* Day Cells */}
            {daysSafe.map((day: number | null, idx: number) => {
              if (day === null)
                return <View key={idx} style={{ width: "14.28%", aspectRatio: 1 }} />;

              const key = keyOf(day, currentMonth, currentYear);
              const dayTasks = tasks.filter((t: TaskType) => fixDateStringWithYear(t.date) === key);
              const hasTasks = dayTasks.length > 0;
              const allDone = hasTasks && dayTasks.every((t: TaskType) => t.done);
              const isSelected = selectedDate === key;
              const isToday = todayKey === key;

              return (
                <TouchableOpacity
                  key={idx}
                  style={{ width: "14.28%", aspectRatio: 1, alignItems: "center", justifyContent: "center" }}
                  onPress={() => setSelectedDate(key)}
                  activeOpacity={0.75}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isSelected
                        ? actionColor
                        : hasTasks
                          ? allDone
                            ? '#22c55e22'
                            : '#f8717122'
                          : 'transparent',
                      borderWidth: isToday && !isSelected ? 2 : 0,
                      borderColor: actionColor,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        color: isSelected
                          ? '#fff'
                          : isToday
                            ? actionColor
                            : themeText,
                        fontWeight: isToday || isSelected ? '800' : '500',
                      }}
                    >
                      {day}
                    </Text>
                    {/* Task dot indicator */}
                    {hasTasks && !isSelected && (
                      <View style={{
                        width: 4, height: 4, borderRadius: 2,
                        backgroundColor: allDone ? '#22c55e' : '#f87171',
                        position: 'absolute', bottom: 3,
                      }} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Selected Day Panel ── */}
        {selectedDate && (
          <View>
            {/* Quick Add */}
            <View style={[styles.sectionCard, { backgroundColor: themeCard, flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 8 }]}>
              <TextInput
                style={{ flex: 1, backgroundColor: 'transparent', color: themeText, minHeight: 38, borderWidth: 0, marginRight: 8, fontSize: 15 }}
                placeholder={t.quickAddPlace}
                placeholderTextColor={themeSubText}
                value={calendarQuickTaskText}
                onChangeText={setCalendarQuickTaskText}
              />
              <TouchableOpacity
                style={{ paddingHorizontal: 14, paddingVertical: 7, backgroundColor: actionColor, borderRadius: 10 }}
                onPress={() => {
                  addTask({ text: calendarQuickTaskText.trim(), date: selectedDate, type: "orta", repeat: "none" });
                  setCalendarQuickTaskText("");
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>{t.add}</Text>
              </TouchableOpacity>
            </View>

            {/* Task List */}
            <View style={[styles.sectionCard, { backgroundColor: themeCard }]}>
              <Text style={{ color: themeText, fontWeight: "800", marginBottom: 8 }}>
                {t.dayTasks && t.dayTasks.replace ? t.dayTasks.replace('{date}', selectedDate) : selectedDate}
              </Text>
              {tasks.filter((t: TaskType) => fixDateStringWithYear(t.date) === selectedDate).length === 0 ? (
                <Text style={{ color: themeSubText }}>{t.noTaskDay}</Text>
              ) : (
                tasks
                  .filter((t: TaskType) => fixDateStringWithYear(t.date) === selectedDate)
                  .map((t: TaskType) => (
                    <View
                      key={t.id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginVertical: 6,
                        borderBottomWidth: 1,
                        borderBottomColor: "#f0f0f0",
                        paddingBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          flex: 1,
                          color: t.done ? "#22C55E" : themeText,
                          textDecorationLine: t.done ? "line-through" : "none",
                          fontWeight: "600",
                        }}
                      >
                        {t.text}
                      </Text>
                      <View style={{ flexDirection: "row", gap: 6 }}>
                        {!t.done && (
                          <TouchableOpacity
                            onPress={() => completeTask(t.id)}
                            style={{
                              paddingHorizontal: 10, paddingVertical: 5,
                              borderRadius: 8, backgroundColor: '#22c55e20',
                            }}
                          >
                            <Text style={{ color: '#22c55e', fontWeight: '700', fontSize: 12 }}>✓</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          onPress={() => deleteTask(t.id)}
                          style={{
                            paddingHorizontal: 10, paddingVertical: 5,
                            borderRadius: 8, backgroundColor: '#ef444420',
                          }}
                        >
                          <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 12 }}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}