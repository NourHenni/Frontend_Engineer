import React, { useContext, useEffect, useState } from "react";
import ButtonModel from "../../../components/button/Button";
import Navbar from "../../../components/navbar/Navbar";
import SidebarLayout from "../../../components/sidebar/Sidebar";
import TableData from "../../../components/table/TableData";
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
} from "antd";
import "./ListePfa.css";
import AddPeriod from "../addPeriod/AddPeriod";
import AddPfa from "../addPFA/AddPfa";
import ChoicePfa from "../choicePFA/ChoicePfa";
import PfaSelectionForm from "../choicePFA/ChoicePfa";
import { UserContext } from "../../../App";
import {
  fetchMyPfas,
  fetchPfas,
  fetchPublishedPfas,
  maqsuedPfas,
  sendEmail,
} from "../../../services/pfaServices";
import axios from "axios";
import UpdatePfa from "../updatePfa/UpdatePfa";
import ChoicesModal from "../choicesModel/ChoiceModel";
import ChoiceStudents from "../choices/ChoicesStudent";

function ListePfa() {
  const user = useContext(UserContext);
  const [dataPfas, setDataPfas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedSujet, setSelectedSujet] = useState(null);
  const [limit, setLimit] = useState(4); // 👈 4 éléments par page
  const [currentPage, setCurrentPage] = useState(1);
  const [isModifying, setIsModifying] = useState(false);
  const [isConsulting, setIsConsulting] = useState(false);
  const [infoPeriod, setInfoPeriod] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sortByTeacher, setSortByTeacher] = useState(false);
  const [selectedTechnology, setSelectedTechnology] = useState(""); // Nouveau état pour la technologie sélectionnée
  const [technologiesList, setTechnologiesList] = useState([]);
  const [hasPublishedPfas, setHasPublishedPfas] = useState(false);

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
    etudiant: fetchPublishedPfas,
  };

  // Fonction pour charger les données
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const fetcher = roleToFetcher[user.role];
        if (fetcher) {
          const result = await fetcher();
          setDataPfas(result);

          // Extraire les technologies disponibles à partir des données
          const technologies = [
            ...new Set(result.flatMap((pfa) => pfa.technologies)),
          ];
          setTechnologiesList(technologies);
          console.log("technologies", technologies);
        }
      } catch (e) {
        console.error("Erreur de chargement :", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user.role]); // Dépend du rôle, donc tu peux l'ajouter dans le tableau de dépendances

  const refreshData = async () => {
    const data = await fetchPfas();
    setDataPfas(data); // Mettre à jour l'état avec les données récupérées
  };
  const showModalChoice = () => {
    setIsModalVisible(true);
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

  // Fonction pour gérer la pagination
  const handlePaginationChangee = (page, pageSize) => {
    // Mettre à jour la page courante et la taille de la page (implémenter votre logique de pagination)
  };

  // Fonction pour fermer le modal
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const refreshMyData = async () => {
    const data = await fetchMyPfas();
    setDataPfas(data); // Mettre à jour l'état avec les données récupérées
  };

  const handleShowModal = (record) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedRecord(null);
  };

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

  const onUpdatePfa = (info) => {
    setIsUpdateModalOpen(true);
    setIsConsulting(false);
    setIsModifying(true);
    setInfoPeriod(info);

    // Chercher le sujet  à modifier dans la liste des périodes
    const pfasdata = dataPfas.find((pfa) => pfa.id === info.id);
    console.log("pfasdata", pfasdata);
    if (pfasdata) {
      // Pré-remplir les champs du formulaire de mise à jour
      setFormData({
        titreSujet: pfasdata.titreSujet || "",
        description: pfasdata.description || "",
        technologies: pfasdata.technologies || [],
        estBinome: pfasdata.estBinome || "oui",
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

  const maskedfas = async () => {
    try {
      const responseMessage = await maqsuedPfas();

      if (responseMessage) {
        //  message.success(responseMessage);
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
    {
      title: "Etat Affectation",
      dataIndex: "etatAffectation",
      key: "etatAffectation",
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

  if (user.role === "admin") {
    columns.splice(6, 0, {
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
      title: "Etat Depot",
      dataIndex: "etatDepot",
      key: "etatDepot",
      render: (text, record) => <EtatDepotDropdown record={record} />,
    });
    // Ajout d'une action pour ouvrir une nouvelle table avec les choix
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

  if (user.role === "enseignant") {
    columns.splice(5, 0, {
      title: "Etudiants",
      dataIndex: "etudiant",
      key: "etudiant",
    });
    columns.splice(6, 0, {
      title: "Etat Depot",
      dataIndex: "etatDepot",
      key: "etatDepot",
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

  return (
    <div>
      <Navbar />
      <SidebarLayout />
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
            </>
          )}
          {user.role === "enseignant" && (
            <ButtonModel
              text="Ajouter un sujet PFA"
              onClick={showModal}
              icon={<PlusOutlined />}
            />
          )}
          {user.role === "etudiant" &&
            (user.niveau === 2 ? (
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
                  text="Consulter mes choix "
                  onClick={showModalChoice}
                  icon={<EyeOutlined />}
                />
              </>
            ) : (
              <Alert
                message="Accès refusé"
                description="Vous n'êtes pas autorisé à choisir un sujet PFA. Seuls les étudiants en 2ème année sont concernés."
                type="warning"
                showIcon
              />
            ))}
        </div>

        <TableData
          columns={columns}
          data={paginatedData}
          loading={loading}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}

          // Passer la fonction pour gérer la pagination
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
      {user.role === "etudiant" && (
        <PfaSelectionForm
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          title="Sélectionner 3 sujets PFA"
        />
      )}
      {user.role === "etudiant" && (
        <ChoiceStudents
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          title="Mes choix "
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
          formData={formData} // Passer formData au modal
          setFormData={setFormData} // Passer la fonction setFormData au modal
          refreshMyData={refreshMyData}
          dataPfas={dataPfas}
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
