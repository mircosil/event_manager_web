import './App.css';
import React from 'react';
import Navbar from './components/navbar';
import Header from './components/header';
import LoginPage from './components/loginPage';
import { Routes, Route } from "react-router-dom";
import MainPage from './components/mainPage';
import { useNavigate } from "react-router-dom";
import PrivateRoute from './components/PrivateRoute';

function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const Navigate = useNavigate();

  const handleSearch = ({ query, location }) => {
    console.log("Suche:", query, "Ort:", location);
    // hier später: API call / Filter deiner Eventliste
  };

  const handleLoginSuccess = () => setIsLoggedIn(true);
  const handleLogout = () => {
    setIsLoggedIn(false);
    Navigate('./components/mainPage', {replace: true}); // wechselt zur neuen Seite
  };

  return (
    <>
      {/* Dinge, die auf allen Seiten sichtbar sein sollen */}
      <Header 
        onSearch={handleSearch} 
        isLoggedIn={isLoggedIn}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}  
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
