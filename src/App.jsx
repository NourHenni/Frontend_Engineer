import React, { createContext, useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { Spin } from "antd";
import "./App.css";

import LoginPage from "./pages/Auth/Login/LoginPage";
import Competences from "./pages/competences/Competences";
import Matieres from "./pages/matieres/Matieres";
import Pfa from "./pages/pfa/Pfa";
import StageEte from "./pages/stageEte/StageEte";
import Users from "./pages/Users/Users";
import HomePage from "./pages/Home/HomePage";
import ProtectedRoute from "./pages/ProtectedRoute";
import { fetchUserInfo } from "./services/authServices";
import ListeStages from "./pages/stageEte/ListeStages";

// Contexte global utilisateur
export const UserContext = createContext();

function App() {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const userData = await fetchUserInfo();
        setUser(userData);
        console.log("user", userData.role);
      } catch (e) {
        console.error("Erreur de récupération :", e);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <div className="spin-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <UserContext.Provider value={user}>
      <Router>
        <Routes>
          {/* Route publique */}
          <Route path="/" element={<LoginPage />} />

          {/* Routes protégées pour admin */}
          {token && user.role === "admin" && (
            <>
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/home/PFA"
                element={
                  <ProtectedRoute>
                    <Pfa />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/home/StagesAdmin"
                element={
                  <ProtectedRoute>
                    <ListeStages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/home/Matieres"
                element={
                  <ProtectedRoute>
                    <Matieres />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/home/Competences"
                element={
                  <ProtectedRoute>
                    <Competences />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/home/Users"
                element={
                  <ProtectedRoute>
                    <Users />
                  </ProtectedRoute>
                }
              />
              
            </>
          )}

          {/* Routes protégées pour enseignants et étudiants */}
          {token && (user.role === "enseignant" || user.role === "etudiant") && (
            <>
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/home/PFA"
                element={
                  <ProtectedRoute>
                    <Pfa />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/home/Matieres"
                element={
                  <ProtectedRoute>
                    <Matieres />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/home/StageEte"
                element={
                  <ProtectedRoute>
                    <StageEte />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/home/Competences"
                element={
                  <ProtectedRoute>
                    <Competences />
                  </ProtectedRoute>
                }
              />
            </>
          )}

          {/* Redirection fallback */}
          
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
