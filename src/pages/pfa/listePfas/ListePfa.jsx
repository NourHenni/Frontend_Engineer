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
import { Space, Dropdown, Menu, Modal, message, Select, Spin } from "antd";
import "./ListePfa.css";
import AddPeriod from "../addPeriod/AddPeriod";
import AddPfa from "../addPFA/AddPfa";
import ChoicePfa from "../choicePFA/ChoicePfa";
import PfaSelectionForm from "../choicePFA/ChoicePfa";
import { UserContext } from "../../../App";
import {
  fetchPfas,
  maqsuedPfas,
  sendEmail,
} from "../../../services/pfaServices";
import axios from "axios";

function ListePfa() {
  const user = useContext(UserContext);
  const [dataPfas, setDataPfas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSujet, setSelectedSujet] = useState(null);
  const [limit, setLimit] = useState(4); // 👈 4 éléments par page
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadPfas = async () => {
      try {
        const result = await fetchPfas();
        setDataPfas(result); // Mettre à jour l'état avec les données récupérées
        console.log("data", result);
        setLoading(false);
      } catch (e) {
        setLoading(false);
      }
    };

    loadPfas();
  }, []);

  const refreshData = async () => {
    const data = await fetchPfas();
    setDataPfas(data); // Mettre à jour l'état avec les données récupérées
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
      console.log("responseMessage", responseMessage); // Pour vérifier ce que contient la réponse

      message.success(responseMessage); // Afficher le message de succès

      const updatedPfas = await fetchPfas(); // Mettre à jour avec les nouvelles données
      setDataPfas(updatedPfas);
      setLoading(false);
    } catch (error) {
      const errorMessage = error.message || "Une erreur est survenue"; // Utilisez `error.message` pour un message d'erreur personnalisé
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
      title: "Voulez-vous supprimer ce sujet?",
      icon: <ExclamationCircleFilled />,
      cancelText: "Annuler",
      okText: "Oui",
      onOk: () => {
        // return new Promise((resolve, reject) => {
        //   axios
        //     .delete(`/sujet/delete/${record.key}`)
        //     .then(({ data }) => {
        //       message.success("Sujet supprimé avec succès");
        //       setData((prevData) =>
        //         prevData.filter((item) => item.key !== record.key)
        //       );
        //       resolve(data);
        //     })
        //     .catch((err) => reject(err));
        // });
      },
    });
  };

  const columns = [
    { title: "Code PFA", dataIndex: "code_pfa", key: "code" },
    { title: "Titre du sujet", dataIndex: "titreSujet", key: "titre" },
    { title: "Technologies", dataIndex: "technologies", key: "technologies" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Binome",
      dataIndex: "estBinome",
      key: "binome",
      render: (binome) => (binome ? "Oui" : "Non"),
    },
    {
      title: "Etat Affectation",
      dataIndex: "etatAffectation",
      key: "etatAffect",
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
          <a>Modifier le sujet</a>
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
          {user.role === "etudiant" && (
            <>
              <Select
                placeholder="Filtrer par enseignant"
                allowClear={true}
                bordered={false}
                // options={listSpecialities}
                className="filter-select"
                //defaultValue={filterSepciality}
                //onChange={(val) => setFilterSepciality(val)}
              />
              <ButtonModel
                text="Choisir les sujets Pfas "
                onClick={showModal}
                icon={<PlusOutlined />}
              />
            </>
          )}
        </div>

        <TableData
          columns={columns}
          data={paginatedData}
          loading={loading}
          pagination={pagination}
          onPaginationChange={handlePaginationChange} // Passer la fonction pour gérer la pagination
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
        />
      )}
      {user.role === "etudiant" && (
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
    </div>
  );
}

export default ListePfa;
