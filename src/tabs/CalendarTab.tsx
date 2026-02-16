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
      <View style={[styles.sectionCard, { backgroundColor: themeCard }]}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <TouchableOpacity onPress={() => shiftMonth(-1)} style={styles.arrowBtn}>
            <Text style={{ fontSize: 20 }}>⬅️</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "800", color: themeText }}>
            {monthNames[currentMonth]} {currentYear}
          </Text>
          <TouchableOpacity onPress={() => shiftMonth(1)} style={styles.arrowBtn}>
            <Text style={{ fontSize: 20 }}>➡️</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {weekdayShort.map((d:string) => (
            <Text
              key={d}
              style={{
                width: "14.28%",
                textAlign: "center",
                fontWeight: "700",
                color: themeSubText,
                marginBottom: 8,
              }}
            >
              {d}
            </Text>
          ))}
          {daysSafe.map((day: number | null, idx: number) => {
            if (day === null)
              return <View key={idx} style={{ width: "14.28%", aspectRatio: 1 }} />;
            const key = keyOf(day, currentMonth, currentYear);
            const dayTasks = tasks.filter((t: TaskType) => fixDateStringWithYear(t.date) === key);
            const hasTasks = dayTasks.length > 0;
            const allDone = hasTasks && dayTasks.every((t: TaskType) => t.done);

            return (
              <TouchableOpacity
                key={idx}
                style={{
                  width: "14.28%",
                  aspectRatio: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => setSelectedDate(key)}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: selectedDate === key
                      ? actionColor
                      : hasTasks
                      ? allDone
                        ? "#4ADE80"
                        : "#FCA5A5"
                      : "transparent",
                  }}
                >
                  <Text
                    style={{
                      color: selectedDate === key ? "#fff" : themeText,
                      fontWeight: "700",
                    }}
                  >
                    {day}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      
      {selectedDate && (
        <View>
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
                        color: t.done ? "#22C55E" : themeText,
                        textDecorationLine: t.done ? "line-through" : "none",
                        fontWeight: "600",
                      }}
                    >
                      {t.text}
                    </Text>
                    <View style={{ flexDirection: "row" }}>
                      {!t.done && (
                        <TouchableOpacity
                          onPress={() => completeTask(t.id)}
                          style={{ marginRight: 10 }}
                        >
                          <Text>✅</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity onPress={() => deleteTask(t.id)}>
                        <Text style={{ color: "red" }}>🗑</Text>
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