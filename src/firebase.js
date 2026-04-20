import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBJ3aBCI3FvvK7gmwpO0lYqKGt2WKIrVvU",
  authDomain: "worldcup-watch-nyc.firebaseapp.com",
  projectId: "worldcup-watch-nyc",
  storageBucket: "worldcup-watch-nyc.firebasestorage.app",
  messagingSenderId: "802784850583",
  appId: "1:802784850583:web:6bb36704c6d485d2f6afd2"
}

// Initialize Firebase app
const app = initializeApp(firebaseConfig)

// Auth — handles login, signup, logout
export const auth = getAuth(app)

// Google sign-in provider
export const googleProvider = new GoogleAuthProvider()

// Firestore — the database
export const db = getFirestore(app)
