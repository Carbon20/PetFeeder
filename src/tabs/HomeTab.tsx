import React from 'react';
import {
    Animated,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import CouplePetCard from '../components/CouplePetCard';
import DynamicPetBackground from '../components/DynamicPetBackground';
import HeartPop from '../components/HeartPop';
import HungerBar from '../components/HungerBar';
import ModernButton from '../components/ModernButton';
import PetPreview from '../components/PetPreview';
import { styles } from '../styles';
import { HomeTabProps } from '../types/components';

const PenguinAsset = require("../../assets/images/penguinn.png");

export default function HomeTab({
  header,
  pet,
  progressPercent,
  progressAnim,
  hungerPercent,
  confetti,
  simpleMode,
  themeCard,
  themeText,
  themeSubText,
  actionColor,
  t,
  büyümeHedefi,
  // Couple Mode
  coupleEnabled,
  coupleHasPartner,
  couplePartnerName,
  partnerPet,
  partnerPetLoading,
  myCompletedToday,
  partnerCompletedToday,
  onHighFive,
  setShowAddModal,
  openTimerForTask,
  quickTaskText,
  setQuickTaskText,
  addTask,
  todayTasks,
  completeTask,
  deleteTask,
  sortTasks,
  showHeart,
}: HomeTabProps) {
  const isCoupleActive = !!coupleEnabled && !!coupleHasPartner;
  const partnerLabel =
    (couplePartnerName as string | null) ||
    (t.partnerDefaultName as string | undefined) ||
    'Eş';

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
        {header}
        
        {/* Couple Mode: Split pet card */}
        {!simpleMode && isCoupleActive && (
          <>
            <HeartPop visible={showHeart} size={140} />
            <CouplePetCard
              myPet={pet}
              myProgressPercent={progressPercent}
              myHungerPercent={hungerPercent}
              myBüyümeHedefi={büyümeHedefi}
              myCompletedToday={myCompletedToday || 0}
              partnerPet={partnerPet || null}
              partnerName={partnerLabel}
              partnerLoading={partnerPetLoading || false}
              partnerCompletedToday={partnerCompletedToday || 0}
              onHighFive={onHighFive}
              themeCard={themeCard}
              themeText={themeText}
              themeSubText={themeSubText}
              actionColor={actionColor}
              t={t}
            />
          </>
        )}

        {/* Normal Mode: Single pet card */}
        {!simpleMode && !isCoupleActive && (
          <View style={[styles.petCard, { backgroundColor: themeCard }]}>
            <DynamicPetBackground>
              <HeartPop visible={showHeart} size={140} />
              <View style={{ width: '100%', alignItems: 'center', position: 'relative' }}>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: 24,
                    fontWeight: '800',
                    color: '#fff',
                    marginBottom: 8,
                    marginTop: 4,
                    textShadowColor: 'rgba(0,0,0,0.5)',
                    textShadowRadius: 4,
                  }}
                >
                  {pet.name}
                </Text>
              </View>
              {(() => {
                const ratio = progressPercent;
                let source;
                let previewType: "lottie" | "image" = "lottie";
                try {
                  if (pet.type === "penguin") {
                    previewType = "image";
                    source = PenguinAsset;
                  } else if (pet.type === "dog") {
                    if (ratio < 30) source = require('../../assets/animations/dog_sad.json');
                    else if (ratio < 70) source = require('../../assets/animations/dog_neutral.json');
                    else source = require('../../assets/animations/dog_happy.json');
                  } else {
                    if (ratio < 30) source = require('../../assets/animations/cat_sad.json');
                    else if (ratio < 70) source = require('../../assets/animations/cat_neutral.json');
                    else source = require('../../assets/animations/cat_happy.json');
                  }
                  return (
                    <PetPreview
                      type={previewType}
                      source={source}
                      size={220}
                    />
                  );
                } catch (e) {
                  return (
                    <View style={{ backgroundColor: 'transparent' }}>
                      <Text allowFontScaling={false} style={{ fontSize: 64 }}>
                        {ratio < 30 ? '😢' : ratio < 70 ? '😐' : '😸'}
                      </Text>
                    </View>
                  );
                }
              })()}
            </DynamicPetBackground>

            <View style={{ padding: 16, width: '100%', alignItems: "center" }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Text allowFontScaling={false} style={{ fontWeight: "700", color: themeText, fontSize: 16 }}>{t.growth}</Text>
              </View>
              <View style={styles.progressBarBackgroundLarge}>
                <Animated.View style={[styles.progressBar, {
                  width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
                  backgroundColor: actionColor,
                }]} />
              </View>
              <Text allowFontScaling={false} style={{ color: themeSubText, marginTop: 10, fontSize: 14, fontWeight: '800' }}>
                {t.growthStats.replace('{current}', String(pet.mama)).replace('{target}', String(büyümeHedefi)).replace('{age}', String(pet.age))}
              </Text>
              <View style={{ marginTop: 12, alignItems: "center" }}>
                <Text allowFontScaling={false} style={{ fontWeight: "700", color: themeText, fontSize: 14, marginBottom: 6 }}>
                  {t.hunger}
                </Text>
                <HungerBar percent={hungerPercent} width={160} height={14} />
              </View>
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
          <Text allowFontScaling={false} style={{ color: themeText, fontWeight: "800", marginBottom: 8, fontSize: 16 }}>{t.quickAddTitle}</Text>
          <View style={{flexDirection:'row'}}>
              <TextInput
                allowFontScaling={false}
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
          <Text allowFontScaling={false} style={[styles.sectionTitle, { color: themeText }]}>{t.todayTasks}</Text>
          {todayTasks.length === 0 ? (
            <Text allowFontScaling={false} style={{ color: themeSubText, textAlign: 'center', padding: 20 }}>{t.noTaskToday}</Text>
          ) : (
            <FlatList
              data={[...todayTasks].sort(sortTasks)}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.taskRow}>
                  <TouchableOpacity onPress={() => completeTask(item.id)} disabled={item.done} style={{ marginRight: 12 }}>
                     <View style={[styles.checkboxCircle, { borderColor: item.done ? '#ccc' : actionColor, backgroundColor: item.done ? '#ccc' : '#fff' }]}>
                        {item.done && <Text allowFontScaling={false} style={{color:'#fff', fontWeight:'bold', fontSize:12}}>✓</Text>}
                     </View>
                  </TouchableOpacity>
                  
                  <View style={{ flex: 1 }}>
                    <Text allowFontScaling={false} style={[styles.taskText, { color: themeText, textDecorationLine: item.done ? 'line-through' : 'none', opacity: item.done ? 0.5 : 1 }]}>{item.text}</Text>
                    {item.description ? <Text allowFontScaling={false} style={[styles.taskDescription, { color: themeSubText }]}>{item.description}</Text> : null}
                  </View>
                  
                  {!item.done && (
                    <TouchableOpacity onPress={() => openTimerForTask(item.id, 25 * 60)} style={styles.iconBtn}>
                      <Text allowFontScaling={false} style={{ fontSize: 18 }}>⏱</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.iconBtn}>
                    <Text allowFontScaling={false} style={{ fontSize: 18, color: '#FF5252', fontWeight:'bold' }}>✕</Text>
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