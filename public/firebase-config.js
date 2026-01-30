// --- FIREBASE CONFIGURATION ---
// REPLACE THE VALUES BELOW WITH YOUR OWN FIREBASE CONFIG FROM THE CONSOLE
const firebaseConfig = {
    apiKey: "AIzaSyCij_lx3soFwbSxAIa3QuwTpTsfNUt1JOc",
    authDomain: "polinalk.firebaseapp.com",
    projectId: "polinalk",
    storageBucket: "polinalk.firebasestorage.app",
    messagingSenderId: "730062617765",
    appId: "1:730062617765:web:7c21d4b2b3b3b3b3b3b3b3"
};

// Initialize Firebase (Compat version for script-tag usage)
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

console.log("Firebase initialized");
