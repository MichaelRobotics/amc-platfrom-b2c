/**
 * @file This file is the single source of truth for initializing the
 * Firebase client-side SDK. It is imported by the platform-shell's
 * index.js to ensure Firebase is configured once for the entire application.
 */
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// --- IMPORTANT ---
// Replace this with your actual Firebase project's configuration object.
// You can find this in your Firebase project settings.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase and export the necessary service instances.
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
// You can also initialize and export other services like getStorage, etc.

export { auth, db, functions, app };