import React from "react";
import "./loginModal.css";
import { useNavigate } from "react-router-dom";

function LoginModal({ onClose, onLoginSuccess }) {
    const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    //alert("Login erfolgreich!");
    onLoginSuccess?.();
    onClose();
    navigate('./components/loginPage', {replace: true}); // wechselt zur neuen Seite
  };

  return (
    <div className="loginmodal-overlay" onClick={onClose}>
        <div className="loginmodal" onClick={(e) => e.stopPropagation()}>
            <h2>Login</h2>
            <form onSubmit={handleLogin} className="loginmodal-form">
            <input type="email" placeholder="E-Mail" required />
            <input type="password" placeholder="Passwort" required />
            <button type="submit">Einloggen</button>
            </form>

            <hr className="absatz"/>

            <h2>Registrieren</h2>
            <form onSubmit={handleLogin} className="loginmodal-form">
            <input type="name" placeholder="Name" required />
            <input type="email" placeholder="E-Mail" required />
            <input type="password" placeholder="Passwort" required />
            <button type="submit">Registrieren</button>
            <button type="button" className="close-btn" onClick={onClose}>
                Abbrechen
            </button>
            </form>
        </div>
    </div>
  );
};

export default LoginModal;

