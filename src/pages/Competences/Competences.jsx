import React from "react";
import SidebarLayout from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";

function Competences() {
  return (
    <div>
       <Navbar />
       <SidebarLayout />

      <h1>Compétences</h1>
      <p>This is the Competences page where you can manage skills or competencies.</p>
      {/* Add your content and functionality here */}
    </div>
  );
}

export default Competences;
