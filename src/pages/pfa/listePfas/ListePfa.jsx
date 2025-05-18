import React, { useContext, useEffect, useState } from "react";
import ButtonModel from "../../../components/button/Button";
import Navbar from "../../../components/Navbar/Navbar";
import SidebarLayout from "../../../components/Sidebar/Sidebar";
import TableData from "../../../components/table/TableData";
import { useNavigate } from "react-router-dom";
import {
  EyeOutlined,
  MailFilled,
  DownOutlined,
  PlusOutlined,
  ExclamationCircleFilled,
  EyeInvisibleFilled,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import {
  Space,
  Dropdown,
  Menu,
  Modal,
  message,
  Select,
  Spin,
  Alert,
  Table,
  Tag,
} from "antd";

import "./ListePfa.css";
import AddPeriod from "../addPeriod/AddPeriod";
import AddPfa from "../addPFA/AddPfa";

import PfaSelectionForm from "../choicePFA/ChoicePfa";
import { UserContext } from "../../../App";
import {
  fetchMyPfa,
  fetchMyPfas,
  fetchPfas,
  fetchPublishedPfas,
  maqsuedPfas,
  sendEmail,
} from "../../../services/pfaServices";
import axios from "axios";
import UpdatePfa from "../updatePfa/UpdatePfa";
import ChoicesModal from "../choicesModel/ChoiceModel";
import { getLastAcademicYear } from "../../../services/appServices";

function ListePfa() {
  const navigate = useNavigate();
  const user = useContext(UserContext);
  const [dataPfas, setDataPfas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedSujet, setSelectedSujet] = useState(null);
  const [limit, setLimit] = useState(4); //
  const [currentPage, setCurrentPage] = useState(1);
  const [isModifying, setIsModifying] = useState(false);
  const [isConsulting, setIsConsulting] = useState(false);
  const [infoPeriod, setInfoPeriod] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sortByTeacher, setSortByTeacher] = useState(false);
  const [selectedTechnology, setSelectedTechnology] = useState("");
  const [technologiesList, setTechnologiesList] = useState([]);
  const [hasPublishedPfas, setHasPublishedPfas] = useState(false);
  const [selectedPfaId, setSelectedPfaId] = useState(null);
  const [collapsed, setCollapsed] = useState(true);
  const [isAffected, setIsAffected] = useState(false);
  const [selectedYearFilter, setSelectedYearFilter] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [currentAcademicYear, setCurrentAcademicYear] = useState(null);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    technologies: [],
    estBinome: "",
    etudiant1: "",
    etudiant2: "",
  });

  const roleToFetcher = {
    admin: fetchPfas,
    enseignant: fetchMyPfas,
  };

  // Fonction pour charger les données
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let result = [];
        let currentAcademicYear = null;

        // 1. Récupérer l'année universitaire actuelle
        try {
          const response = await getLastAcademicYear();
          setCurrentAcademicYear(response.data);
          currentAcademicYear = response.data;
          console.log("Current academic year:", currentAcademicYear.year);
        } catch (error) {
          console.error("Error getting academic year:", error);
        }

        // 2. Récupérer les PFAs selon le rôle
        if (user.role === "etudiant") {
          try {
            result = user.pfa ? await fetchMyPfa() : await fetchPublishedPfas();
          } catch (error) {
            if (
              error.response &&
              error.response.data &&
              error.response.data.message === "Pas encore de sujets PFA publiés"
            ) {
              message.info(error.response.data.message);
              result = [];
            } else {
              throw error;
            }
          }
        } else {
          const fetcher = roleToFetcher[user.role];
          result = fetcher ? await fetcher() : [];
        }

        // 3. Filtrer pour admin selon année sélectionnée
        if (user.role === "admin" && selectedYearFilter) {
          result = result.filter((pfa) => pfa.annee === selectedYearFilter);
        }

        // 4. Debug : Répartition des PFAs par année
        const yearCounts = {};
        result.forEach((pfa) => {
          yearCounts[pfa.annee] = (yearCounts[pfa.annee] || 0) + 1;
        });
        console.log("PFAs by year (before filtering):", yearCounts);

        // 5. Appliquer filtre année universitaire pour les non-admins
        if (user.role !== "admin" && currentAcademicYear?.year) {
          const [_, targetYear] = currentAcademicYear.year.split("-");
          const targetYearNum = parseInt(targetYear, 10);

          console.log(`Filtering PFAs for year: ${targetYearNum}`);

          const initialCount = result.length;
          result = result.filter((pfa) => {
            const pfaYear = parseInt(pfa.annee, 10);
            const matches = pfaYear === targetYearNum;
            if (!matches) {
              console.log(`Excluding PFA ${pfa.code_pfa} (year ${pfaYear})`);
            }
            return matches;
          });

          console.log(`Filter result: ${initialCount} → ${result.length} PFAs`);
        }

        // 6. Enregistrement des PFAs
        setDataPfas(result);

        // 7. Afficher un message s'il n'y a pas de PFAs pour les étudiants
        if (user.role === "etudiant" && result.length === 0) {
          // Ce message sera évité si le backend a déjà envoyé un message via message.info
          // Donc on ne met rien ici
        }

        // 8. Mettre à jour la liste des technologies
        const technologies = [
          ...new Set(result.flatMap((pfa) => pfa.technologies)),
        ];
        setTechnologiesList(technologies);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user.role, user.pfa, selectedYearFilter]);

  const refreshData = async () => {
    const data = await fetchPfas();
    let filteredData = data;

    if (user.role === "admin") {
      // If we have a year filter applied, maintain it
      if (selectedYearFilter) {
        filteredData = data.filter((pfa) => pfa.annee === selectedYearFilter);
      }
      // If no filter is set (shouldn't happen with our default), use academic year
      else if (currentAcademicYear?.year) {
        const [_, targetYear] = currentAcademicYear.year.split("-");
        const targetYearNum = parseInt(targetYear, 10);
        filteredData = data.filter((pfa) => pfa.annee === targetYearNum);
      }
    }

    setDataPfas(filteredData);
  };
  const showModalChoice = () => {
    setIsChoiceModalOpen(true);
  };

  // Fonction pour fermer le modal de consultation des choix
  const handleChoiceCancel = () => {
    setIsChoiceModalOpen(false);
  };
  // Fonction pour filtrer les PFA par technologie
  const handleTechnologyFilter = (value) => {
    setSelectedTechnology(value); // Mettre à jour la technologie sélectionnée

    if (value) {
      const filteredData = dataPfas.filter((pfa) =>
        pfa.technologies.includes(value)
      );
      setDataPfas(filteredData); // Appliquer le filtre
    } else {
      // Si aucune technologie n'est sélectionnée, recharger toutes les données
      loadData();
    }
  };

  // Fonction pour fermer le modal
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const refreshMyData = async () => {
    const data = await fetchMyPfas();
    let filteredData = data;
    if (currentAcademicYear?.year) {
      const [_, targetYear] = currentAcademicYear.year.split("-");
      const targetYearNum = parseInt(targetYear, 10);
      filteredData = data.filter((pfa) => pfa.annee === targetYearNum);
    }
    setDataPfas(filteredData); // Mettre à jour l'état avec les données récupérées
  };

  const handleShowModal = (record) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedRecord(null);
  };

  // Fetch available years for admin filter
  useEffect(() => {
    if (user.role === "admin") {
      const fetchData = async () => {
        try {
          // Get current academic year first
          const academicYearResponse = await getLastAcademicYear();
          setCurrentAcademicYear(academicYearResponse.data);

          // Extract the target year (second part of academic year)
          const [_, targetYear] = academicYearResponse.data.year.split("-");
          const targetYearNum = parseInt(targetYear, 10);

          // Get all PFAs and available years
          const allPfas = await fetchPfas();
          const years = [...new Set(allPfas.map((pfa) => pfa.annee))].sort(
            (a, b) => b - a
          );
          setAvailableYears(years);

          // Always set filter to the academic year's target year
          setSelectedYearFilter(targetYearNum);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchData();
    }
  }, [user.role]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const fetcher = roleToFetcher[user.role];
        if (fetcher) {
          const result = await fetcher();
          // Tri par enseignant si nécessaire
          if (sortByTeacher) {
            result.sort((a, b) => {
              // Trie alphabétique par le nom de l'enseignant (assumes `enseignant.nom` et `enseignant.prenom` sont disponibles)
              const nameA = `${a.enseignant.nom} ${a.enseignant.prenom}`;
              const nameB = `${b.enseignant.nom} ${b.enseignant.prenom}`;
              return nameA.localeCompare(nameB);
            });
          }
          setDataPfas(result);
        }
      } catch (e) {
        console.error("Erreur de chargement :", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user.role, sortByTeacher]); // Ajoute sortByTeacher dans le tableau de dépendances pour déclencher le rechargement
  // Add this useEffect hook near your other useEffect hooks
  useEffect(() => {
    const applyYearFilter = async () => {
      if (user.role === "admin") {
        setLoading(true);
        try {
          let result = await fetchPfas(); // Fetch all PFAs

          if (selectedYearFilter) {
            result = result.filter((pfa) => pfa.annee === selectedYearFilter);
          }

          setDataPfas(result);
        } catch (error) {
          console.error("Error applying year filter:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    applyYearFilter();
  }, [selectedYearFilter, user.role]);
  const onUpdatePfa = (info) => {
    setIsUpdateModalOpen(true);
    setIsConsulting(false);
    setIsModifying(true);
    setInfoPeriod(info);
    console.log("info passé à onUpdatePfa", info);

    const pfasdata = dataPfas.find((pfa) => pfa._id === info._id);
    console.log("pfasdata", pfasdata);
    if (pfasdata) {
      setSelectedPfaId(pfasdata._id); // <<< ICI on enregistre l'ID !
      setFormData({
        titreSujet: pfasdata.titreSujet || "",
        description: pfasdata.description || "",
        technologies: pfasdata.technologies || [],
        estBinome: pfasdata.estBinome || false,
        etudiant1: pfasdata.etudiant1 || "",
        etudiant2: pfasdata.etudiant2 || "",
      });
    } else {
      console.error("pfa non trouvée");
    }
  };

  const handlePaginationChange = (page, pageSize) => {
    setCurrentPage(page); // Mettre à jour la page courante
    setLimit(pageSize); // Mettre à jour la taille de la page
  };

  const paginatedData = dataPfas.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );
  const pagination = {
    current: currentPage,
    pageSize: limit,
    total: dataPfas.length,
  };

  const showModal = () => {
    setIsModalOpen(true);
  };
  const sendPfas = async () => {
    try {
      setLoading(true);
      const result = await sendEmail();
      console.log("result", result);
      message.success(result);

      const updatedPfas = await fetchPfas(); // Mettre à jour avec les nouvelles données
      setDataPfas(updatedPfas);
    } catch (error) {
      const errorMessage = error.message || "Une erreur est survenue";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = () => {
    navigate("/home/listeAffectedPfa");
  };

  const handleNavigateSoutenance = () => {
    navigate("/home/listeSoutenancesPfa");
  };

  const maskedfas = async () => {
    try {
      const responseMessage = await maqsuedPfas();

      if (responseMessage) {
        message.success(responseMessage);
      } // Afficher le message de succès

      const updatedPfas = await fetchPfas(); // Mettre à jour avec les nouvelles données
      setDataPfas(updatedPfas);
      setLoading(false);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Une erreur est survenue";
      message.error(errorMessage);
      setLoading(false);
    }
  };

  const EtatDepotDropdown = ({ record }) => {
    if (user.role !== "admin") return record.etatDepot;

    const handleMenuClick = async (e) => {
      const newEtatDepot = e.key;

      try {
        setLoading(true);
        const response = await axios.patch(
          `http://localhost:5000/pfa/ChangeStatePFA/${record._id}`,
          {
            etatDepot: newEtatDepot,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.status === 200) {
          message.success(response.data.message);

          const updatedPfas = await fetchPfas(); // 👈 Mettre à jour avec les nouvelles données
          setDataPfas(updatedPfas);
          setLoading(false);
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Une erreur est survenue";
        message.error(errorMessage);
        setLoading(false);
      }
    };

    const menu = (
      <Menu onClick={handleMenuClick}>
        <Menu.Item key="rejected">Rejeté</Menu.Item>
      </Menu>
    );

    return (
      <Dropdown overlay={menu} trigger={["click"]}>
        <a onClick={(e) => e.preventDefault()}>
          {record.etatDepot} <DownOutlined />
        </a>
      </Dropdown>
    );
  };

  const showSujetDetails = (sujet) => {
    setSelectedSujet(sujet);
  };

  const closeSujetDetails = () => {
    setSelectedSujet(null);
  };

  const onDeleteSujet = (record) => {
    Modal.confirm({
      title: "Voulez-vous supprimer ce sujet ?",
      icon: <ExclamationCircleFilled />,
      cancelText: "Annuler",
      okText: "Oui",
      onOk: () => {
        return new Promise((resolve, reject) => {
          // Assurez-vous que le token est bien récupéré du localStorage ou autre source
          const token = localStorage.getItem("token");

          if (!token) {
            message.error("Utilisateur non authentifié.");
            return reject(new Error("Token manquant"));
          }

          axios
            .delete(`http://localhost:5000/pfa/${record._id}`, {
              headers: {
                Authorization: `Bearer ${token}`, // Inclure le token ici
              },
            })
            .then(({ data }) => {
              message.success("Sujet supprimé avec succès");
              setDataPfas((prevData) =>
                prevData.filter((item) => item._id !== record._id)
              );
              resolve(data);
            })
            .catch((err) => {
              message.error("Erreur lors de la suppression du sujet");
              reject(err);
            });
        });
      },
    });
  };

  const handleNavigateMySoutenance = () => {
    navigate("/home/listeSoutenancesPfa");
  };

  const columns = [
    { title: "Code PFA", dataIndex: "code_pfa", key: "code" },
    { title: "Titre du sujet", dataIndex: "titreSujet", key: "titreSujet" },
    {
      title: "Technologies",
      dataIndex: "technologies",
      key: "technologies",
      render: (technologies) => (
        <span>
          {technologies ? technologies.join(", ") : "Aucune technologie"}
        </span>
      ),
    },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Binome",
      dataIndex: "estBinome",
      key: "estBinome",
      render: (binome) => (binome ? "Oui" : "Non"),
    },
  ];

  if (user.role === "admin" || user.role === "etudiant") {
    columns.splice(5, 0, {
      title: "Enseignant",
      dataIndex: "enseignant",
      key: "enseignant",
      render: (enseignant) => `${enseignant.nom} ${enseignant.prenom}`,
    });
  }

  if (user.role === "enseignant" || user.role === "etudiant") {
    columns.splice(7, 0, {
      title: "État Affectation",
      dataIndex: "etatAffectation",
      key: "etatAffectation",
      render: (etat) => (
        <Tag
          color={
            etat === "affected" || etat === "published" || etat === "masked"
              ? "green"
              : "red"
          }
        >
          {etat === "affected" || etat === "published" || etat === "masked"
            ? "Affecté"
            : "Non affecté"}
        </Tag>
      ),
    });
  }

  if (user.role === "admin") {
    columns.splice(5, 0, {
      title: "Etat Depot",
      dataIndex: "etatDepot",
      key: "etatDepot",
      render: (text, record) => <EtatDepotDropdown record={record} />,
    });
    columns.splice(6, 0, {
      title: "État Affectation",
      dataIndex: "etatAffectation",
      key: "etatAffectation",
      render: (etat) => (
        <Tag
          color={
            etat === "affected" || etat === "published" || etat === "masked"
              ? "green"
              : "red"
          }
        >
          {etat === "affected" || etat === "published" || etat === "masked"
            ? "Affecté"
            : "Non affecté"}
        </Tag>
      ),
    });
    columns.push({
      title: "Voir Choix",
      key: "voirChoix",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => handleShowModal(record)}>Voir Choix</a>
        </Space>
      ),
    });
    columns.push({
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => showSujetDetails(record)}>Consulter</a>
        </Space>
      ),
    });
  }
  if (user.role === "etudiant") {
    columns.splice(5, 0, {
      title: "Email Enseignant",
      dataIndex: "enseignant", // Remplacer "adresseEmail" par "enseignant"
      key: "adresseEmail",
      render: (enseignant) =>
        enseignant ? enseignant.adresseEmail : "Email non disponible",
    });
  }

  if (user.role === "enseignant") {
    columns.splice(5, 0, {
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
    });
    columns.splice(6, 0, {
      title: "État Dépôt",
      dataIndex: "etatDepot",
      key: "etatDepot",
      render: (etat) => (
        <Tag color={etat === "published" ? "green" : "default"}>
          {etat === "published" ? "Publié" : "Non publié"}
        </Tag>
      ),
    });

    columns.push({
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => showSujetDetails(record)}>Consulter</a>
          <a onClick={() => onUpdatePfa(record)}>Modifier le sujet</a>
          <a onClick={() => onDeleteSujet(record)}>Supprimer le sujet</a>
        </Space>
      ),
    });
  }
  const [showMyChoicesModal, setShowMyChoicesModal] = useState(false);
  return (
    <div>
      <Navbar />
      <SidebarLayout collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="table-container">
        <div className="table-header">
          <h3>Liste des sujets PFA</h3>
          {user.role === "admin" && (
            <>
              <ButtonModel
                text="Publier les sujets"
                onClick={showModal}
                icon={<EyeOutlined />}
              />
              <ButtonModel
                text="Masquer les sujets"
                onClick={maskedfas}
                icon={<EyeInvisibleOutlined />}
              />
              <ButtonModel
                text="Envoyer la liste actuelle"
                onClick={sendPfas}
                icon={<MailFilled />}
              />
              <ButtonModel
                text="Consulter la liste d'affectation"
                onClick={handleNavigate}
                icon={<EyeOutlined />}
              />
            </>
          )}
          {user.role === "enseignant" && (
            <>
              <ButtonModel
                text="Ajouter un sujet PFA"
                onClick={showModal}
                icon={<PlusOutlined />}
              />
              <ButtonModel
                text="Consulter la liste des soutenances"
                onClick={handleNavigateSoutenance}
                icon={<EyeOutlined />}
              />
            </>
          )}
          {user.role === "etudiant" &&
            (user.niveau === 2 ? (
              user.pfa ? (
                <>
                  <ButtonModel
                    text="Consulter la date de soutenance"
                    onClick={handleNavigateMySoutenance}
                    icon={<EyeOutlined />}
                  />
                  <Alert
                    message="Vous avez été affecté à un sujet"
                    description="Vous pouvez consulter les détails de votre affectation."
                    type="info"
                    showIcon
                  />
                </>
              ) : (
                <>
                  <ButtonModel
                    text={
                      sortByTeacher
                        ? "Désactiver le tri par enseignant"
                        : "Trier par enseignant"
                    }
                    onClick={() => setSortByTeacher(!sortByTeacher)}
                    icon={<DownOutlined />}
                  />
                  <Select
                    placeholder="Sélectionner une technologie"
                    style={{ width: 200 }}
                    onChange={handleTechnologyFilter}
                    value={selectedTechnology}
                    className="custom-select"
                  >
                    <Select.Option value="">
                      Toutes les technologies
                    </Select.Option>
                    {technologiesList.map((tech, index) => (
                      <Select.Option key={index} value={tech}>
                        {tech}
                      </Select.Option>
                    ))}
                  </Select>

                  <ButtonModel
                    text="Choisir les sujets Pfas"
                    onClick={showModal}
                    icon={<PlusOutlined />}
                  />
                  <ButtonModel
                    text="Consulter mes choix"
                    icon={<EyeOutlined />}
                    onClick={() => setShowMyChoicesModal(true)}
                  />
                </>
              )
            ) : (
              <Alert
                message="Accès refusé"
                description="Vous n'êtes pas autorisé à choisir un sujet PFA. Seuls les étudiants en 2ème année sont concernés."
                type="warning"
                showIcon
              />
            ))}
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
      {user.role === "admin" && (
        <AddPeriod
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          title="Ajouter une période de choix PFA"
          source="choixpfa"
          refreshData={refreshData}
        />
      )}
      {user.role === "enseignant" && (
        <AddPfa
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          title="Ajouter un sujet PFA"
          refreshMyData={refreshMyData}
        />
      )}
      {user.role === "etudiant" && isModalOpen && (
        <PfaSelectionForm
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          title="Sélectionner 3 sujets PFA"
        />
      )}

      {/* Modale de consultation du sujet */}
      <Modal
        title="Détails du sujet"
        visible={!!selectedSujet}
        onCancel={closeSujetDetails}
        footer={null}
        className="sujet-modal"
      >
        {selectedSujet && (
          <div>
            <p>
              <strong>Code:</strong> {selectedSujet.code_pfa}
            </p>
            <p>
              <strong>Titre:</strong> {selectedSujet.titreSujet}
            </p>
            <p>
              <strong>Technologies:</strong> {selectedSujet.technologies}
            </p>
            <p>
              <strong>Description:</strong> {selectedSujet.description}
            </p>
            <p>
              <strong>Binome:</strong> {selectedSujet.binome ? "Oui" : "Non"}
            </p>
            <p>
              <strong>Etat Affectation:</strong> {selectedSujet.etatAffectation}
            </p>
            <p>
              <strong>Etudiants :</strong>{" "}
              {selectedSujet.etudiants.map((etudiant, index) => (
                <span key={etudiant._id}>
                  {etudiant.nom} {etudiant.prenom}
                  {index !== selectedSujet.etudiants.length - 1 && ", "}
                </span>
              ))}
            </p>

            <p>
              <strong>Etat Dépôt:</strong> {selectedSujet.etatDepot}
            </p>
          </div>
        )}
      </Modal>
      {/* Modal "Mettre à jour une période" */}
      {isUpdateModalOpen && (
        <UpdatePfa
          isUpdateModalOpen={isUpdateModalOpen}
          setIsModalOpen={setIsUpdateModalOpen}
          title={"Mettre à jour un sujet pfa"}
          formData={formData}
          setFormData={setFormData}
          refreshMyData={refreshMyData}
          dataPfas={dataPfas}
          selectedPfaId={selectedPfaId} // <<< Important !
        />
      )}
      {selectedRecord && (
        <ChoicesModal
          record={selectedRecord}
          visible={modalVisible}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default ListePfa;
