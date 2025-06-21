import { initializeApp } from "firebase/app";
// BEFORE: import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
// AFTER: Import initializeAuth and persistence types directly
import { initializeAuth, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyDlzqRZiN6i3nFvpLBj642LLggQaRxW6E4",
  authDomain: "amc-platform-b2c.web.app",
  projectId: "amc-platform-b2c",
  storageBucket: "amc-platform-b2c.firebasestorage.app",
  messagingSenderId: "703667374408",
  appId: "1:703667374408:web:8e52a3b527dc8058da4b7d",
  measurementId: "G-R1B3G3VBVS"
};

const app = initializeApp(firebaseConfig);

// BEFORE: const auth = getAuth(app);
// This simple initialization doesn't always handle cross-subdomain persistence correctly.

// AFTER: Explicitly initialize auth with persistence
// This is the standard way to ensure session state is managed correctly
// across different subdomains of the same parent domain.
const auth = initializeAuth(app, {
  persistence: [browserLocalPersistence, browserSessionPersistence]
});

const firestore = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export { app, auth, functions, firestore, storage, firestore as db };
