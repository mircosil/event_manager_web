import React, { useState } from "react";
import LoginModal from "./loginModal";
import './header.css';





function Header({ onSearch, isLoggedIn, onLogout, onLoginSuccess }) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.({ query, location }); // ruft optionalen Callback aus App auf
  };


  return (
    <header className="header">
      <div className="header-top">
        {isLoggedIn ? (
          <button className="logout-button"  type="button" onClick={onLogout}>Logout</button>
        ) : (
          <button className="login-button" type="button" onClick={() => setShowLogin(true)}>Login</button>
        )}
      </div>

      <h1>Deine lokalen Events</h1>

      <form className="searchbar" onSubmit={handleSubmit}>
        <label className="searchlabel" htmlFor="q">Search Event:</label>
        <input
          id="q"
          type="text"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <input
          id="loc"
          type="text"
          placeholder="Ort suche"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button type="submit">Suchen</button>
      </form>

      {/* 🔽 Modal einbinden */}
      {!isLoggedIn && showLogin && (
        <LoginModal 
          onClose={() => setShowLogin(false)} 
          onLoginSuccess={() => {
            onLoginSuccess();
            setShowLogin(false);
          }}
        />
      )}
    </header>
  );
}

export default Header;