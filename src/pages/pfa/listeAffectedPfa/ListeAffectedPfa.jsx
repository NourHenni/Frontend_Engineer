import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  MailFilled,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { message, Select, Space, Tag } from "antd";

import ButtonModel from "../../../components/button/Button";
import Navbar from "../../../components/navbar/Navbar";
import SidebarLayout from "../../../components/sidebar/Sidebar";
import TableData from "../../../components/table/TableData";
import ManuelAssignment from "../manualAssignment/ManuelAssignment";

import {
  automatedAssignment,
  fetchPublishedPfas,
  maskedffectedPfas,
  publishAffectedPfas,
  sendAffectedEmail,
} from "../../../services/pfaServices";
import { getLastAcademicYear } from "../../../services/appServices";

import "./ListeAffectedPfa.css";

function ListeAffectedPfa() {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [pfas, setPfas] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYearFilter, setSelectedYearFilter] = useState(null);
  const [currentAcademicYear, setCurrentAcademicYear] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPfaId, setSelectedPfaId] = useState(null);

  const [limit, setLimit] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);

  // Charger les PFAs avec filtrage dynamique
  useEffect(() => {
    const loadAndFilterPfas = async () => {
      setLoading(true);
      try {
        const academicYearResponse = await getLastAcademicYear();
        const academicYear = academicYearResponse.data;
        setCurrentAcademicYear(academicYear);

        const [, defaultYear] = academicYear.year.split("-");
        const defaultYearNum = parseInt(defaultYear, 10);

        const allPfas = await fetchPublishedPfas();
        const years = [...new Set(allPfas.map((pfa) => pfa.annee))].sort(
          (a, b) => b - a
        );
        setAvailableYears(years);

        const yearToUse = selectedYearFilter || defaultYearNum;
        const filtered = allPfas.filter((pfa) => pfa.annee === yearToUse);
        setPfas(filtered);

        if (!selectedYearFilter) {
          setSelectedYearFilter(defaultYearNum);
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement ou filtrage des PFAs :",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadAndFilterPfas();
  }, [selectedYearFilter]);

  // Pagination
  const paginatedData = pfas.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );
  const pagination = {
    current: currentPage,
    pageSize: limit,
    total: pfas.length,
  };

  const handlePaginationChange = (page, pageSize) => {
    setCurrentPage(page);
    setLimit(pageSize);
  };

  // Actions
  const handleAffectedPfa = async () => {
    try {
      setLoading(true);
      const response = await automatedAssignment();
      response.success
        ? message.success(response.message)
        : message.warning(response.message);
      refreshMyData();
    } catch (error) {
      message.error(error?.response?.data?.message || "Erreur inattendue.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublishedPfa = async () => {
    try {
      setLoading(true);
      const response = await publishAffectedPfas();
      response
        ? message.success(response.message)
        : message.warning("Aucun changement.");
      refreshMyData();
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Erreur lors de la publication."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMasquedPfa = async () => {
    try {
      setLoading(true);
      const response = await maskedffectedPfas();
      response
        ? message.success(response.message)
        : message.warning("Aucun changement.");
      refreshMyData();
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Erreur lors du masquage."
      );
    } finally {
      setLoading(false);
    }
  };

  const sendAffectedePfas = async () => {
    try {
      setLoading(true);
      const result = await sendAffectedEmail();
      message.success(result);
      refreshMyData();
    } catch (error) {
      message.error(
        error?.response?.data?.message ||
          error.message ||
          "Une erreur est survenue"
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshMyData = async () => {
    const data = await fetchPublishedPfas();
    const filtered = data.filter((pfa) => pfa.annee === selectedYearFilter);
    setPfas(filtered);
  };

  const handleNavigate = () => {
    navigate("/home/listeSoutenancesPfa");
  };

  const onAffectPfa = (info) => {
    setIsModalOpen(true);
    const pfa = pfas.find((p) => p._id === info._id);
    if (pfa) {
      setSelectedPfaId(pfa._id);
    } else {
      console.error("PFA introuvable");
    }
  };

  // Colonnes du tableau
  const columns = [
    { title: "Code PFA", dataIndex: "code_pfa", key: "code" },
    { title: "Titre du sujet", dataIndex: "titreSujet", key: "titreSujet" },
    {
      title: "Binome",
      dataIndex: "estBinome",
      key: "estBinome",
      render: (binome) => (binome ? "Oui" : "Non"),
    },
    {
      title: "Enseignant",
      dataIndex: "enseignant",
      key: "enseignant",
      render: (ens) => `${ens.nom} ${ens.prenom}`,
    },
    {
      title: "Étudiants",
      dataIndex: "etudiants",
      key: "etudiants",
      render: (etudiants) =>
        etudiants?.map((e, i) => (
          <div key={i}>
            {e.nom} {e.prenom}
          </div>
        )),
    },
    {
      title: "État Affectation",
      dataIndex: "etatAffectation",
      key: "etatAffectation",
      render: (etat) => {
        let color = "red",
          text = "Non affecté";
        if (etat === "affected") {
          color = "green";
          text = "Affecté";
        } else if (etat === "published") {
          color = "blue";
          text = "Publié";
        } else if (etat === "masked") {
          color = "orange";
          text = "Masqué";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => onAffectPfa(record)}>Affecter manuellement</a>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Navbar />
      <SidebarLayout collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="table-container">
        <h3>Liste des sujets PFA affectés</h3>

        <div className="table-header">
          <ButtonModel
            text="Lancer l'affectation automatique"
            onClick={handleAffectedPfa}
            icon={<PlayCircleOutlined />}
          />
          <ButtonModel
            text="Publier les sujets"
            onClick={handlePublishedPfa}
            icon={<EyeOutlined />}
          />
          <ButtonModel
            text="Masquer les sujets"
            onClick={handleMasquedPfa}
            icon={<EyeInvisibleOutlined />}
          />
          <ButtonModel
            text="Envoyer la liste actuelle"
            onClick={sendAffectedePfas}
            icon={<MailFilled />}
          />
          <ButtonModel
            text="Consulter la liste des soutenances"
            onClick={handleNavigate}
            icon={<EyeOutlined />}
          />
        </div>

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

        <TableData
          columns={columns}
          data={paginatedData}
          loading={loading}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
        />
      </div>

      {isModalOpen && (
        <ManuelAssignment
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          title="Affecter manuellement"
          refreshMyData={refreshMyData}
          pfas={pfas}
          selectedPfaId={selectedPfaId}
        />
      )}
    </div>
  );
}

export default ListeAffectedPfa;
