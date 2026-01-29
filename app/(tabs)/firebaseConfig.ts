import { initializeApp, FirebaseApp } from "firebase/app";

import { initializeAuth, getReactNativePersistence, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";


const firebaseConfig = {
  apiKey: 
  authDomain: "petfeeder-todo.firebaseapp.com",
  projectId: "petfeeder-todo",
  storageBucket: "petfeeder-todo.firebasestorage.app",
  messagingSenderId:
  appId: 
};


const app: FirebaseApp = initializeApp(firebaseConfig);


const auth: Auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db: Firestore = getFirestore(app);


export { auth, db };
