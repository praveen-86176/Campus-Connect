import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Note: Firebase configuration is handled in google-services.json (Android) 
// and GoogleService-Info.plist (iOS) for React Native Firebase

// Initialize Auth (already initialized by the native module)
// No need to call initializeApp() - it's done automatically

// Initialize Firestore (already initialized by the native module)
const db = firestore();

export { auth, db };
