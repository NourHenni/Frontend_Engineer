import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // If there is no token, redirect to the login page
    return <Navigate to="/" />;
  }

  return children; // If there's a token, render the children (HomePage)
};

export default ProtectedRoute;
