// src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, setPersistence, browserLocalPersistence,} from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, serverTimestamp, query, orderBy, } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyBBpag7Irpl-LNz5ADozy9kYku_c2Hi5cE",
  authDomain: "event-manager-5edb4.firebaseapp.com",
  projectId: "event-manager-5edb4",
  storageBucket: "event-manager-5edb4.firebasestorage.app",
  messagingSenderId: "735659751527",
  appId: "1:735659751527:web:57436b02ab1d941420bcc2",
  measurementId: "G-0JGL77JB39"
  // (optional) storageBucket, messagingSenderId …
};

const app  = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

//export const auth = getAuth(app);

// Login-Session im Browser behalten
setPersistence(auth, browserLocalPersistence).catch(console.error);

// am Ende von src/firebase.js
//export { onAuthStateChanged, signOut } from "firebase/auth";

export { auth, db, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, collection, addDoc, getDocs, doc, setDoc, serverTimestamp, query, orderBy, };