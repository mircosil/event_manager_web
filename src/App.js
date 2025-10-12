import './App.css';
import React from 'react';
import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Header from './components/header';
import Navbar from './components/navbar';
import MainPage from './components/mainPage';
import LoginPage from './components/loginPage';
import PrivateRoute from './components/PrivateRoute';
import { auth, onAuthStateChanged, signOut } from "./firebase";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const Navigate = useNavigate();

  useEffect(() => {
    // Firebase hört auf Login/Logout-Status
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false); // egal ob eingeloggt oder nicht
    });
    return () => unsub();
  }, []);

  if (loading) {
    return <div style={{ padding: 24 }}>⏳ Lade …</div>;
  }

  const handleSearch = ({ query, location }) => {
    console.log("Suche:", query, "Ort:", location);
    // hier später: API call / Filter deiner Eventliste
  };

  const handleLogout = async () => {
    await signOut(auth);
    Navigate('./components/mainPage', {replace: true}); // wechselt zur neuen Seite
  };

  const isLoggedIn = !!user; 

  return (
    <>
      {/* Dinge, die auf allen Seiten sichtbar sein sollen */}
      <Header 
        onSearch={handleSearch} 
        isLoggedIn={!!user}
        onLogout={() => auth.signOut()}  
      />
      <Navbar />

      {/* Seitenwechsel hier */}
      <Routes>
        <Route
          path="/components/mainPage"
          element={<MainPage />}  // deine Startseite
        />
        <Route index element={<MainPage />} />
        <Route // Ziel nach Login
          path="/components/loginPage"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <LoginPage />
            </PrivateRoute>  
          }
        />
      </Routes>
    </>
  );
}

export default App;
