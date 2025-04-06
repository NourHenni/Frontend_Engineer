import React, { useState, useEffect } from "react";
import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import { Link, useLocation } from "react-router-dom"; // Importing Link for routing
import ArrowIcon from "../../assets/arrow.svg";
import competence from "../../assets/icons/strategy.png";
import groupIcon from "../../assets/icons/group.png";
import pfa from "../../assets/icons/project-management.png";
import matiere from "../../assets/icons/education.png";
import ete from "../../assets/icons/strategic-planning_.png";
import "./Sidebar.css";

function SidebarLayout({ collapsed, setCollapsed }) {
  const [userRole, setUserRole] = useState(null);

  // Decode the token to extract the role
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        console.log("Token found:", token); // Debugging: log the token

        // Decode the token (JWT structure: Header.Payload.Signature)
        const base64Url = token.split(".")[1]; // Get the payload part of the JWT token
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Adjust URL-safe base64 characters
        const decodedPayload = JSON.parse(atob(base64)); // Decode and parse the base64 payload

        console.log("Decoded Payload:", decodedPayload); // Debugging: log the decoded payload

        setUserRole(decodedPayload.role); // Assuming 'role' is stored in the token
      } catch (error) {
        console.error("Error decoding token", error);
      }
    } else {
      console.log("No token found in localStorage."); // Debugging: log if no token is found
    }
  }, []);

  useEffect(() => {
    console.log("User role:", userRole); // Debugging: log the role state after it's set
  }, [userRole]); // This will run whenever userRole is updated

  // Define the menu items for the Sidebar with role-based permissions
  const MenuItems = [
    {
      label: "Comptes",
      key: "users",
      icon: <img src={groupIcon} style={{ width: 25, height: 25 }} />,
      route: "/home/Users",
      requiredRoles: ["admin", "enseignant"],
    },
    {
      label: "PFAs",
      key: "pfa",
      icon: <img src={pfa} style={{ width: 30, height: 30 }} />,
      route: "/home/PFA",
      requiredRoles: ["admin", "enseignant", "etudiant"], 
    },
    {
      label: "Stages d'été",
      key: "stageEte",
      icon: <img src={ete} style={{ width: 30, height: 30 }} />,
      route: "/home/StageEte",
      requiredRoles: ["admin", "enseignant", "etudiant"], 
    },
    {
      label: "Matières",
      key: "matieres",
      icon: <img src={matiere} style={{ width: 30, height: 30 }} />,
      route: "/home/Matieres",
      requiredRoles: ["admin", "enseignant", "etudiant"], 
    },
    {
      label: "Compétences",
      key: "competences",
      icon: <img src={competence} style={{ width: 30, height: 30 }} />,
      route: "/home/Competences",
      requiredRoles: ["admin", "enseignant", "etudiant"],
    },
  ];
  

  return (
    <Sider
      width={collapsed ? 80 : 250}
      className={`sider ${collapsed ? "sider-collapsed" : ""}`}
      collapsed={collapsed}
      collapsible
    >
      {/* Arrow button to collapse/expand the sidebar */}
      <img
        src={ArrowIcon}
        alt="toggle-sidebar"
        onClick={() => setCollapsed(!collapsed)}
        className={`sider--arrow ${collapsed ? "isClosed" : "isOpen"}`}
      />

      {/* Sidebar Menu */}
      <Menu mode="inline" className="menu">
      {MenuItems.filter(item => {
  return !item.requiredRoles || item.requiredRoles.includes(userRole);
}).map(item => (
  <Menu.Item key={item.key} icon={item.icon}>
    <Link to={item.route}>{item.label}</Link>
  </Menu.Item>
))}

      </Menu>

    </Sider>
  );
}

export default SidebarLayout;
