import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";  
import { useState } from "react";  
import ArrowIcon from "../../assets/arrow.svg";  

import "./Sidebar.css";  

function SidebarLayout ()  {
 
  const [collapsed, setCollapsed] = useState(false);

  // Exemple de données de menu (à personnaliser selon ton besoin)
  const MenuItems = [
    { label: "Home", key: "home" },
    { label: "About", key: "about" },
    { label: "Contact", key: "contact" },
  ];

  return (
    <Sider 
      width={250} 
      className="sider" 
      collapsed={collapsed} 
      collapsible
    >
      {/* Bouton d’ouverture/fermeture */}
      <img
        src={ArrowIcon}
        alt="toggle-sidebar"
        onClick={() => setCollapsed(!collapsed)}
        className={`sider--arrow ${collapsed ? "isClosed" : "isOpen"}`}
      />

      {/* Menu latéral */}
      <Menu
        mode="inline"
        items={MenuItems}  // Liste des éléments de menu
        className="menu"
      />
    </Sider>
  );
};
export default SidebarLayout;
