import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ isLoggedIn, children }) {
  // Wenn nicht eingeloggt, weiterleiten zur Startseite
  if (!isLoggedIn) {
    return <Navigate to="/components/mainPage" replace />;
  }

  // Wenn eingeloggt, gewünschte Seite anzeigen
  return children;
}
