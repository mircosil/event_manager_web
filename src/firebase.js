// Firebase v9 modular
import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBBpag7Irpl-LNz5ADozy9kYku_c2Hi5cE",
  authDomain: "event-manager-5edb4.firebaseapp.com",
  projectId: "event-manager-5edb4",
  storageBucket: "…",
  messagingSenderId: "…",
  appId: "…",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
connectAuthEmulator(auth, "http://localhost:9099");
console.log("✅ Auth Emulator verbunden @ http://localhost:9099");
  
const db = getFirestore(app);

// Login soll Browser-weit bestehen bleiben
setPersistence(auth, browserLocalPersistence);

export {
  auth,
  db,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  doc,
  setDoc,
  serverTimestamp,
};
