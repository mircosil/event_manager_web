import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ isLoggedIn, children }) {
  return isLoggedIn ? children : <Navigate to="/" replace />;
}

