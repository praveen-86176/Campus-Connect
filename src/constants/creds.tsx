export const EXPO_PUBLIC_FIREBASE_API_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
export const EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
export const EXPO_PUBLIC_FIREBASE_PROJECT_ID = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
export const EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET;
export const EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
export const EXPO_PUBLIC_FIREBASE_APP_ID = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;
export const EXPO_PUBLIC_FIREBASE_IOS_APP_ID = process.env.EXPO_PUBLIC_FIREBASE_IOS_APP_ID || '1:12012525850:ios:d2bdfd7aa617a9e2eb74a3';
export const EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID = process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID;

// Cloudinary Configuration
export const CLOUDINARY_CLOUD_NAME = 'dkboqz2t9';
export const CLOUDINARY_API_KEY = '153467722819223';
export const CLOUDINARY_API_SECRET = 'ZnrDtMk4-apXrHBqmyr7wFIM-_c';
export const CLOUDINARY_URL = `cloudinary://${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}@${CLOUDINARY_CLOUD_NAME}`;

// Cloudinary Upload Presets
// These match the preset names in your Cloudinary Dashboard
export const CLOUDINARY_PROFILE_PRESET = 'Profile Pic'; // Preset for profile pictures
export const CLOUDINARY_EVENT_PRESET = 'Events'; // Preset for event photos