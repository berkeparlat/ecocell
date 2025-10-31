// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAqiILWy-U28vAXDf8i80IhenzxUT62FGw",
  authDomain: "ecocell-8d794.firebaseapp.com",
  projectId: "ecocell-8d794",
  storageBucket: "ecocell-8d794.firebasestorage.app",
  messagingSenderId: "170224826883",
  appId: "1:170224826883:web:36cea22ecdcec0b332ec36",
  measurementId: "G-X08L87ZDG2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication, Firestore ve Storage servislerini export et
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
