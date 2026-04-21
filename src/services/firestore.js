import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
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
    userId, type, targetName,
    createdAt: serverTimestamp(),
  })
  if (type === 'bar') {
    await setDoc(doc(db, 'venueCounts', targetName),
      { rsvpCount: increment(1), name: targetName }, { merge: true })
    await setDoc(doc(db, 'appStats', 'global'),
      { totalRsvps: increment(1) }, { merge: true })
  }
  return ref.id
}

export const removeRsvp = async (rsvpId, type, targetName) => {
  await deleteDoc(doc(db, 'rsvps', rsvpId))
  if (type === 'bar') {
    await setDoc(doc(db, 'venueCounts', targetName),
      { rsvpCount: increment(-1), name: targetName }, { merge: true })
    await setDoc(doc(db, 'appStats', 'global'),
      { totalRsvps: increment(-1) }, { merge: true })
  }
}

export const getUserRsvps = async (userId) => {
  const q = query(collection(db, 'rsvps'), where('userId', '==', userId))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const subscribeToVenueCounts = (callback) => {
  return onSnapshot(collection(db, 'venueCounts'), (snap) => {
    const counts = {}
    snap.docs.forEach(d => { counts[d.id] = d.data().rsvpCount || 0 })
    callback(counts)
  })
}

// ─── BAR CLAIMING ─────────────────────────────────────────────────

// Submit a claim request for a bar
export const submitBarClaim = async (userId, userEmail, venueName, claimData) => {
  await addDoc(collection(db, 'claims'), {
    userId,
    userEmail,
    venueName,
    ownerName: claimData.ownerName,
    role: claimData.role,
    contactEmail: claimData.contactEmail,
    verificationNote: claimData.verificationNote,
    status: 'pending', // pending, approved, rejected
    createdAt: serverTimestamp(),
  })
}

// Real-time listener for all claim statuses (so UI updates when admin approves)
export const subscribeToClaimedVenues = (callback) => {
  const q = query(collection(db, 'claims'), where('status', '==', 'approved'))
  return onSnapshot(q, (snap) => {
    const claimed = {}
    snap.docs.forEach(d => {
      const data = d.data()
      claimed[data.venueName] = {
        ownerName: data.ownerName,
        contactEmail: data.contactEmail,
        claimedAt: data.approvedAt,
      }
    })
    callback(claimed)
  })
}

// Check if user has already submitted a claim for a venue
export const getUserClaim = async (userId, venueName) => {
  const q = query(
    collection(db, 'claims'),
    where('userId', '==', userId),
    where('venueName', '==', venueName)
  )
  const snap = await getDocs(q)
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() }
}

// ─── APP STATS ────────────────────────────────────────────────────

export const incrementUserCount = async () => {
  await setDoc(doc(db, 'appStats', 'global'),
    { totalUsers: increment(1) }, { merge: true })
}

export const subscribeToAppStats = (callback) => {
  return onSnapshot(doc(db, 'appStats', 'global'), (snap) => {
    callback(snap.exists() ? snap.data() : {})
  })
}

// ─── REACTIONS ────────────────────────────────────────────────────

export const toggleReaction = async (userId, venueName, emoji) => {
  const reactionId = `${userId}_${venueName}_${emoji}`
  const ref = doc(db, 'reactions', reactionId)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    await deleteDoc(ref)
    await setDoc(doc(db, 'venueReactions', `${venueName}_${emoji}`),
      { venueName, emoji, count: increment(-1) }, { merge: true })
    return false
  } else {
    await setDoc(ref, { userId, venueName, emoji, createdAt: serverTimestamp() })
    await setDoc(doc(db, 'venueReactions', `${venueName}_${emoji}`),
      { venueName, emoji, count: increment(1) }, { merge: true })
    return true
  }
}

export const subscribeToReactions = (callback) => {
  return onSnapshot(collection(db, 'venueReactions'), (snap) => {
    const reactions = {}
    snap.docs.forEach(d => {
      const { venueName, emoji, count } = d.data()
      if (!reactions[venueName]) reactions[venueName] = {}
      reactions[venueName][emoji] = count || 0
    })
    callback(reactions)
  })
}

export const getUserReactions = async (userId) => {
  const q = query(collection(db, 'reactions'), where('userId', '==', userId))
  const snap = await getDocs(q)
  const result = {}
  snap.docs.forEach(d => {
    const { venueName, emoji } = d.data()
    if (!result[venueName]) result[venueName] = []
    result[venueName].push(emoji)
  })
  return result
}

// ─── CHECK-INS ────────────────────────────────────────────────────

export const checkIn = async (userId, username, venueName) => {
  await setDoc(doc(db, 'checkins', `${userId}_${venueName}`), {
    userId, username, venueName,
    checkedInAt: serverTimestamp(),
  })
  await setDoc(doc(db, 'appStats', 'global'),
    { totalCheckins: increment(1) }, { merge: true })
}

export const checkOut = async (userId, venueName) => {
  await deleteDoc(doc(db, 'checkins', `${userId}_${venueName}`))
  await setDoc(doc(db, 'appStats', 'global'),
    { totalCheckins: increment(-1) }, { merge: true })
}

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
    userId, username, venueName, text,
    createdAt: serverTimestamp(),
  })
}

export const deleteComment = async (commentId) => {
  await deleteDoc(doc(db, 'comments', commentId))
}

export const subscribeToComments = (venueName, callback) => {
  const q = query(
    collection(db, 'comments'),
    where('venueName', '==', venueName),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
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
