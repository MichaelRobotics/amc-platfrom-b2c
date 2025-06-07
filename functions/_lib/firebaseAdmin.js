// File: functions/_lib/firebaseAdmin.js
// Description: Final corrected version that ignores undefined properties in Firestore.

const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

let firestoreInstance;
let storageInstance;

/**
 * Initializes the Firebase Admin SDK if it hasn't been already.
 * This is an idempotent function.
 */
function initializeFirebaseAdmin() {
    if (admin.apps.length === 0) {
        console.log('[FirebaseAdmin] Initializing Firebase Admin SDK...');
        admin.initializeApp();
        
        // Initialize Firestore with the setting to ignore undefined values
        firestoreInstance = getFirestore();
        firestoreInstance.settings({ ignoreUndefinedProperties: true }); // THIS IS THE FIX
        
        storageInstance = getStorage();
        console.log('[FirebaseAdmin] Firebase Admin SDK initialized successfully.');
    }
}

// Ensure initialization is run at least once to be ready.
initializeFirebaseAdmin();

// Export functions that return the initialized instances.
module.exports = {
    admin,
    firestore: () => {
        if (!firestoreInstance) initializeFirebaseAdmin();
        return firestoreInstance;
    },
    storage: () => {
        if (!storageInstance) initializeFirebaseAdmin();
        return storageInstance;
    }
};
