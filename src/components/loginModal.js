import React, { useState } from "react";
import "./loginModal.css";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { toast } from "react-toastify";
import { setPersistence, browserLocalPersistence, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, } from "firebase/auth";

/** Fehlermeldungen für Login */
function mapAuthError(err) {
  switch (err?.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "E-Mail oder Passwort ist falsch.";
    case "auth/invalid-email":
      return "Bitte gib eine gültige E-Mail-Adresse ein.";
    case "auth/user-not-found":
      return "Zu dieser E-Mail existiert kein Konto.";
    case "auth/user-disabled":
      return "Dieses Konto wurde deaktiviert.";
    case "auth/too-many-requests":
      return "Zu viele Versuche. Bitte später erneut probieren.";
    default:
      return "Anmeldung fehlgeschlagen. Bitte erneut versuchen.";
  }
}

/** Fehlermeldungen für Registrierung */
function mapRegisterError(err) {
  switch (err?.code) {
    case "auth/email-already-in-use":
      return "Diese E-Mail ist bereits registriert.";
    case "auth/invalid-email":
      return "Bitte gib eine gültige E-Mail-Adresse ein.";
    case "auth/weak-password":
      return "Das Passwort ist zu schwach (mind. 6 Zeichen).";
    default:
      return "Registrierung fehlgeschlagen. Bitte erneut versuchen.";
  }
}

export default function LoginModal({ onClose }) {
  const navigate = useNavigate();

  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);

  // --- LOGIN ---
  async function handleLogin(e) {
    e.preventDefault();
    if (loadingLogin) return;

    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") || "").trim();
    const password = String(f.get("password") || "");

    setLoadingLogin(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, password);

      toast.success("Erfolgreich eingeloggt!");
      navigate("/loginPage", { replace: true });
      onClose?.();
    } catch (err) {
      // Toast-Fehlermeldung
      toast.error(mapAuthError(err));
    } finally {
      setLoadingLogin(false);
    }
  }

  // --- REGISTRIEREN ---
  async function handleRegister(e) {
    e.preventDefault();
    if (loadingRegister) return;

    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const email = String(f.get("email") || "").trim();
    const password = String(f.get("password") || "");

    setLoadingRegister(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      if (name && cred.user) {
        await updateProfile(cred.user, { displayName: name });
      }

      toast.success("Registrierung erfolgreich! Du bist eingeloggt.");
      navigate("/loginPage", { replace: true });
      onClose?.();
    } catch (err) {
      toast.error(mapRegisterError(err));
    } finally {
      setLoadingRegister(false);
    }
  }

  return (
    <div className="loginmodal-overlay" onClick={onClose}>
      <div className="loginmodal" onClick={(e) => e.stopPropagation()}>
        {/* LOGIN */}
        <h2>Login</h2>
        <form onSubmit={handleLogin} className="loginmodal-form">
          <input name="email" type="email" placeholder="E-Mail" required />
          <input name="password" type="password" placeholder="Passwort" required />
          <button type="submit" disabled={loadingLogin}>
            {loadingLogin ? "Einloggen…" : "Einloggen"}
          </button>
        </form>

        <hr className="absatz" />

        {/* REGISTRIEREN */}
        <h2>Registrieren</h2>
        <form onSubmit={handleRegister} className="loginmodal-form">
          <input name="name" type="text" placeholder="Name" required />
          <input name="email" type="email" placeholder="E-Mail" required />
          <input name="password" type="password" placeholder="Passwort" required />
          <div className="loginmodal-actions">
            <button type="submit" disabled={loadingRegister}>
              {loadingRegister ? "Registrieren…" : "Registrieren"}
            </button>
            <button type="button" className="close-btn" onClick={onClose}>
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
