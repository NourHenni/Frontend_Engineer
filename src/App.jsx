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
import HomePage from "./pages/Home/HomePage";
import ProtectedRoute from "./pages/ProtectedRoute";
import { fetchUserInfo } from "./services/authServices";
import Pfa from "./pages/pfa/Pfa";
import ListePfa from "./pages/pfa/listePfas/ListePfa"
import StudentDetails from "./pages/Users/StudentDetails";
import TeachersDetails from "./pages/Users/TeachersDetails";
import PlanningStages from "./pages/stageEte/PlanningStages";
import ListeStages from './pages/stageEte/ListeStages'; 
import StageDetails from './pages/stageEte/DetailsStage'; 
import TeacherDetailsStage from './pages/stageEte/TeacherDetailsStage'; 
import AffectationView from "./pages/stageEte/student/AffectationView";  
import PeriodManagement from './pages/stageEte/PeriodManagement';




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
          <Route
                path="/home/Users"
                element={
                  <ProtectedRoute>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route path="/student/:id" element={<StudentDetails />} />
              <Route path="/teacher/:id" element={<TeachersDetails />} />
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
              <Route path="/planning-stages" element={<PlanningStages />} />
              <Route
  path="/internship/:type/:id"
  element={
    <ProtectedRoute>
      <StageDetails />
    </ProtectedRoute>
  }
/>
<Route
  path="/periods/StageEte"
  element={
    <ProtectedRoute>
      <PeriodManagement />
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

              
<Route path="/affectation/:type" element={<AffectationView />} />
              <Route
  path="/internship/:type/:id"
  element={
    <ProtectedRoute>
      <TeacherDetailsStage />
    </ProtectedRoute>
  }
/>
              <Route path="/planning-stages" element={<PlanningStages />} />

            </>
          )}

          {/* Redirection de secours */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
