// --- FIREBASE CONFIGURATION ---
// REPLACE THE VALUES BELOW WITH YOUR OWN FIREBASE CONFIG FROM THE CONSOLE
const firebaseConfig = {
    apiKey: "AIzaSyCon896taIWlaY-6_bElPYQ5hIiWxhLhVY",
    authDomain: "polinaresturant.firebaseapp.com",
    projectId: "polinaresturant",
    storageBucket: "polinaresturant.firebasestorage.app",
    messagingSenderId: "515907915894",
    appId: "1:515907915894:web:79ac25e65ae005f5000f57",
    measurementId: "G-0LPWSR59JH"
};

// Initialize Firebase (Compat version for script-tag usage)
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

console.log("Firebase initialized");
