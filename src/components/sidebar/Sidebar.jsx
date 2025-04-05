import React, { useState } from "react";
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

function SidebarLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  // Define the menu items for the Sidebar
  const MenuItems = [
    {
      label: "Comptes",
      key: "users",
      icon: <img src={groupIcon} style={{ width: 30, height: 30 }} />,
      route: "/home/Users", // Update the route to match your App.jsx
    },
    {
      label: "PFAs",
      key: "pfa",
      icon: <img src={pfa} style={{ width: 30, height: 30 }} />,
      route: "/home/PFA",
    },
    {
      label: "Stages d'été",
      key: "stageEte",
      icon: <img src={ete} style={{ width: 30, height: 30 }} />,
      route: "/home/StageEte",
    },
    {
      label: "Matières",
      key: "matieres",
      icon: <img src={matiere} style={{ width: 30, height: 30 }} />,
      route: "/home/Matieres",
    },
    {
      label: "Compétences",
      key: "competences",
      icon: <img src={competence} style={{ width: 30, height: 30 }} />,
      route: "/home/Competences",
    },
  ];

  return (
    <Sider width={200} className="sider" collapsed={collapsed} collapsible>
      {/* Arrow button to collapse/expand the sidebar */}
      <img
        src={ArrowIcon}
        alt="toggle-sidebar"
        onClick={() => setCollapsed(!collapsed)}
        className={`sider--arrow ${collapsed ? "isClosed" : "isOpen"}`}
      />

      {/* Sidebar Menu */}
      <Menu
        mode="inline"
        className="menu"
        selectedKeys={[location.pathname]} // Met la clé sélectionnée
      >
        {MenuItems.map((item) => (
          <Menu.Item key={item.route} icon={item.icon}>
            <Link to={item.route}>{item.label}</Link>
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
  );
}

export default SidebarLayout;
