import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, googleProvider, db } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)       // Firebase auth user object
  const [profile, setProfile] = useState(null) // Firestore user profile
  const [loading, setLoading] = useState(true)  // still checking if logged in

  // Listen for auth state changes — fires on login, logout, and page refresh
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        await loadProfile(firebaseUser.uid)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsubscribe // cleanup listener on unmount
  }, [])

  // Load user profile document from Firestore
  const loadProfile = async (uid) => {
    const ref = doc(db, 'users', uid)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      setProfile(snap.data())
    }
  }

  // Create account with email + password
  const signUp = async (email, password, username) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(result.user, { displayName: username })
    // Create their Firestore profile document
    await setDoc(doc(db, 'users', result.user.uid), {
      username,
      email,
      teamPrefs: [],
      createdAt: serverTimestamp(),
      photoURL: '',
    })
    await loadProfile(result.user.uid)
    return result
  }

  // Sign in with email + password
  const signIn = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  // Sign in with Google popup
  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider)
    const ref = doc(db, 'users', result.user.uid)
    const snap = await getDoc(ref)
    // Only create profile doc if it doesn't already exist
    if (!snap.exists()) {
      await setDoc(ref, {
        username: result.user.displayName || 'Anonymous',
        email: result.user.email,
        teamPrefs: [],
        createdAt: serverTimestamp(),
        photoURL: result.user.photoURL || '',
      })
    }
    await loadProfile(result.user.uid)
    return result
  }

  // Log out
  const logOut = () => signOut(auth)

  // Update profile in Firestore (username, teamPrefs, etc)
  const updateUserProfile = async (data) => {
    if (!user) return
    const ref = doc(db, 'users', user.uid)
    await setDoc(ref, data, { merge: true }) // merge: true means only update fields provided
    setProfile(prev => ({ ...prev, ...data }))
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      logOut,
      updateUserProfile,
      reloadProfile: () => user && loadProfile(user.uid),
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — any component can call useAuth() to get user state and auth functions
export const useAuth = () => useContext(AuthContext)
