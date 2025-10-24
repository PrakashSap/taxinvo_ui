// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// NOTE: Using placeholder config. Ensure this matches your actual Firebase project settings.
const firebaseConfig = {
    apiKey: "AIzaSyAcMgL-5zMxzoWgZmRe3Bo0vWpv5l3Liuc",
    authDomain: "taxinvo.firebaseapp.com",
    projectId: "taxinvo",
    storageBucket: "taxinvo.firebasestorage.app",
    messagingSenderId: "702138223107",
    appId: "1:702138223107:web:5ee28317052d2c5ca15c36",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
