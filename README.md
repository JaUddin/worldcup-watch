# WorldCup Watch NYC v2 — with Firebase Auth + Persistent Storage

## Setup — run on any laptop

### Step 1 — Install Node.js
Download from https://nodejs.org and install (click the green LTS button)

### Step 2 — Install dependencies
Open a terminal in this folder:
```
npm install
```

### Step 3 — Run the app
```
npm run dev
```
Open your browser at **http://localhost:5173**

---

## Firebase Firestore Security Rules

Go to Firebase Console → Firestore Database → Rules tab and paste this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // RSVPs — users can only manage their own
    match /rsvps/{rsvpId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Community events — any logged-in user can read, only creator can write
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.createdBy == request.auth.uid;
    }
  }
}
```

Click **Publish** after pasting.

---

## Deploy to Vercel (make it live)

1. Push this folder to GitHub (use GitHub Desktop)
2. Go to vercel.com → New Project → import from GitHub
3. Vercel auto-detects Vite — just click Deploy
4. Your site is live at yourproject.vercel.app

---

## File structure

```
src/
├── firebase.js              ← Firebase config and initialization
├── context/
│   └── AuthContext.jsx      ← User session, login, signup, logout
├── services/
│   └── firestore.js         ← All database read/write functions
├── components/
│   ├── AuthScreen.jsx       ← Login and signup UI
│   └── AuthScreen.css
├── data.js                  ← Bars, teams, match schedule
├── App.jsx                  ← Main app — all tabs and logic
├── App.css                  ← All styles
├── main.jsx                 ← Entry point
└── index.css                ← Global styles
```

## Adding a teammate

In Firebase Console → Project Settings → Users and permissions → Add member
Give them Editor role with their Gmail address.
