import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  increment,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

// ─── RSVPs ────────────────────────────────────────────────────────

export const addRsvp = async (userId, type, targetName) => {
  const ref = await addDoc(collection(db, 'rsvps'), {
    userId,
    type,
    targetName,
    createdAt: serverTimestamp(),
  })
  // Increment the venue's RSVP count in real time
  if (type === 'bar') {
    const countRef = doc(db, 'venueCounts', targetName)
    await setDoc(countRef, { rsvpCount: increment(1), name: targetName }, { merge: true })
  }
  return ref.id
}

export const removeRsvp = async (rsvpId, type, targetName) => {
  await deleteDoc(doc(db, 'rsvps', rsvpId))
  // Decrement the venue's RSVP count
  if (type === 'bar') {
    const countRef = doc(db, 'venueCounts', targetName)
    await setDoc(countRef, { rsvpCount: increment(-1), name: targetName }, { merge: true })
  }
}

export const getUserRsvps = async (userId) => {
  const q = query(collection(db, 'rsvps'), where('userId', '==', userId))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Real-time listener for all venue RSVP counts
export const subscribeToVenueCounts = (callback) => {
  return onSnapshot(collection(db, 'venueCounts'), (snap) => {
    const counts = {}
    snap.docs.forEach(d => {
      counts[d.id] = d.data().rsvpCount || 0
    })
    callback(counts)
  })
}

// ─── CHECK-INS ────────────────────────────────────────────────────

export const checkIn = async (userId, username, venueName) => {
  const ref = doc(db, 'checkins', `${userId}_${venueName}`)
  await setDoc(ref, {
    userId,
    username,
    venueName,
    checkedInAt: serverTimestamp(),
  })
}

export const checkOut = async (userId, venueName) => {
  await deleteDoc(doc(db, 'checkins', `${userId}_${venueName}`))
}

// Real-time listener for check-ins at all venues
export const subscribeToCheckins = (callback) => {
  return onSnapshot(collection(db, 'checkins'), (snap) => {
    const checkins = {}
    snap.docs.forEach(d => {
      const data = d.data()
      if (!checkins[data.venueName]) checkins[data.venueName] = []
      checkins[data.venueName].push({ userId: data.userId, username: data.username })
    })
    callback(checkins)
  })
}

export const getUserCheckin = async (userId) => {
  const q = query(collection(db, 'checkins'), where('userId', '==', userId))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() }
}

// ─── COMMENTS ─────────────────────────────────────────────────────

export const addComment = async (userId, username, venueName, text) => {
  await addDoc(collection(db, 'comments'), {
    userId,
    username,
    venueName,
    text,
    createdAt: serverTimestamp(),
  })
}

export const deleteComment = async (commentId) => {
  await deleteDoc(doc(db, 'comments', commentId))
}

// Real-time listener for comments on a specific venue
export const subscribeToComments = (venueName, callback) => {
  const q = query(
    collection(db, 'comments'),
    where('venueName', '==', venueName),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, (snap) => {
    const comments = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(comments)
  })
}

// ─── COMMUNITY EVENTS ─────────────────────────────────────────────

export const submitEvent = async (userId, username, eventData) => {
  const ref = await addDoc(collection(db, 'events'), {
    ...eventData,
    createdBy: userId,
    createdByName: username,
    createdAt: serverTimestamp(),
    approved: true,
  })
  return ref.id
}

export const getCommunityEvents = async () => {
  const q = query(collection(db, 'events'), where('approved', '==', true))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ─── USER PROFILE ─────────────────────────────────────────────────

export const saveProfile = async (userId, data) => {
  await setDoc(doc(db, 'users', userId), data, { merge: true })
}

export const getProfile = async (userId) => {
  const snap = await getDoc(doc(db, 'users', userId))
  return snap.exists() ? snap.data() : null
}
