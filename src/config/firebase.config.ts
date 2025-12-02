import { initializeApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
    EXPO_PUBLIC_FIREBASE_API_KEY,
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    EXPO_PUBLIC_FIREBASE_APP_ID,
    EXPO_PUBLIC_FIREBASE_IOS_APP_ID,
} from '../constants/creds';

// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDoVWomzb6WNuLLKyQdgnBNCzkCKiHJI4Y",
  authDomain: "campus-connect-26c81.firebaseapp.com",
  projectId: "campus-connect-26c81",
  storageBucket: "campus-connect-26c81.firebasestorage.app",
  messagingSenderId: "12012525850",
  appId: "1:12012525850:web:7149c8bf024135b3eb74a3",
  measurementId: "G-DTPC5VGWMD"
};


const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
    persistence: Platform.OS === 'web'
        ? browserLocalPersistence
        : getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

export { auth, db };
