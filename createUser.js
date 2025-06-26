// createUser.js
const admin = require('firebase-admin');
const minimist = require('minimist');

// IMPORTANT: Replace with the path to your service account key file
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

// --- User details are now read from named command-line flags ---
const args = minimist(process.argv.slice(2));
const email = args.email;
const password = args.password;
const displayName = args.name; // Using --name for display name
const apiKeySecretName = args.secret; // Using --secret for the key name
// ---

async function createUserAndProfile() {
  if (!email || !password || !displayName || !apiKeySecretName) {
    console.error('Usage: node createUser.js --email <email> --password <password> --name <displayName> --secret <apiKeySecretName>');
    console.error('Example: node createUser.js --email "test@example.com" --password "password123" --name "Test User" --secret "GEMINI_API_KEY_FOR_FREE_TIER_USER"');
    return;
  }

  try {
    // Step 1: Create the user in Firebase Authentication
    console.log('Creating user in Firebase Authentication...');
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: displayName,
      emailVerified: false,
      disabled: false
    });

    console.log(`Successfully created new user in Auth: ${userRecord.uid}`);
    const userId = userRecord.uid;

    // Step 2: Create the user profile document in Firestore
    console.log(`Creating user profile in Firestore for UID: ${userId}`);
    const userDocRef = db.collection('users').doc(userId);

    const now = admin.firestore.FieldValue.serverTimestamp();
    const legalVersion = '2025-06-25';

    await userDocRef.set({
      email: email,
      displayName: displayName,
      apiKeySecretName: apiKeySecretName, // Assign the API key secret name
      createdAt: now,
      stripeCustomerId: null, // Set to null initially
      legal: {
        termsAcceptedVersion: legalVersion,
        termsAcceptedTimestamp: now,
        privacyAcceptedVersion: legalVersion,
        privacyAcceptedTimestamp: now
      }
    });

    console.log(`Successfully created Firestore profile for user: ${userId}`);
    console.log('--- User Creation Complete ---');

  } catch (error) {
    console.error('Error creating user:', error.message);
    if (error.code === 'auth/email-already-exists') {
        console.error('The email address is already in use by another account.');
    }
  }
}

createUserAndProfile();
