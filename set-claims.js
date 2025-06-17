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
 * # To grant a user access to the cross-analyzer-gcp product:
 * node set-claims.js user@example.com --productKey=cross-analyzer-gcp
 *
 * @example
 * # To make a user an admin:
 * node set-claims.js admin@example.com --admin
 */

// Import the Firebase Admin SDK
const admin = require('firebase-admin');
const path = require('path');

// --- CONFIGURATION ---
// IMPORTANT: Update this path to point to your Firebase service account key JSON file.
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
  console.log('Usage: node set-claims.js <user_email> [--admin] [--productKey=key]');
  process.exit(1);
}

// Parse flags for admin and productKey
const claimsToSet = {};
let hasFlags = false;

args.slice(1).forEach(arg => {
  if (arg === '--admin') {
    claimsToSet.admin = true;
    hasFlags = true;
    console.log('-> Setting admin claim to true.');
  } else if (arg.startsWith('--productKey=')) {
    const productKey = arg.split('=')[1];
    if (productKey) {
      
      // --- FIX: This section is corrected ---
      // Instead of setting a top-level productKey, we create the nested 'products' object
      // that ProtectedRoute.js is looking for.
      if (!claimsToSet.products) {
        claimsToSet.products = {}; // Initialize the products object if it doesn't exist
      }
      claimsToSet.products[productKey] = true; // Set the specific product key to true
      // This results in a claim like: { products: { 'cross-analyzer-gcp': true } }
      // --- END FIX ---

      hasFlags = true;
      console.log(`-> Setting product claim for "${productKey}".`);
    } else {
      console.warn('Warning: --productKey flag used without a value. Ignoring.');
    }
  }
});

if (!hasFlags) {
  console.error('Error: Please provide at least one claim flag to set (--admin or --productKey=<key>).');
  process.exit(1);
}

// Main function to set the claims
async function setCustomClaims(email, claims) {
  try {
    console.log(`\nFetching user with email: ${email}...`);
    const user = await admin.auth().getUserByEmail(email);
    console.log(`Successfully found user: ${user.uid}`);

    // We merge the new claims with any existing claims the user might have.
    const existingClaims = user.customClaims || {};
    const mergedClaims = { ...existingClaims, ...claims };
    
    // If we're setting a product key, we need to merge the products object carefully.
    if(claims.products) {
        mergedClaims.products = { ...(existingClaims.products || {}), ...claims.products };
    }

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