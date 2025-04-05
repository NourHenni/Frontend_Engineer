import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/Auth/Login/LoginPage";
import Competences from "./pages/Competences/Competences" ;
import Matieres from "./pages/Matieres/Matieres" ;
import Pfa from "./pages/Pfa/Pfa" ;
import StageEte from "./pages/StageEte/StageEte";
import Users from "./pages/Users/Users"
import StudentDetails from "./pages/Users/StudentDetails"
import TeachersDetails from "./pages/Users/TeachersDetails"

import HomePage from "./pages/Home/HomePage"; // Make sure you create this HomePage component
import ProtectedRoute from "./pages/ProtectedRoute";

import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/home/PFA" element={<ProtectedRoute><Pfa/></ProtectedRoute>} />
        <Route path="/home/Matieres" element={<ProtectedRoute><Matieres /></ProtectedRoute>} />
        <Route path="/home/StageEte" element={<ProtectedRoute><StageEte /></ProtectedRoute>} />
        <Route path="/home/Competences" element={<ProtectedRoute><Competences /></ProtectedRoute>} />
        <Route path="/home/Users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/student/:id" element={<StudentDetails />} />
        <Route path="/teacher/:id" element={<TeachersDetails />} />

      </Routes>
    </Router>
  );
}

export default App;
