import { FirebaseApp, initializeApp } from "firebase/app";
// Auth için React Native uyumlu persistence (kalıcılık) ayarı
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Auth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { Database, getDatabase } from "firebase/database";
import { Firestore, getFirestore } from "firebase/firestore";

// --- SENİN BİLGİLERİN (KONSOLDAN ALDIKLARIN) ---
const firebaseConfig = {
  apiKey: "AIzaSyBk2oQq0E59GQLo9Jg_z-TpmftHES-u5yM",
  authDomain: "petfeeder-todo.firebaseapp.com",
  projectId: "petfeeder-todo",
  storageBucket: "petfeeder-todo.firebasestorage.app",
  messagingSenderId: "834238545050",
  appId: "1:834238545050:web:1bfa82c0819e1cf70d7323"
};

// Firebase'i başlat
const app: FirebaseApp = initializeApp(firebaseConfig);

// Auth'u AsyncStorage ile başlat (BU SATIR ÇOK ÖNEMLİ, HATA VERMEMESİ İÇİN)
const auth: Auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db: Firestore = getFirestore(app);

// Realtime Database (Couple Mode / households için)
const realtimeDb: Database = getDatabase(app);

// Analytics'i SİLDİK. Şu anlık kullanma.
export { app, auth, db, realtimeDb };
