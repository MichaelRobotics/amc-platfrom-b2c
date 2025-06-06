// File: functions/_lib/firebaseAdmin.js
// Description: Initializes and exports the Firebase Admin SDK.
// Uses Application Default Credentials (ADC) automatically in Firebase Functions.

const admin = require("firebase-admin");

try {
  // Initialize the app only if it hasn't been initialized yet.
  if (!admin.apps.length) {
    // Use Application Default Credentials (Recommended for Firebase Functions)
    // When running on Firebase Functions, the service account is automatically configured.
    // This is the simplest and most secure approach.
    // No need to set credential explicitly - Firebase Functions automatically provides it.

    admin.initializeApp(initConfig);
    console.log("Firebase Admin SDK initialized successfully.");
  }
} catch (error) {
  console.error("Firebase Admin SDK initialization error:", error.stack);
  // Re-throw to prevent functions from running with uninitialized admin SDK
  throw new Error(`Failed to initialize Firebase Admin SDK: ${error.message}`);
}

const firestore = admin.firestore();
const storage = admin.storage();

module.exports = { admin, firestore, storage };