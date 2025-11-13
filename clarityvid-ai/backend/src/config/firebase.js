const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) {
    return admin.app();
  }

  try {
    // Check if running in Firebase Functions (GCP environment)
    const isFirebaseFunctions = process.env.FUNCTION_NAME || process.env.FIREBASE_CONFIG;

    if (isFirebaseFunctions) {
      // Running in Firebase Functions - use default credentials
      admin.initializeApp();
      console.log('✅ Firebase initialized with default credentials (Firebase Functions)');
    } else {
      // Running locally or in other environments - use service account
      const serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
      console.log('✅ Firebase initialized with service account credentials');
    }

    firebaseInitialized = true;
    return admin.app();
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw error;
  }
};

// Initialize Firebase
initializeFirebase();

// Export Firebase services
const db = getFirestore();
const storage = getStorage();
const auth = getAuth();

// Set Firestore settings
db.settings({
  ignoreUndefinedProperties: true,
  timestampsInSnapshots: true,
});

module.exports = {
  admin,
  db,
  storage,
  auth,
  // Helper functions
  FieldValue: admin.firestore.FieldValue,
  Timestamp: admin.firestore.Timestamp,
};
