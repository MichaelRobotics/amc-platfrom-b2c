// packages/firebase-helpers/client.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { getFirestore } from "firebase/firestore"; // Added
import { getStorage } from "firebase/storage";   // Added

// Your web app's Firebase configuration
// It's recommended to use environment variables for this
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app, 'europe-west1'); // Specify the region if needed
const firestore = getFirestore(app); // Added for direct Firestore access
const storage = getStorage(app);     // Added for direct Storage access

// Export the necessary Firebase services
export { app, auth, functions, firestore, storage };
