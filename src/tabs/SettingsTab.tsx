import React, { useMemo } from 'react';
import { ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ModernButton from '../components/ModernButton';
import { styles } from '../styles';
import { PetType } from '../types';
import { SettingsTabProps, ThemeColor } from '../types/components';

const PenguinAsset = require("../../assets/images/penguinn.png");

export default function SettingsTab({
  header,
  pet,
  language, setLanguage, user, userDoc, handleLogout, handleDeleteAccount,
  isRegistering, setAuthModalVisible, setIsRegistering,
  simpleMode, setSimpleMode,
  soundEnabled, setSoundEnabled,
  darkMode, setDarkMode,
  themeColorKey, setThemeColorKey,
  handlePurchase,
  hasUnlimitedNameChange, freeNameChangeUsed,
  settingsPetName, setSettingsPetName, handleUpdateName,
  setShowSupportModal, setShowPartnerScreen, setShowBuyCoinsModal, THEME_COLORS, SKUS, STORAGE_KEYS, t,
  themeText, themeSubText, themeCard, actionColor, selectedTheme
}: SettingsTabProps) {
  const topPadding = header ? 10 : 32;
  const otherPets = useMemo(() => {
    const all = [
      { id: "cat" as PetType, name: t.cat, type: "lottie" as const, source: require("../../assets/animations/cat_neutral.json") },
      { id: "dog" as PetType, name: t.dog, type: "lottie" as const, source: require("../../assets/animations/dog_neutral.json") },
      { id: "penguin" as PetType, name: t.penguin || "Penguin", type: "image" as const, source: PenguinAsset },
    ];
    return all.filter((p) => p.id !== pet.type);
  }, [pet.type, t]);

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollGrowPadded, { paddingTop: topPadding }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {header}

      {/* DİL SEÇİMİ */}
      <View style={[styles.sectionCard, { backgroundColor: themeCard, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        <Text style={{ fontWeight: "800", color: themeText }}>{t.languageSelect}</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={() => setLanguage('tr')}
            style={{
              padding: 10, backgroundColor: language === 'tr' ? actionColor : '#eee', borderRadius: 8, marginRight: 8
            }}>
            <Text style={{ color: language === 'tr' ? '#fff' : '#000', fontWeight: '800' }}>TR</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setLanguage('en')}
            style={{
              padding: 10, backgroundColor: language === 'en' ? actionColor : '#eee', borderRadius: 8
            }}>
            <Text style={{ color: language === 'en' ? '#fff' : '#000', fontWeight: '800' }}>EN</Text>
          </TouchableOpacity>
        </View>
      </View>



      {/* ----- HESAP ----- */}
      <Text style={[styles.sectionTitle, { marginTop: 10, color: themeText }]}>{t.account}</Text>
      <View style={[styles.sectionCard, { backgroundColor: themeCard }]}>
        {user ? (
          <View>
            <Text style={{ color: themeText, marginBottom: 10, fontWeight: '700', fontSize: 16 }}>
              👤 {userDoc?.username || user.email || ''}
            </Text>
            <ModernButton title={t.logout} color="#FF5252" onPress={handleLogout} />
          </View>
        ) : (
          <View>
            <Text style={{ color: themeSubText, marginBottom: 10 }}>{t.notLoggedIn}</Text>
            <ModernButton title={t.loginOrRegister} color={actionColor} onPress={() => { setIsRegistering(false); setAuthModalVisible(true); }} />
          </View>
        )}
      </View>

      {/* ----- MAĞAZA ----- */}
      <Text style={[styles.sectionTitle, { marginTop: 20, color: themeText }]}>{t.store}</Text>
      <View style={[styles.sectionCard, { backgroundColor: themeCard }]}>
        <View style={styles.settingRow}>
          <Text style={{ fontWeight: "700", color: themeText, marginBottom: 4 }}>{t.petNameTitle}</Text>
          <TextInput
            placeholder={t.petNamePlace}
            value={settingsPetName}
            onChangeText={setSettingsPetName}
            placeholderTextColor={themeSubText}
            style={[styles.inputModern, { color: themeText, backgroundColor: darkMode ? '#333' : '#f4f4f5' }]}
          />
          <ModernButton
            title={t.updateNameBtn}
            color={actionColor}
            onPress={handleUpdateName}
          />
        </View>
      </View>

      {/* ----- DESTEK ----- */}
      <Text style={[styles.sectionTitle, { marginTop: 20, color: themeText }]}>{t.support}</Text>
      <View style={[styles.sectionCard, { backgroundColor: themeCard }]}>
        <Text style={{ color: themeSubText, marginBottom: 10, fontSize: 14 }}>{t.supportDesc}</Text>
        <ModernButton
          title={t.supportBtn}
          color={actionColor}
          onPress={() => setShowSupportModal(true)}
        />
      </View>

      {/* ----- GENEL AYARLAR ----- */}
      <Text style={[styles.sectionTitle, { marginTop: 20, color: themeText }]}>{t.generalSettings}</Text>
      <View style={[styles.sectionCard, { backgroundColor: themeCard }]}>

        <View style={styles.settingRow}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: 'space-between', width: '100%' }}>
            <Text style={{ color: themeText, fontWeight: '700' }}>{t.simpleMode}</Text>
            <Switch value={simpleMode} onValueChange={setSimpleMode} />
          </View>
        </View>

        <View style={styles.settingRow}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: 'space-between', width: '100%' }}>
            <Text style={{ color: themeText, fontWeight: '700' }}>{t.soundEffects}</Text>
            <Switch value={soundEnabled} onValueChange={setSoundEnabled} />
          </View>
        </View>

        <View style={styles.settingRow}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: 'space-between', width: '100%' }}>
            <Text style={{ color: themeText, fontWeight: '700' }}>{t.darkMode}</Text>
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={{ fontWeight: "700", color: themeText, marginBottom: 6 }}>{t.mainColor}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {THEME_COLORS.map((theme: ThemeColor) => (
              <TouchableOpacity key={theme.key} style={[styles.themeBubble, {
                backgroundColor: theme.main,
                borderColor: themeColorKey === theme.key ? theme.accent : "transparent",
                borderWidth: themeColorKey === theme.key ? 4 : 0,
              }]} onPress={() => setThemeColorKey(theme.key)} />
            ))}
          </ScrollView>
        </View>


      </View>

      {/* ----- HESAP SİL ----- */}
      {user && (
        <TouchableOpacity
          onPress={handleDeleteAccount}
          style={{ alignItems: 'center', marginTop: 24, marginBottom: 16, paddingVertical: 12 }}
          activeOpacity={0.7}
        >
          <Text style={{ color: '#FF3B30', fontWeight: '700', fontSize: 15 }}>
            {t.deleteAccountBtn || 'Delete Account'}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}