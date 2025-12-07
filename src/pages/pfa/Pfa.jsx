import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import SidebarLayout from "../../components/Sidebar/Sidebar";
import TableData from "../../components/table/TableData";
import { Select, Space, Spin } from "antd";
import moment from "moment";
import ButtonModel from "../../components/button/Button";
import { PlusOutlined } from "@ant-design/icons";
import "./Pfa.css";
import AddPeriod from "./addPeriod/AddPeriod";
import { useNavigate } from "react-router-dom";
import { fetchPeriod } from "../../services/pfaServices"; // Import de la fonction pour récupérer les périodes
import UpdatePeriod from "./updatePeriod/UpdatePeriod";
import dayjs from "dayjs";
import { getLastAcademicYear } from "../../services/appServices";

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
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYearFilter, setSelectedYearFilter] = useState(null);
  const [currentAcademicYear, setCurrentAcademicYear] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    date: [],
    select: "",
  });

  // Charger les périodes au montage du composant
 useEffect(() => {
  const loadPeriods = async () => {
    setLoading(true);
    try {
      const academicYearResponse = await getLastAcademicYear();
      const academicYear = academicYearResponse.data;
      setCurrentAcademicYear(academicYear);
      const defaultYear = academicYear.year;

      const data = await fetchPeriod();
      console.log("Périodes récupérées :", data);

      // Extraire et trier les années académiques de manière fiable
      const years = [
        ...new Set(
          data
            .map((period) => period.year)
            .filter(year => year) // ignore les valeurs falsy
        )
      ].sort((a, b) => {
        const startA = parseInt(a.split('-')[0], 10);
        const startB = parseInt(b.split('-')[0], 10);
        return startB - startA; // ordre décroissant (2025-2026, 2024-2025, ...)
      });

      setAvailableYears(years);
      const yearToUse = selectedYearFilter || defaultYear;
      const filtered = data.filter((period) => period.year === yearToUse);
      setPeriods(filtered);

      if (!selectedYearFilter) {
        setSelectedYearFilter(defaultYear);
      }
    } catch (error) {
      console.error("Erreur lors du chargement ou filtrage des périodes :", error);
    } finally {
      setLoading(false);
    }
  };
  loadPeriods();
}, [selectedYearFilter]);

  const refreshData = async () => {
    const data = await fetchPeriod();
    const filtered = data.filter(
      (periode) => periode.year === selectedYearFilter
    );
    setPeriods(filtered);
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
          <>
            <Select
              placeholder="Filtrer par année"
              style={{ width: 200, marginLeft: 10 }}
              value={selectedYearFilter}
              onChange={(value) => setSelectedYearFilter(value || null)}
              allowClear
            >
              {availableYears.map((year) => (
                <Select.Option key={year} value={year}>
                  {year}
                </Select.Option>
              ))}
            </Select>
            <TableData columns={columns} data={periods} />
          </>
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
