import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCLpOflc7CTF-MRQ1Wcy7ylcXTRZMDR76U",
  authDomain: "calender-6bd14.firebaseapp.com",
  projectId: "calender-6bd14",
  storageBucket: "calender-6bd14.firebasestorage.app",
  messagingSenderId: "353927410893",
  appId: "1:353927410893:web:e600fd8aa080a57f212584",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export for use throughout the app
export { auth, db };
