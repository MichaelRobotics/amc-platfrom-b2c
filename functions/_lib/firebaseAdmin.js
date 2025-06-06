// File: functions/_lib/firebaseAdmin.js
// Description: Initializes and exports the Firebase Admin SDK.
// Uses environment variables from Secret Manager via apphosting.yaml.

const admin = require("firebase-admin");

try {
  if (!admin.apps.length) {
    // Option 1: Use Application Default Credentials (Recommended for Firebase Functions)
    // When running on Firebase Functions, the service account is automatically configured
    // This is the simplest and most secure approach
    
    // Option 2: If you need a specific service account, use environment variables
    // Set in apphosting.yaml:
    // env:
    //   - variable: FIREBASE_SERVICE_ACCOUNT_KEY
    //     secret: firebase-service-account-key
    //   - variable: FIREBASE_STORAGE_BUCKET
    //     secret: firebase-storage-bucket-url
    
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;
    const storageBucketUrl = process.env.FIREBASE_STORAGE_BUCKET_URL;
    
    let initConfig = {};
    
    if (serviceAccountKey) {
      // Using explicit service account from Secret Manager
      try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        initConfig.credential = admin.credential.cert(serviceAccount);
        console.log("Firebase Admin SDK initializing with explicit service account from Secret Manager.");
      } catch (e) {
        console.error("Failed to parse service account key JSON from environment variable:", e.message);
        throw new Error("Invalid service account key format in FIREBASE_SERVICE_ACCOUNT_KEY.");
      }
    } else {
      // Using Application Default Credentials (recommended for Firebase Functions)
      console.log("Firebase Admin SDK initializing with Application Default Credentials.");
      // No need to set credential explicitly - Firebase Functions automatically provides it
    }
    
    if (storageBucketUrl) {
      initConfig.storageBucket = storageBucketUrl;
    } else {
      console.warn(
        "Firebase Storage bucket URL not set in FIREBASE_STORAGE_BUCKET environment variable. " +
        "File uploads might not work as expected. Consider setting this in apphosting.yaml."
      );
    }

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