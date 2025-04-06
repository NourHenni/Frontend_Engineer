import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserContext } from "../App";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = useContext(UserContext);
  //const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
