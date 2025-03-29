import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import { useState } from "react";
import ArrowIcon from "../../assets/arrow.svg";
import competence from "../../assets/icons/strategy.png";
import groupIcon from "../../assets/icons/group.png";
import pfa from "../../assets/icons/project-management.png";
import matiere from "../../assets/icons/education.png";
import ete from "../../assets/icons/strategic-planning_.png";
import "./Sidebar.css";

function SidebarLayout() {
  const [collapsed, setCollapsed] = useState(false);

  // Exemple de données de menu (à personnaliser selon ton besoin)
  const MenuItems = [
    {
      label: "Comptes",
      key: "home",
      icon: <img src={groupIcon} style={{ width: 25, height: 25 }} />,
    },
    {
      label: "PFAs",
      key: "about",
      icon: <img src={pfa} style={{ width: 30, height: 30 }} />,
    },
    {
      label: "Stages d'été",
      key: "stage",
      icon: <img src={ete} style={{ width: 30, height: 30 }} />,
    },
    {
      label: "Matières",
      key: "matiere",
      icon: <img src={matiere} style={{ width: 25, height: 25 }} />,
    },
    {
      label: "Compétences",
      key: "compétences",
      icon: <img src={competence} style={{ width: 25, height: 25 }} />,
    },
  ];

  return (
    <Sider width={250} className="sider" collapsed={collapsed} collapsible>
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
        items={MenuItems} // Liste des éléments de menu
        className="menu"
      />
    </Sider>
  );
}
export default SidebarLayout;
