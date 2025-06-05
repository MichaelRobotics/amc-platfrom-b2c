// File: functions/_lib/firebaseAdmin.js
// Description: Initializes and exports the Firebase Admin SDK.
// Uses Firebase Functions config for service account credentials.

const admin = require("firebase-admin");
const functions = require("firebase-functions"); // Required to access functions.config()

try {
  if (!admin.apps.length) {
    // Get service account key from Firebase Functions config
    // The key should be stored as a JSON string in the environment configuration
    // e.g., firebase functions:config:set secrets.firebase_service_account_key_json="..."
    const serviceAccountString = functions.config().secrets.firebase_service_account_key_json;
    if (!serviceAccountString) {
      console.error(
        "Firebase service account key JSON string is not set in Functions config (secrets.firebase_service_account_key_json). " +
        "Ensure it's configured correctly using 'firebase functions:config:set secrets.firebase_service_account_key_json=\"<JSON_CONTENT>\"'"
      );
      throw new Error("Service account key not configured.");
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountString);
    } catch (e) {
      console.error("Failed to parse service account key JSON string:", e.message);
      console.error("Make sure the entire JSON key content is correctly pasted as a string when setting the config.");
      throw new Error("Invalid service account key format.");
    }
    
    // Get storage bucket URL from Firebase Functions config
    // e.g., firebase functions:config:set secrets.firebase_storage_bucket_url="..."
    const storageBucketUrl = functions.config().secrets.firebase_storage_bucket_url;
     if (!storageBucketUrl) {
      console.warn(
        "Firebase Storage bucket URL is not set in Functions config (secrets.firebase_storage_bucket_url). " +
        "File uploads might not work as expected."
      );
    }


    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: storageBucketUrl || undefined, // Ensure it's undefined if not set, matching original logic
    });
    console.log("Firebase Admin SDK initialized successfully.");
  }
} catch (error) {
  console.error("Firebase Admin SDK initialization error:", error.stack); // Changed to error.stack for more detail
  // To prevent functions from attempting to run with an uninitialized admin SDK,
  // you might re-throw or handle this in a way that stops further execution if critical.
}

const firestore = admin.firestore();
const storage = admin.storage(); // Export storage for use in functions

module.exports = { admin, firestore, storage };
