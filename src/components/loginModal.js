import React from "react";
import "./loginModal.css";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { setPersistence, browserLocalPersistence, signInWithEmailAndPassword, createUserWithEmailAndPassword, } from "firebase/auth";

function LoginModal({ onClose }) {
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") || "").trim();
    const password = String(f.get("password") || "");
    await signInWithEmailAndPassword(auth, email, password);
    navigate("/loginPage", { replace: true });
    onClose?.();
  }

  async function handleRegister(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") || "").trim();
    const password = String(f.get("password") || "");
    await createUserWithEmailAndPassword(auth, email, password);
    navigate("/loginPage", { replace: true });
    onClose?.();
  }

  /*
  async function handleLogin(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = f.get("email");
    const password = f.get("password");

    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/loginPage", { replace: true });
      onClose?.();
    } catch (err) {
      console.error("LOGIN ERROR:", err.code, err.message);
      alert(
        {
          "auth/invalid-credential": "E-Mail oder Passwort falsch.",
          "auth/wrong-password": "Passwort falsch.",
          "auth/user-not-found": "Kein Konto mit dieser E-Mail.",
          "auth/too-many-requests": "Zu viele Versuche. Warte kurz und versuch es erneut.",
        }[err.code] || `Login fehlgeschlagen: ${err.code || err.message}`
      );
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = f.get("email");
    const password = f.get("password");

    try {
      await setPersistence(auth, browserLocalPersistence);
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/loginPage", { replace: true });
      onClose?.();
    } catch (err) {
      console.error("REGISTER ERROR:", err.code, err.message);
      alert(
        {
          "auth/email-already-in-use": "Diese E-Mail ist bereits registriert.",
          "auth/weak-password": "Passwort zu schwach (mind. 6 Zeichen).",
        }[err.code] || `Registrierung fehlgeschlagen: ${err.code || err.message}`
      );
    }
  }
    */

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
  if (code === "auth/invalid-email") return "Ungültige E-Mail.";
  if (code === "auth/email-already-in-use") return "E-Mail schon vergeben.";
  if (code === "auth/weak-password") return "Passwort zu schwach (min. 6 Zeichen).";
  if (code === "auth/wrong-password" || code === "auth/user-not-found")
    return "E-Mail oder Passwort falsch.";
  if (code === "auth/network-request-failed") return "Netzwerkfehler. Verbindung prüfen.";
  if (code === "auth/operation-not-allowed")
    return "E-Mail/Passwort-Login ist im Projekt nicht aktiviert.";
  return `Fehler: ${code || err?.message || "Unbekannt"}`;
}

export default LoginModal;

