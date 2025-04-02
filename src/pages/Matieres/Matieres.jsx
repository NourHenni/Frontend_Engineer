import React from "react";
import SidebarLayout from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";

function Matieres() {
  return (
    <div>
       <Navbar />
       <SidebarLayout />
      <h1>Matières</h1>
      <p>This is the Matieres (Subjects) page where you can manage subjects.</p>
      {/* Add your content and functionality here */}
    </div>
  );
}

export default Matieres;
