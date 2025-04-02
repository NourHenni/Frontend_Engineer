import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Pfa from "./pages/pfa/Pfa";
import ListePfa from "./pages/pfa/listePfas/ListePfa";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// import { Sidebar } from './components/layouts/sidebar/Sidebar';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Pfa />} />

          <Route path="/listePfas" element={<ListePfa role="etudiant" />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
