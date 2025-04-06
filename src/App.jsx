import "./App.css";
import React, { createContext, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/Auth/Login/LoginPage";
import Competences from "./pages/competences/Competences";
import Matieres from "./pages/matieres/Matieres";

import StageEte from "./pages/stageEte/StageEte";
import Users from "./pages/Users/Users";
import { Spin } from "antd";
import HomePage from "./pages/Home/HomePage"; // Make sure you create this HomePage component
import ProtectedRoute from "./pages/ProtectedRoute";
import "./App.css";
import { fetchUserInfo } from "./services/authServices";
import Pfa from "./pages/pfa/Pfa";
import ListePfa from "./pages/pfa/listePfas/ListePfa"
import StudentDetails from "./pages/Users/StudentDetails";
import TeachersDetails from "./pages/Users/TeachersDetails";
export const UserContext = createContext();

function App() {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const user = await fetchUserInfo();
        setUser(user);
        console.log("user", user.role);
      } catch (e) {
        console.error("Erreur de récupération :", e);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchMe();
    else setLoading(false);
  }, [token]); // Ajoutez token comme dépendance

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
                path="/home/listePfas"
                element={
                  <ProtectedRoute>
                    <ListePfa />
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
             <Route path="/home/Users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/student/:id" element={<StudentDetails />} />
        <Route path="/teacher/:id" element={<TeachersDetails />} />
            </>
          )}

          {/* Routes protégées pour enseignants et étudiants */}
          {token &&
            (user.role === "enseignant" || user.role === "etudiant") && (
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
                      <ListePfa />
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

          {/* Redirection de secours */}
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}

export default App;