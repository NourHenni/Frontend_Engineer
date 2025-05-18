import { useContext, useEffect, useState } from "react";
import ButtonModel from "../../../components/button/Button";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  MailFilled,
} from "@ant-design/icons";
import "./ListSoutenance.css";
import TableData from "../../../components/table/TableData";
import {
  createPlanning,
  fetchMySoutenance,
  fetchMySoutenances,
  fetchSoutenacesPfas,
  maskedListeSoutenances,
  publishListeSoutenances,
  sendListSoutenance,
} from "../../../services/pfaServices";
import { message, Select, Space, Tag } from "antd";
import UpdatePlanning from "../updatePlanning/UpadtePlanning";
import { UserContext } from "../../../App";
import { getLastAcademicYear } from "../../../services/appServices";
import Navbar from "../../../components/Navbar/Navbar";
import SidebarLayout from "../../../components/Sidebar/Sidebar";

function ListeSoutenance() {
  dayjs.extend(utc);
  const user = useContext(UserContext);
  const [collapsed, setCollapsed] = useState(true);
  const [soutenances, setSoutenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(4); //
  const [currentPage, setCurrentPage] = useState(1);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYearFilter, setSelectedYearFilter] = useState(null);
  const [currentAcademicYear, setCurrentAcademicYear] = useState(null);
  const [sortByTeacher, setSortByTeacher] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [isConsulting, setIsConsulting] = useState(false);
  const [selectedsoutenanceId, setSelectedSoutenanceId] = useState(null);
  const [formData, setFormData] = useState({
    date_soutenance: "",
    heure_soutenance: "",
    salle: "",
    rapporteur: "",
  });

  const roleToFetcher = {
    admin: fetchSoutenacesPfas,
    enseignant: fetchMySoutenances,
    etudiant: fetchMySoutenance,
  };

  // 🧠 Initialisation de l’année académique + années disponibles
  useEffect(() => {
    const initAcademicYear = async () => {
      try {
        const response = await getLastAcademicYear();
        setCurrentAcademicYear(response.data);

        if (user.role === "admin") {
          const pfas = await fetchSoutenacesPfas();

          // ✅ Extraire l'année depuis le champ `pfa.code_pfa` (ex: "PFA2026-01" → 2026)
          const years = [
            ...new Set(
              pfas
                .map((pfa) => {
                  const code = pfa?.pfa?.code_pfa || "";
                  const match = code.match(/^PFA(\d{4})-/);
                  return match ? parseInt(match[1]) : null;
                })
                .filter(Boolean)
            ),
          ].sort((a, b) => b - a);

          setAvailableYears(years);

          const [, year] = response.data.year.split("-");
          setSelectedYearFilter(parseInt(year));
        }
      } catch (err) {
        console.error("Erreur lors du chargement de l’année académique :", err);
      }
    };
    initAcademicYear();
  }, [user.role]);

  // 🧠 Chargement des soutenances selon le rôle
  useEffect(() => {
    const loadSoutenances = async () => {
      setLoading(true);
      try {
        let data = [];

        if (user.role === "etudiant") {
          data = user.pfa ? await fetchMySoutenance() : [];
        } else {
          const fetcher = roleToFetcher[user.role];
          data = fetcher ? await fetcher() : [];
        }

        // ✅ Filtrage basé sur l’année dans `pfa.code_pfa`
        if (user.role === "admin" && selectedYearFilter) {
          data = data.filter((soutenance) => {
            const code = soutenance?.pfa?.code_pfa || "";
            const match = code.match(/^PFA(\d{4})-/);
            const year = match ? parseInt(match[1]) : null;
            return year === selectedYearFilter;
          });
        }

        if (user.role === "etudiant" && data.length === 0) {
          message.info(
            "Aucune soutenance PFA disponible pour cette année académique."
          );
        }

        setSoutenances(data);
      } catch (error) {
        console.error("Erreur de chargement des soutenances :", error);
      } finally {
        setLoading(false);
      }
    };

    loadSoutenances();
  }, [user.role, selectedYearFilter, user.pfa]);

  const paginatedData = soutenances.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );
  const pagination = {
    current: currentPage,
    pageSize: limit,
    total: soutenances.length,
  };

  const handlePaginationChange = (page, pageSize) => {
    setCurrentPage(page); // Mettre à jour la page courante
    setLimit(pageSize); // Mettre à jour la taille de la page
  };

  const handleSoutenancePlanning = async () => {
    try {
      setLoading(true);
      const response = await createPlanning();
      if (response.success) {
        message.success(response.message);
      }

      const updateSoutenaces = await fetchSoutenacesPfas();
      setSoutenances(updateSoutenaces);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Erreur inattendue.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSoutenancePfa = async () => {
    try {
      setLoading(true);
      const response = await publishListeSoutenances();

      if (response) {
        message.success(response.data.message);

        // ✅ Mise à jour locale des soutenances publiées
        const updatedSoutenances = soutenances.map((soutenance) => ({
          ...soutenance,
          isPublished: true,
        }));
        setSoutenances(updatedSoutenances);
      } else {
        message.warning("Aucune réponse du serveur.");
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Erreur lors de la publication.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMasquedSoutenance = async () => {
    try {
      setLoading(true);
      const response = await maskedListeSoutenances();

      if (response) {
        message.success(response.data.message);
        const updatedSoutenances = soutenances.map((s) => ({
          ...s,
          isPublished: false,
        }));
        setSoutenances(updatedSoutenances);
      } else {
        message.warning("Aucune réponse du serveur.");
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Erreur lors du masquage.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sendSoutenancsePfas = async () => {
    try {
      setLoading(true);
      const result = await sendListSoutenance();
      console.log("result", result);
      message.success(result); // Le serveur retourne déjà un `message` explicite
      const updatedPfas = await fetchSoutenacesPfas();
      setSoutenances(updatedPfas);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Une erreur est survenue";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshMyData = async () => {
    const data = await fetchSoutenacesPfas();
    setSoutenances(data);
  };

  const onUpdateSoutenance = (info) => {
    setIsModalOpen(true);
    setIsConsulting(false);
    setIsModifying(true);

    console.log("info passé à onUpdateSoutenance", info);

    const soutenancesdata = soutenances.find((pfa) => pfa._id === info._id);
    console.log("soutenancesdata", soutenancesdata);
    if (soutenancesdata) {
      setSelectedSoutenanceId(soutenancesdata._id); // <<< ICI on enregistre l'ID !
      setFormData({
        date_soutenance: soutenancesdata.date_soutenance
          ? dayjs.utc(soutenancesdata.date_soutenance)
          : null,
        heure_soutenance: soutenancesdata.heure_soutenance
          ? dayjs(soutenancesdata.heure_soutenance, "HH:mm")
          : null,
        salle: soutenancesdata.salle || "",
        rapporteur: soutenancesdata.rapporteur ?? null,
      });
    } else {
      console.error("soutenance non trouvée");
    }
  };

  const columns = [
    {
      title: "Code PFA",
      dataIndex: ["pfa", "code_pfa"],
      key: "code_pfa",
    },

    {
      title: "Date de soutenance",
      dataIndex: "date_soutenance",
      key: "date_soutenance",
      render: (date) => (date ? dayjs.utc(date).format("YYYY-MM-DD") : ""),
    },

    {
      title: "Heure de soutenance",
      dataIndex: "heure_soutenance",
      key: "heure_soutenance",
    },

    { title: "Salle de soutenance", dataIndex: "salle", key: "salle" },

    {
      title: "Étudiants",
      dataIndex: "etudiants",
      key: "etudiants",
      render: (etudiants) => (
        <>
          {etudiants && etudiants.length > 0
            ? etudiants.map((etudiant, index) => (
                <div key={index}>
                  {etudiant.nom} {etudiant.prenom}
                </div>
              ))
            : null}
        </>
      ),
    },
    {
      title: "Enseignant",
      dataIndex: "enseignant",
      key: "enseignant",
      render: (enseignant) => `${enseignant.nom} ${enseignant.prenom}`,
    },
    {
      title: "Rapporteur",
      dataIndex: "rapporteur",
      key: "rapporteur",
      render: (rapporteur) => `${rapporteur.nom} ${rapporteur.prenom}`,
    },
  ];
  if (user.role === "admin") {
    columns.splice(4, 0, {
      title: "État de publication",
      dataIndex: "isPublished",
      key: "isPublished",
      render: (_, record) => {
        const isPublished = record.isPublished;
        const color = isPublished ? "green" : "red";
        const label = isPublished ? "Publié" : "Masqué";

        return <Tag color={color}>{label}</Tag>;
      },
    });
    columns.splice(8, 0, {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => onUpdateSoutenance(record)}>Modifier Planning</a>
        </Space>
      ),
    });
  }

  return (
    <div>
      <Navbar />
      <SidebarLayout collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="table-container">
        <h2>Liste des soutenances </h2>
        <div className="table-header">
          {user.role === "admin" && (
            <>
              <ButtonModel
                text="Créer le planning de soutenance"
                onClick={handleSoutenancePlanning}
                icon={<EyeOutlined />}
              />
              <ButtonModel
                text="Publier la liste des soutenances"
                onClick={handleSoutenancePfa}
                icon={<EyeOutlined />}
              />
              <ButtonModel
                text="Masquer la liste des soutenances"
                onClick={handleMasquedSoutenance}
                icon={<EyeInvisibleOutlined />}
              />
              <ButtonModel
                text="Envoyer la liste actuelle"
                onClick={sendSoutenancsePfas}
                icon={<MailFilled />}
              />
            </>
          )}
        </div>
        {user.role === "admin" && (
          <>
            {/* ... other admin buttons ... */}
            <Select
              placeholder="Filtrer par année"
              style={{ width: 200, marginLeft: 10 }}
              onChange={(value) => setSelectedYearFilter(value)}
              value={selectedYearFilter}
              allowClear
            >
              <Select.Option value="">Toutes les années</Select.Option>
              {availableYears.map((year) => (
                <Select.Option key={year} value={year}>
                  {year}
                </Select.Option>
              ))}
            </Select>
          </>
        )}
        <TableData
          columns={columns}
          data={paginatedData}
          loading={loading}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
        />
      </div>
      {isModalOpen && (
        <UpdatePlanning
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          title={"Mettre à jour le planning"}
          formData={formData}
          setFormData={setFormData}
          refreshMyData={refreshMyData}
          soutenances={soutenances}
          selectedsoutenanceId={selectedsoutenanceId} // <
        />
      )}
    </div>
  );
}

export default ListeSoutenance;
