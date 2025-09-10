// Import the functions you need from Firebase
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBE7KnNOLbemukdmrW2ti2xxThv7Ev6BIA",
  authDomain: "kitetudes.firebaseapp.com",
  projectId: "kitetudes",
  storageBucket: "kitetudes.firebasestorage.app",
  messagingSenderId: "224631616870",
  appId: "1:224631616870:web:9a2671fac24eb1893f44a7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and provider
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
