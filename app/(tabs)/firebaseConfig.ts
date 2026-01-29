import { initializeApp, FirebaseApp } from "firebase/app";

import { initializeAuth, getReactNativePersistence, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";


const firebaseConfig = {
  apiKey: "AIzaSyBk2oQq0E59GQLo9Jg_z-TpmftHES-u5yM",
  authDomain: "petfeeder-todo.firebaseapp.com",
  projectId: "petfeeder-todo",
  storageBucket: "petfeeder-todo.firebasestorage.app",
  messagingSenderId: "834238545050",
  appId: "1:834238545050:web:1bfa82c0819e1cf70d7323"
};


const app: FirebaseApp = initializeApp(firebaseConfig);


const auth: Auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db: Firestore = getFirestore(app);


export { auth, db };
