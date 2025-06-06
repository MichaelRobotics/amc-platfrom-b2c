// File: functions/_lib/firebaseAdmin.js
// Description: Initializes and exports the Firebase Admin SDK.
// Primarily uses Application Default Credentials for Firebase Functions.

const admin = require("firebase-admin");

try {
  if (!admin.apps.length) {
    const initConfig = {};
    const storageBucketUrl = process.env.STORAGE_BUCKET_URL; // Ensure this matches your secret name

    if (storageBucketUrl) {
      initConfig.storageBucket = storageBucketUrl;
      console.log(`Firebase Admin SDK using storage bucket: ${storageBucketUrl}`);
    } else {
      console.warn(
        "STORAGE_BUCKET_URL environment variable not set. " +
        "Firebase Admin SDK will use the default storage bucket. " +
        "File uploads to a specific bucket might not work as expected if a specific bucket is intended."
      );
    }

    // When running on Firebase Functions, ADC is used by default if no credential is provided.
    admin.initializeApp(initConfig);
    console.log("Firebase Admin SDK initialized successfully using Application Default Credentials.");
  }
} catch (error) {
  console.error("Firebase Admin SDK initialization error:", error.stack);
  throw new Error(`Failed to initialize Firebase Admin SDK: ${error.message}`);
}

const firestore = admin.firestore();
const storage = admin.storage();

module.exports = { admin, firestore, storage };