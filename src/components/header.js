import React, { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import LoginModal from "./loginModal";
import "./header.css";

const HEADER_TABS = [
  { key: "all",     label: "Alle" },
  { key: "today",   label: "Heute" },
  { key: "weekend", label: "Dieses Wochenende" },
  { key: "Sport",   label: "Sport" },
  { key: "Essen & Trinken",    label: "Essen & Trinken" },
  { key: "Volksfest",    label: "Volksfeste" },
  { key: "Kultur & Tradition", label: "Kultur & Tradition" },
];

export default function Header({ onSearch, isLoggedIn, onLogout, onLoginSuccess }) {
  const [query, setQuery] = useState("");
  const [locationText, setLocationText] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "all";

  // Suchfelder
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setLocationText(searchParams.get("loc") || "");
  }, [searchParams]);

  // Hilfsfunktion: baut das Link-Ziel für einen Tab
  const makeTo = (tabKey) => {
    const sp = new URLSearchParams(searchParams);
    if (tabKey && tabKey !== "all") sp.set("tab", tabKey);
    else sp.delete("tab");
    return { pathname: location.pathname, search: sp.toString() };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSearch?.({ query, location: locationText });

    const sp = new URLSearchParams(searchParams);
    if (query?.trim()) sp.set("q", query.trim());
    else sp.delete("q");

    if (locationText?.trim()) sp.set("loc", locationText.trim());
    else sp.delete("loc");

    setSearchParams(sp, { replace: true });
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

      <h1>Erlebe deine Region</h1>

      <form className="searchbar" onSubmit={handleSubmit}>
        <label className="search-label" htmlFor="q">Event suchen:</label>
        <input
          id="q"
          type="text"
          placeholder="Event suchen"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <input
          id="loc"
          type="text"
          placeholder="Ort suchen"
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


