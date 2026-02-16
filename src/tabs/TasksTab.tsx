import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { styles } from '../styles';
import { fixDateStringWithYear } from '../utils';
import { TasksTabProps } from '../types/components';

export default function TasksTab({
  header,
  tasks, sortTasks, completeTask, deleteTask, 
  themeCard, themeText, themeSubText, actionColor, t 
}: TasksTabProps) {
  const topPadding = header ? 10 : 32;
  const routineTasks = useMemo(
    () => tasks.filter((task) => task.repeat && task.repeat !== "none"),
    [tasks]
  );
  const datedTasks = useMemo(
    () => tasks.filter((task) => !task.repeat || task.repeat === "none"),
    [tasks]
  );
  const today = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const parsedGroups = useMemo(() => {
    const map = new Map<string, { date: Date | null; label: string; items: typeof tasks }>();
    const parseDate = (dateStr: string) => {
      const fixed = fixDateStringWithYear(dateStr);
      const parts = fixed.split(".");
      if (parts.length !== 3) return null;
      const [dd, mm, yyyy] = parts.map(Number);
      if (!dd || !mm || !yyyy) return null;
      return new Date(yyyy, mm - 1, dd);
    };
    const labelFor = (date: Date | null, key: string) => {
      if (!date) return key;
      const diff =
        (new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() -
          today.getTime()) /
        (24 * 60 * 60 * 1000);
      if (diff === 1) return t.tomorrow || "Yarın";
      if (diff === -1) return t.yesterday || "Dün";
      if (diff === 0) return t.today || "Bugün";
      return key;
    };
    datedTasks.forEach((task) => {
      const key = fixDateStringWithYear(task.date);
      const date = parseDate(task.date);
      const label = labelFor(date, key);
      if (!map.has(key)) map.set(key, { date, label, items: [] });
      map.get(key)!.items.push(task);
    });
    return Array.from(map.entries()).map(([key, group]) => ({
      key,
      ...group,
    }));
  }, [datedTasks, t, today]);

  const sortedGroups = useMemo(() => {
    const diffOf = (date: Date | null) => {
      if (!date) return Number.POSITIVE_INFINITY;
      const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return Math.round((day.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
    };
    return [...parsedGroups].sort((a, b) => {
      const diffA = diffOf(a.date);
      const diffB = diffOf(b.date);
      const aUpcoming = diffA >= 0;
      const bUpcoming = diffB >= 0;
      if (aUpcoming && !bUpcoming) return -1;
      if (!aUpcoming && bUpcoming) return 1;
      if (diffA !== diffB) return diffA - diffB;
      return a.key.localeCompare(b.key);
    });
  }, [parsedGroups, today]);

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollGrowPadded, { paddingTop: topPadding }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {header}
      <View style={[styles.sectionCard, { backgroundColor: themeCard }]}>
        <Text style={[styles.sectionTitle, { color: themeText }]}>{t.allTasks}</Text>
        {routineTasks.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#0EA5E9",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 10,
                marginBottom: 6,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>
                {t.routines || "Rutinler"}
              </Text>
            </View>
            {routineTasks.sort(sortTasks).map((item) => (
              <View key={item.id} style={styles.taskRow}>
                <TouchableOpacity disabled={item.done} onPress={() => completeTask(item.id)} style={{ marginRight: 12 }}>
                  <View style={[styles.checkboxCircle, { borderColor: item.done ? '#ccc' : actionColor, backgroundColor: item.done ? '#ccc' : '#fff' }]}>
                    {item.done && <Text style={{color:'#fff', fontWeight:'bold', fontSize:12}}>✓</Text>}
                  </View>
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.taskText, { color: themeText, textDecorationLine: item.done ? 'line-through' : 'none' }]}>{item.text}</Text>
                  <Text style={[styles.taskMeta, { color: themeSubText }]}>
                    {(item.repeat === "daily" ? t.repeatDaily : item.repeat === "weekly" ? t.repeatWeekly : t.repeat) || ""}
                  </Text>
                </View>

                <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.iconBtn}>
                  <Text style={{ fontSize: 18, color: '#FF5252', fontWeight:'bold' }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        {sortedGroups.map((group) => (
          <View key={group.key} style={{ marginBottom: 10 }}>
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: actionColor,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 10,
                marginBottom: 6,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>
                {group.label}
              </Text>
            </View>
            {group.items.sort(sortTasks).map((item) => (
              <View key={item.id} style={styles.taskRow}>
                <TouchableOpacity disabled={item.done} onPress={() => completeTask(item.id)} style={{ marginRight: 12 }}>
                  <View style={[styles.checkboxCircle, { borderColor: item.done ? '#ccc' : actionColor, backgroundColor: item.done ? '#ccc' : '#fff' }]}>
                    {item.done && <Text style={{color:'#fff', fontWeight:'bold', fontSize:12}}>✓</Text>}
                  </View>
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.taskText, { color: themeText, textDecorationLine: item.done ? 'line-through' : 'none' }]}>{item.text}</Text>
                  <Text style={[styles.taskMeta, { color: themeSubText }]}>
                    {fixDateStringWithYear(item.date)} 
                    {item.repeat && item.repeat !== "none" ? " • ♻️" : ""}
                  </Text>
                </View>

                <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.iconBtn}>
                  <Text style={{ fontSize: 18, color: '#FF5252', fontWeight:'bold' }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}