import admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
      // databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL // if needed
    });
  } catch (error) {
    console.error("Firebase admin initialization error", error.stack);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export default admin;
