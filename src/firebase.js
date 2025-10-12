// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyBBpag7Irpl-LNz5ADozy9kYku_c2Hi5cE",
  authDomain: "event-manager-5edb4.firebaseapp.com",
  projectId: "event-manager-5edb4",
  appId: "DEINE_APP_ID",
  // (optional) storageBucket, messagingSenderId …
};

const app  = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Login-Session im Browser behalten
setPersistence(auth, browserLocalPersistence);

// am Ende von src/firebase.js
export { onAuthStateChanged, signOut } from "firebase/auth";