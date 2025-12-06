import { initializeApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { CREDS } from '../constants/creds';

const firebaseConfig = {
    apiKey: CREDS.FIREBASE_KEY,
    authDomain: CREDS.FIREBASE_AUTH_DOMAIN,
    projectId: CREDS.FIREBASE_PROJECT_ID,
    storageBucket: CREDS.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: CREDS.FIREBASE_MESSAGING_SENDER_ID,
    appId: Platform.select({
        ios: CREDS.FIREBASE_IOS_APP_ID,
        default: CREDS.FIREBASE_APP_ID,
    })
};


const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
    persistence: Platform.OS === 'web'
        ? browserLocalPersistence
        : getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
