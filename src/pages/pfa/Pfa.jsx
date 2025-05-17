import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import SidebarLayout from "../../components/Sidebar/Sidebar";
import TableData from "../../components/table/TableData";
import { Space, Spin } from "antd";
import moment from "moment";
import ButtonModel from "../../components/button/Button";
import { PlusOutlined } from "@ant-design/icons";
import "./Pfa.css";
import AddPeriod from "./addPeriod/AddPeriod";
import { useNavigate } from "react-router-dom";
import { fetchPeriod } from "../../services/pfaServices"; // Import de la fonction pour récupérer les périodes
import UpdatePeriod from "./updatePeriod/UpdatePeriod";

function Pfa() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [periodData, setPeriodData] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModifying, setIsModifying] = useState(false);
  const [isConsulting, setIsConsulting] = useState(false);
  const [infoPeriod, setInfoPeriod] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    date: [],
    select: "",
  });

  // Charger les périodes au montage du composant
  useEffect(() => {
    const loadPeriods = async () => {
      const data = await fetchPeriod();
      console.log("Périodes récupérées :", data);
      setPeriods(data); // Mettre à jour l'état avec les données récupérées

      setLoading(false);
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
    setIsUpdateModalOpen(false);
  };

  const showModalUpdated = () => {
    setIsUpdateModalOpen(true);
    setIsModalOpen(false);
  };

  const onUpdatePeriod = (info) => {
    setIsUpdateModalOpen(true); // Ouvre le modal de mise à jour
    setIsConsulting(false);
    setIsModifying(true);
    setInfoPeriod(info); // Sauvegarde l'info de la période à modifier

    // Chercher la période à modifier dans la liste des périodes
    const periodData = periods.find((period) => period.id === info.id);

    if (periodData) {
      // Pré-remplir les champs du formulaire de mise à jour
      setFormData({
        name: periodData.Nom || "",
        date:
          periodData.Date_Debut_depot && periodData.Date_Fin_depot
            ? [
                moment(periodData.Date_Debut_depot),
                moment(periodData.Date_Fin_depot),
              ]
            : [],
        select: periodData.type || "",
      });
    } else {
      console.error("Période non trouvée");
    }
  };

  // Navigation
  const handleNavigate = () => {
    navigate("/home/listePfas");
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
      title: "Période de dépot",
      key: "Period",
      render: (_, record) => {
        if (!record.Date_Debut_depot || !record.Date_Fin_depot) return null;
        let startDateDepot = moment(record.Date_Debut_depot).format(
          "DD/MM/YYYY"
        );
        let endDateDepot = moment(record.Date_Fin_depot).format("DD/MM/YYYY");

        return (
          <span>
            du {startDateDepot} au {endDateDepot}
          </span>
        );
      },
    },
    {
      title: "Période pour choisir PFA",
      key: "PeriodChoix",
      render: (_, record) => {
        if (!record.Date_Debut_choix || !record.Date_Fin_choix) return null;

        let startDate = moment(record.Date_Debut_choix).format("DD/MM/YYYY");
        let endDate = moment(record.Date_Fin_choix).format("DD/MM/YYYY");

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
      render: (_, record) => {
        if (record.type !== "PFA Project") return null;

        return (
          <div className="actions">
            <Space>
              <a onClick={() => onUpdatePeriod(record)} className="mr-4">
                Modifier la période
              </a>
              <a onClick={handleNavigate}>Consulter les sujets PFAs</a>
            </Space>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Navbar />
      <SidebarLayout />
      <div className="table">
        <div className="table-header">
          <h2>Liste des périodes</h2>
          <ButtonModel
            onClick={showModal}
            text="Ajouter une période"
            icon={<PlusOutlined />}
          />
        </div>
        {loading ? (
          <div className="spin-container">
            <Spin size="large" />
          </div>
        ) : (
          <TableData columns={columns} data={periods} />
        )}
      </div>

      {isModalOpen && (
        <AddPeriod
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          title={"Ajouter une période"}
          refreshData={refreshData}
          source="periode"
        />
      )}

      {/* Modal "Mettre à jour une période" */}
      {isUpdateModalOpen && (
        <UpdatePeriod
          isModalOpen={isUpdateModalOpen}
          title={"Mettre à jour une période"}
          setIsModalOpen={setIsUpdateModalOpen}
          formData={formData} // Passer formData au modal
          setFormData={setFormData} // Passer la fonction setFormData au modal
          refreshData={refreshData}
          periodData={periodData}
        />
      )}
    </div>
  );
}

export default Pfa;
