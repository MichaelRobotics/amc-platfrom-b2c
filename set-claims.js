/**
 * @fileoverview Node.js script to set custom claims for a Firebase user.
 *
 * This script uses the Firebase Admin SDK to grant administrative roles or
 * product subscriptions to a user, identified by their email address.
 *
 * It is intended to be run from the command line in a secure environment
 * where you have access to your service account credentials.
 *
 * @example
 * # To grant a user access to the Lean AI Agent product:
 * node set-claims.js user@example.com --claim=hasLeanAiAgentAccess
 *
 * @example
 * # To make a user an admin:
 * node set-claims.js admin@example.com --admin
 */

// Import the Firebase Admin SDK
const admin = require('firebase-admin');
const path = require('path');

// --- CONFIGURATION ---
// The script expects the service account key to be in the same directory.
const serviceAccountPath = path.resolve(__dirname, './serviceAccountKey.json');
// ---------------------

// Initialize the Firebase Admin App
try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK. Make sure your service account key is correctly placed at:', serviceAccountPath);
  console.error(error.message);
  process.exit(1);
}

// --- SCRIPT LOGIC ---

// Get command-line arguments
const args = process.argv.slice(2);
const email = args[0];

if (!email) {
  console.error('Error: Please provide a user email address as the first argument.');
  console.log('Usage: node set-claims.js <user_email> [--admin] [--claim=key]');
  process.exit(1);
}

// Parse flags for admin and custom claims
const claimsToSet = {};
let hasFlags = false;

args.slice(1).forEach(arg => {
  if (arg === '--admin') {
    claimsToSet.admin = true;
    hasFlags = true;
    console.log('-> Setting admin claim to true.');
  } else if (arg.startsWith('--claim=')) {
    const claimKey = arg.split('=')[1];
    if (claimKey) {
      claimsToSet[claimKey] = true; // Set the claim directly, e.g., { hasLeanAiAgentAccess: true }
      hasFlags = true;
      console.log(`-> Setting claim "${claimKey}" to true.`);
    } else {
      console.warn('Warning: --claim flag used without a value. Ignoring.');
    }
  }
});

if (!hasFlags) {
  console.error('Error: Please provide at least one claim flag to set (--admin or --claim=<key>).');
  process.exit(1);
}

// Main function to set the claims
async function setCustomClaims(email, newClaims) {
  try {
    console.log(`\nFetching user with email: ${email}...`);
    const user = await admin.auth().getUserByEmail(email);
    console.log(`Successfully found user: ${user.uid}`);

    // Merge the new claims with any existing claims the user might have.
    const existingClaims = user.customClaims || {};
    const mergedClaims = { ...existingClaims, ...newClaims };
    
    console.log(`Setting custom claims:`, mergedClaims);
    await admin.auth().setCustomUserClaims(user.uid, mergedClaims);
    console.log('\n✅ Success! Custom claims have been set on the user account.');
    console.log('The user must log out and log back in for the changes to take effect.');

    const updatedUser = await admin.auth().getUser(user.uid);
    console.log('Verified claims:', updatedUser.customClaims);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ An error occurred:');
    if (error.code === 'auth/user-not-found') {
      console.error(`No user found with the email: ${email}`);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Run the script
setCustomClaims(email, claimsToSet);