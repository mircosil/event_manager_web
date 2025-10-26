import './App.css';
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Header from './components/header';
import MainPage from './components/mainPage';
import LoginPage from './components/loginPage';
import PrivateRoute from './components/PrivateRoute';
import { auth, onAuthStateChanged, signOut } from "./firebase";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, [])

  const handleSearch = ({ query, location }) => {
    console.log("Suche:", query, "Ort:", location);
    // hier später: API call / Filter deiner Eventliste
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/", { replace: true });
  };



  return (
    <>
      {/* Dinge, die auf allen Seiten sichtbar sein sollen */}
      <Header 
        onSearch={handleSearch} 
        isLoggedIn={!!user}
        onLogout={handleLogout} 
      />

      {/* Seitenwechsel hier */}
      <Routes>
        <Route path="/" element={<MainPage />} />        {/* Startseite */}

        <Route
          path="/loginPage"
          element={
            <PrivateRoute isLoggedIn={!!user}>
              <LoginPage />
            </PrivateRoute>
         }
         />

        <Route path="*" element={<MainPage />} />        {/* Fallback */}
      </Routes>

      <ToastContainer
        position="top-center"
        theme="colored"
        autoClose={3500}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </>
  );
}