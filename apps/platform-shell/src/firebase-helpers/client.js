// packages/firebase-helpers/client.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { getFirestore } from "firebase/firestore"; // Added
import { getStorage } from "firebase/storage";   // Added

// Your web app's Firebase configuration
// It's recommended to use environment variables for this
const firebaseConfig = {
  apiKey: "AIzaSyDlzqRZiN6i3nFvpLBj642LLggQaRxW6E4",
  authDomain: "amc-platform-b2c.firebaseapp.com",
  projectId: "amc-platform-b2c",
  storageBucket: "amc-platform-b2c.firebasestorage.app",
  messagingSenderId: "703667374408",
  appId: "1:703667374408:web:8e52a3b527dc8058da4b7d",
  measurementId: "G-R1B3G3VBVS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app, 'europe-west1'); // Specify the region if needed
const firestore = getFirestore(app); // Added for direct Firestore access
const storage = getStorage(app);     // Added for direct Storage access

// Export the necessary Firebase services
export { app, auth, functions, firestore, storage };
