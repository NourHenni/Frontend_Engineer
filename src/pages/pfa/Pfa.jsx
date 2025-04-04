import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar/Navbar";
import SidebarLayout from "../../components/sidebar/Sidebar";
import TableData from "../../components/table/TableData";
import { Space } from "antd";
import moment from "moment";
import ButtonModel from "../../components/button/Button";
import { PlusOutlined } from "@ant-design/icons";
import "./Pfa.css";
import AddPeriod from "./addPeriod/AddPeriod";
import { useNavigate } from "react-router-dom";
import { fetchPeriod } from "../../services/pfaServices"; // Import de la fonction pour récupérer les périodes

function Pfa() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [periods, setPeriods] = useState([]); // Stocke les périodes récupérées depuis l'API

  // Charger les périodes au montage du composant
  useEffect(() => {
    const loadPeriods = async () => {
      const data = await fetchPeriod();
      setPeriods(data); // Mettre à jour l'état avec les données récupérées
      console.log(periods);
    };

    loadPeriods();
  }, []);

  const refreshData = async () => {
    const data = await fetchPeriod();
    setPeriods(data); // Mettre à jour l'état avec les données récupérées
  };

  // Ouvrir le modal
  const showModal = () => {
    setIsModalOpen(true);
  };

  // Navigation
  const handleNavigate = () => {
    navigate("/listePfas");
  };

  // Colonnes de la table
  const columns = [
    {
      title: "Nom de la période",
      dataIndex: "Nom",
      key: "name",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Période de PFA",
      key: "Period",
      render: (_, record) => {
        let startDate = moment(record.Date_Debut_depot).format("DD/MM/YYYY");
        let endDate = moment(record.Date_Fin_depot).format("DD/MM/YYYY");

        return (
          <span>
            du {startDate} au {endDate}
          </span>
        );
      },
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a>Modifier la période {record.name}</a>
          <a onClick={handleNavigate}>Consulter les sujets PFAs</a>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Navbar />
      <SidebarLayout />
      <div className="table-container">
        <div className="table-header">
          <h2>Liste des périodes</h2>
          <ButtonModel
            onClick={showModal}
            text="Ajouter une période"
            icon={<PlusOutlined />}
          />
        </div>
        {/* Utilisation des périodes récupérées au lieu des données statiques */}
        <TableData columns={columns} data={periods} />
      </div>

      {
        <AddPeriod
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          title={"Ajouter une période"}
          refreshData={refreshData}
        />
      }
    </div>
  );
}

export default Pfa;
