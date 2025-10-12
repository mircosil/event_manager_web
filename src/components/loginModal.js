import React from "react";
import "./loginModal.css";
import { useNavigate } from "react-router-dom";
import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, doc, setDoc, serverTimestamp, } from "../firebase";
import { setPersistence, browserLocalPersistence } from "firebase/auth";

function LoginModal({ onClose }) {
    const navigate = useNavigate();

    async function handleLogin(e) {
      e.preventDefault();
      const f = new FormData(e.currentTarget);
      const email = f.get("email");
      const password = f.get("password");
      console.log("handleLogin values:", { email, hasPass: !!password });
      
      try {
        await setPersistence(auth, browserLocalPersistence);
        const cred = await signInWithEmailAndPassword(auth, email, password);
        console.log("logged in uid:", cred.user.uid);
        navigate("/loginPage", { replace: true });
        onClose?.();
      } catch (err) {
        console.error("Firebase login error:", err);
        alert(mapAuthError(err));
      }
    }
    

    async function handleRegister(e) {
      e.preventDefault();
      const f = new FormData(e.currentTarget);
      const email = f.get("email");
      const password = f.get("password");
      console.log("handleRegister values:", { email, hasPass: !!password });
    
      try {
        // Persistenz setzen (nicht zwingend, aber stabiler)
        await setPersistence(auth, browserLocalPersistence);
    
        // Nur Registrierung – ohne Firestore, ohne Profil
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        console.log("created uid:", cred.user.uid);
    
        // Weiterleitung nach Erfolg
        navigate("/loginPage", { replace: true });
        onClose?.();
      } catch (err) {
        console.error("Register error →", err.code, err.message);
        alert(err.code || err.message);
      }
    }

  return (
    <div className="loginmodal-overlay" onClick={onClose}>
        <div className="loginmodal" onClick={(e) => e.stopPropagation()}>
            <h2>Login</h2>
            <form onSubmit={handleLogin} className="loginmodal-form">
            <input name="email" type="email" placeholder="E-Mail" required />
            <input name="password" type="password" placeholder="Passwort" required />
            <button type="submit">Einloggen</button>
            </form>

            <hr className="absatz"/>

            <h2>Registrieren</h2>
            <form onSubmit={handleRegister} className="loginmodal-form">
            <input name="name" type="name" placeholder="Name" required />
            <input name="email" type="email" placeholder="E-Mail" required />
            <input name="password" type="password" placeholder="Passwort" required />
            <button type="submit">Registrieren</button>
            <button type="button" className="close-btn" onClick={onClose}>
                Abbrechen
            </button>
            </form>
        </div>
    </div>
  );
};

function mapAuthError(err) {
  const code = err?.code || "";
  if (code === "auth/invalid-email") return "Ungültige E-Mail-Adresse.";
  if (code === "auth/email-already-in-use") return "E-Mail wird bereits verwendet.";
  if (code === "auth/weak-password") return "Passwort zu schwach (mind. 6 Zeichen).";
  if (code === "auth/missing-password") return "Bitte ein Passwort eingeben.";
  if (code === "auth/user-not-found" || code === "auth/wrong-password")
    return "E-Mail oder Passwort falsch.";
  if (code === "auth/network-request-failed") return "Netzwerkfehler. Bitte Verbindung prüfen.";
  if (code === "auth/operation-not-allowed")
    return "E-Mail/Passwort-Login ist im Projekt nicht aktiviert.";
  return `Unbekannter Fehler: ${code || "kein Code"}`;
}

export default LoginModal;

