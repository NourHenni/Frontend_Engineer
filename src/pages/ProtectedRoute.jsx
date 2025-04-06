import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserContext } from "../App";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  //const location = useLocation();
  const user = useContext(UserContext);

  if (!token || !user) {
    return <Navigate to="/" />;

  }

  return children;
};

export default ProtectedRoute;
