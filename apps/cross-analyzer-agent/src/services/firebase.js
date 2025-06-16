/**
 * @fileoverview Centralized Firebase initialization.
 * This file initializes the Firebase app and exports all the necessary services
 * so that other components can import them from a single, consistent location.
 */
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
// Import other services you might need, e.g., getAuth for authentication.

// Your web app's Firebase configuration
// NOTE: For production, it's highly recommended to use environment variables
// (e.g., process.env.REACT_APP_FIREBASE_API_KEY) instead of hardcoding these keys.
const firebaseConfig = {
    apiKey: "AIzaSyCK_Tjf3QYeKoY-EOaFXcoxlmUwz4WdOP4",
    authDomain: "cross-analyzer-gcp.firebaseapp.com",
    projectId: "cross-analyzer-gcp",
    storageBucket: "cross-analyzer-gcp.firebasestorage.app",
    messagingSenderId: "622141963650",
    appId: "1:622141963650:web:d1ee674d372487ed19e39b",
    measurementId: "G-ELF00TTLKW"
  };

// Initialize Firebase app, preventing re-initialization on hot-reloads
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize and export services
const firestore = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app, 'europe-west1'); // Use the same region as your backend

export { app, firestore, storage, functions };
