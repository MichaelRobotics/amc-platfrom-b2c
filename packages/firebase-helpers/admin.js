/**
 * @file This file is the single source of truth for initializing the
 * Firebase Admin SDK for all backend Cloud Functions in the monorepo.
 * Each function codebase (e.g., in user-dashboard/functions) will import
 * the `admin` and `db` instances from this shared package.
 */
import * as admin from 'firebase-admin';

// Initialize the Admin SDK.
// When deployed to Cloud Functions, the SDK automatically uses the
// project's service account credentials, so no explicit config is needed.
admin.initializeApp();

// Export the initialized services for use in your Cloud Functions.
const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

export { admin, db, auth, storage };
