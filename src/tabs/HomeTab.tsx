import LottieView from 'lottie-react-native';
import React from 'react';
import { Animated, FlatList, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import DynamicPetBackground from '../components/DynamicPetBackground';
import ModernButton from '../components/ModernButton';
import { styles } from '../styles';
import { HomeTabProps } from '../types/components';

export default function HomeTab({
  pet, progressPercent, progressAnim, confetti, simpleMode,
  themeCard, themeText, themeSubText, actionColor, t,
  büyümeHedefi,
  setShowAddModal, openTimerForTask,
  quickTaskText, setQuickTaskText, addTask,
  todayTasks, completeTask, deleteTask, sortTasks
}: HomeTabProps) {

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollGrowPadded} 
        keyboardShouldPersistTaps="handled" 
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
      >
        {!simpleMode && (
          <View style={[styles.petCard, { backgroundColor: themeCard }]}>
            <DynamicPetBackground>
              <Text style={{ fontSize: 24, fontWeight: "800", color: "#fff", marginBottom: 8, marginTop: 4, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 }}>
                {pet.name}
              </Text>
              {(() => {
                const ratio = progressPercent; 
                let source;
                try {
                  if (pet.type === "dog") {
                    if (ratio < 30) source = require("../../assets/animations/dog_sad.json");
                    else if (ratio < 70) source = require("../../assets/animations/dog_neutral.json");
                    else source = require("../../assets/animations/dog_happy.json");
                  } else { 
                    if (ratio < 30) source = require("../../assets/animations/cat_sad.json");
                    else if (ratio < 70) source = require("../../assets/animations/cat_neutral.json");
                    else source = require("../../assets/animations/cat_happy.json");
                  }
                  return <LottieView source={source} autoPlay loop style={styles.petImageLarge} resizeMode="contain" />;
                } catch (e) {
                  return <Text style={{ fontSize: 64 }}>{ratio < 30 ? "😢" : ratio < 70 ? "😐" : "😸"}</Text>;
                }
              })()}
            </DynamicPetBackground>

            <View style={{ padding: 16, width: '100%', alignItems: "center" }}>
              <Text style={{ fontWeight: "700", color: themeText, fontSize: 16 }}>{t.growth}</Text>
              <View style={styles.progressBarBackgroundLarge}>
                <Animated.View style={[styles.progressBar, {
                  width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
                  backgroundColor: actionColor,
                }]} />
              </View>
              <Text style={{ color: themeSubText, marginTop: 10, fontSize: 14, fontWeight: '800' }}>
                {t.growthStats.replace('{current}', String(pet.mama)).replace('{target}', String(büyümeHedefi)).replace('{age}', String(pet.age))}
              </Text>
            </View>

            {confetti && <ConfettiCannon count={80} origin={{ x: 0, y: 0 }} fadeOut explosionSpeed={350} />}
          </View>
        )}

        <View style={[styles.homeActionsContainer, simpleMode && {marginTop: 10, marginBottom: 10}]}>
            <View style={{flex: 2, marginRight: 10}}>
                <ModernButton title={`+ ${t.addTaskBtn}`} onPress={() => setShowAddModal(true)} color={actionColor} />
            </View>
            <View style={{flex: 1}}>
                 <ModernButton title="⏱" onPress={() => openTimerForTask(null, 25 * 60)} color={themeSubText} />
            </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: themeCard }]}>
          <Text style={{ color: themeText, fontWeight: "800", marginBottom: 8, fontSize: 16 }}>{t.quickAddTitle}</Text>
          <View style={{flexDirection:'row'}}>
              <TextInput
                placeholder={t.quickAddPlace}
                value={quickTaskText}
                onChangeText={setQuickTaskText}
                placeholderTextColor={themeSubText}
                style={[styles.inputModern, { flex:1, marginBottom: 0, marginRight: 10, backgroundColor: 'rgba(0,0,0,0.05)', color: themeText }]}
              />
              <ModernButton 
                 title="+" 
                 color={actionColor} 
                 style={{width: 50, paddingVertical: 0}}
                 onPress={() => { addTask(quickTaskText); setQuickTaskText(""); }}
              />
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: themeCard }]}>
          <Text style={[styles.sectionTitle, { color: themeText }]}>{t.todayTasks}</Text>
          {todayTasks.length === 0 ? (
            <Text style={{ color: themeSubText, textAlign: 'center', padding: 20 }}>{t.noTaskToday}</Text>
          ) : (
            <FlatList
              data={[...todayTasks].sort(sortTasks)}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.taskRow}>
                  <TouchableOpacity onPress={() => completeTask(item.id)} disabled={item.done} style={{ marginRight: 12 }}>
                     <View style={[styles.checkboxCircle, { borderColor: item.done ? '#ccc' : actionColor, backgroundColor: item.done ? '#ccc' : '#fff' }]}>
                        {item.done && <Text style={{color:'#fff', fontWeight:'bold', fontSize:12}}>✓</Text>}
                     </View>
                  </TouchableOpacity>
                  
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.taskText, { color: themeText, textDecorationLine: item.done ? 'line-through' : 'none', opacity: item.done ? 0.5 : 1 }]}>{item.text}</Text>
                    {item.description ? <Text style={[styles.taskDescription, { color: themeSubText }]}>{item.description}</Text> : null}
                  </View>
                  
                  {!item.done && (
                    <TouchableOpacity onPress={() => openTimerForTask(item.id, 25 * 60)} style={styles.iconBtn}>
                      <Text style={{ fontSize: 18 }}>⏱</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.iconBtn}>
                    <Text style={{ fontSize: 18, color: '#FF5252', fontWeight:'bold' }}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}