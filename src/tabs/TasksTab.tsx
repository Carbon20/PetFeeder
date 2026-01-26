import React from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { styles } from '../styles';
import { fixDateStringWithYear } from '../utils';
import { TasksTabProps } from '../types/components';

export default function TasksTab({
  tasks, sortTasks, completeTask, deleteTask, 
  themeCard, themeText, themeSubText, actionColor, t 
}: TasksTabProps) {
  return (
    <ScrollView contentContainerStyle={styles.scrollGrowPadded} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={[styles.sectionCard, { backgroundColor: themeCard }]}>
        <Text style={[styles.sectionTitle, { color: themeText }]}>{t.allTasks}</Text>
        <FlatList
          data={[...tasks].sort(sortTasks)}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.taskRow}>
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
          )}
        />
      </View>
    </ScrollView>
  );
}