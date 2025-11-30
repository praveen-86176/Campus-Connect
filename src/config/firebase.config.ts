import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDoVWomzb6WNuLLKyQdgnBNCzkCKiHJI4Y",
    authDomain: "campus-connect-26c81.firebaseapp.com",
    projectId: "campus-connect-26c81",
    storageBucket: "campus-connect-26c81.firebasestorage.app",
    messagingSenderId: "12012525850",
    appId: "1:12012525850:web:7149c8bf024135b3eb74a3",
    measurementId: "G-DTPC5VGWMD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
