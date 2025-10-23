// src/components/header.js
import React, { useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import LoginModal from "./loginModal";
import "./header.css";

const HEADER_TABS = [
  { key: "all",     label: "Alle" },
  { key: "today",   label: "Heute" },
  { key: "weekend", label: "Dieses Wochenende" },
  { key: "sport",   label: "Sport" },
  { key: "food",    label: "Essen & Trinken" },
  { key: "folk",    label: "Volksfeste" },
  { key: "culture", label: "Kulturen & Traditionen" },
];

export default function Header({ onSearch, isLoggedIn, onLogout, onLoginSuccess }) {
  const [query, setQuery] = useState("");
  const [locationText, setLocationText] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "all";

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.({ query, location: locationText });
  };

  // baut eine URL zur aktuellen Seite auf, nur tab wird gesetzt/ersetzt
  const makeTo = (key) => {
    const sp = new URLSearchParams(searchParams);
    sp.set("tab", key);
    return { pathname: location.pathname, search: `?${sp.toString()}` };
  };

  return (
    <header className="header">
      <div className="header-top">
        {isLoggedIn ? (
          <button className="logout-button" type="button" onClick={onLogout}>
            Logout
          </button>
        ) : (
          <button className="login-button" type="button" onClick={() => setShowLogin(true)}>
            Login
          </button>
        )}
      </div>

      <h1>Deine lokalen Events</h1>

      <form className="searchbar" onSubmit={handleSubmit}>
        <label className="search-label" htmlFor="q">Search Event:</label>
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
          value={locationText}
          onChange={(e) => setLocationText(e.target.value)}
        />
        <button type="submit">Suchen</button>
      </form>

      {/* Tabs – filtern über ?tab=... auf der aktuellen Route */}
      <nav className="topnav">
        {HEADER_TABS.map((t) => (
          <Link
            key={t.key}
            to={makeTo(t.key)}
            replace
            className={`topnav-item ${activeTab === t.key ? "active" : ""}`}
            aria-current={activeTab === t.key ? "page" : undefined}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {!isLoggedIn && showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLoginSuccess={() => {
            onLoginSuccess?.();
            setShowLogin(false);
          }}
        />
      )}
    </header>
  );
}

