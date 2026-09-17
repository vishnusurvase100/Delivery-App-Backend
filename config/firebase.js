const admin = require('firebase-admin');

// Note: In production, you will download a 'serviceAccountKey.json' from your Firebase Console 
// (Project Settings > Service Accounts > Generate New Private Key).
// For now, we will set up the structure using environment variables to keep it secure.

try {
  // Option A: If using a JSON file directly (Uncomment below in production)
  // const serviceAccount = require('./serviceAccountKey.json');
  // admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

  // Option B: Using Environment Variables (Recommended for hosting like Render/AWS)
  if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped newline characters
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } else {
    console.warn('Firebase config missing in .env. Push notifications are disabled.');
  }
} catch (error) {
  console.error('Firebase initialization error:', error.message);
}

module.exports = admin;