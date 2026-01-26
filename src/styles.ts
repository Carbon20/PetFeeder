import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Genel Layout
  pager: { flex: 1, marginBottom: 90 }, 
  page: { flex: 1 },
  scrollGrowPadded: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 140, paddingTop: 10 },
  headerShifted: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: "900", letterSpacing: -0.5 },
  subtitle: { marginTop: 4, fontSize: 13, fontWeight: "600" },
  headerLogo: { 
    width: 34, 
    height: 34,
  },
  
  // Modern Başlık Stilleri
  titleModern1: { 
    fontSize: 30, 
    fontWeight: "900", 
    letterSpacing: -0.8,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleModern2: { 
    fontSize: 30, 
    fontWeight: "900", 
    letterSpacing: -0.8,
    textShadowColor: 'rgba(0,0,0,0.08)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  titleModern3: { 
    fontSize: 30, 
    fontWeight: "900", 
    letterSpacing: -0.8,
    textShadowColor: 'rgba(0,0,0,0.12)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  headerIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  headerIconBadgeLarge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerRowClean: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  
  madeByCentered: {
    fontSize: 11,
    fontWeight: "700",
    textAlign: "right",
    flexShrink: 1,
  },
  
  madeBy: {
    fontSize: 11,
    fontWeight: "700",
  },

  // Kartlar ve Konteynerler
  petCard: {
    marginBottom: 16,
    borderRadius: 24,
    paddingBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.05)',
    elevation: 4,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10
  },
  sectionCard: { 
    borderRadius: 24, 
    padding: 18, 
    marginBottom: 16, 
    borderWidth: 2, 
    borderColor: 'rgba(0,0,0,0.05)',
    elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
  },
  
  // İlerleme Çubuğu
  petImageLarge: { width: 170, height: 170 },
  progressBarBackgroundLarge: {
    width: "90%",
    height: 18,
    borderRadius: 9,
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)'
  },
  progressBar: { height: "100%", borderRadius: 9 },

  // Ana Sayfa Butonları
  homeActionsContainer: {
    width: '100%',
    marginBottom: 16,
    flexDirection: 'row',
  },

  // Liste Elemanları
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 12 },
  taskRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f3f4f6' 
  },
  checkboxCircle: { width: 26, height: 26, borderRadius: 9, borderWidth: 3, alignItems:'center', justifyContent:'center' },
  taskText: { fontSize: 16, fontWeight: "700" },
  taskDescription: { fontSize: 13, color: '#888', marginTop: 2 },
  taskMeta: { fontSize: 12, marginTop: 4, fontWeight: '600' }, 
  iconBtn: { paddingHorizontal: 8, paddingVertical: 4 },

  // Seçiciler
  petSelect: { padding: 20, borderRadius: 24, borderWidth: 3, borderColor: "transparent", marginHorizontal: 6, alignItems:'center' },
  themeBubble: { borderRadius: 30, margin: 6, width: 50, height: 50 },

  // Zamanlayıcı
  timerBtnOption: { backgroundColor: "#f3f4f6", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20, marginHorizontal: 6 },
  timerResetBtn: { borderWidth: 2, padding: 12, borderRadius: 16, width: "100%", alignItems: "center" },

  // Modallar
  onboardWrap: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  onboardCard: { padding: 24, borderRadius: 32, width: "90%" },
  authCard: { padding: 30, borderRadius: 32, width: "90%", alignItems: 'center' },
  inputModern: { borderWidth: 0, padding: 16, borderRadius: 16, marginBottom: 14, fontSize: 16, width: '100%' },
  
  // Mini Timer (Alt)
  timerMini: {
    position: "absolute",
    bottom: 100, alignSelf:'center',
    paddingHorizontal: 24, paddingVertical: 14, borderRadius: 24,
    flexDirection: "row", alignItems: "center",
    elevation: 8, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10
  },
  timerMiniTitle: { fontWeight: "800", fontSize: 14, color: "rgba(255,255,255,0.9)", marginRight: 8 },
  timerMiniTime: { fontWeight: "900", fontSize: 20 },

  // Navigasyon (Alt Bar)
  navRow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,     
    paddingBottom: 16,      
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
  },
  
  navBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  
  // Ayarlar
  settingRow: { marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 12 },
  choiceButton: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  arrowBtn: { padding: 8 },
});