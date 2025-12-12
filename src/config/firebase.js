// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, isSupported } from "firebase/messaging";

// Your web app's Firebase configuration
// Project: ecocell-5cf22 (Blaze Plan - Ücretli)
const firebaseConfig = {
  apiKey: "AIzaSyAhMj0ljztXyusfVKLu8R8I7Kp_u8mMdlM",
  authDomain: "ecocell-5cf22.firebaseapp.com",
  projectId: "ecocell-5cf22",
  storageBucket: "ecocell-5cf22.firebasestorage.app",
  messagingSenderId: "357513489226",
  appId: "1:357513489226:web:d915b52699b588b4436fb3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication, Firestore ve Storage servislerini export et
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Firebase Cloud Messaging (Push Notifications)
// iOS Safari'de FCM desteklenmez, hata vermesin diye catch ekledik
let messaging = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then(supported => {
      if (supported) {
        messaging = getMessaging(app);
      } else {
        console.log('FCM not supported on this browser');
      }
    })
    .catch(error => {
      console.log('FCM check failed:', error.message);
    });
}

export { messaging };
export default app;
