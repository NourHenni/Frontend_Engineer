import React, { useState } from "react";
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
} from "@ant-design/icons";
import { Space, Dropdown, Menu, Modal, message, Select } from "antd";
import "./ListePfa.css";
import AddPeriod from "../addPeriod/AddPeriod";
import AddPfa from "../addPFA/AddPfa";
import ChoicePfa from "../choicePFA/ChoicePfa";
import PfaSelectionForm from "../choicePFA/ChoicePfa";

function ListePfa({ role }) {
  const [data, setData] = useState([
    {
      key: "1",
      code: "PFA001",
      titre: "Système de gestion de stock",
      technologies: "React, Node.js, MongoDB",
      description:
        "Développement d'un système de gestion de stock pour une entreprise.",
      binome: true,
      etatAffect: "Affecté",
      etudiant: "John Doe, Jane Smith",
      enseignant: "Prof. Martin",
      etatDepot: "Validé",
    },
    {
      key: "2",
      code: "PFA002",
      titre: "Application de réservation de billets",
      technologies: "Java, Spring Boot, MySQL",
      description:
        "Création d'une application pour la réservation de billets de concert.",
      binome: false,
      etatAffect: "Non affecté",
      etudiant: "Alice Bob",
      enseignant: "Prof. Davis",
      etatDepot: "En attente",
    },
    {
      key: "3",
      code: "PFA003",
      titre: "Plateforme e-commerce",
      technologies: "Angular, Firebase, Express",
      description:
        "Développement d'une plateforme e-commerce pour la vente de produits en ligne.",
      binome: true,
      etatAffect: "Affecté",
      etudiant: "Tom Hanks, Emma Watson",
      enseignant: "Prof. Claire",
      etatDepot: "Validé",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSujet, setSelectedSujet] = useState(null);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const EtatDepotDropdown = ({ record }) => {
    if (role !== "admin") return record.etatDepot;
    const menu = (
      <Menu>
        <Menu.Item key="1">Rejeté</Menu.Item>
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
    { title: "Code PFA", dataIndex: "code", key: "code" },
    { title: "Titre du sujet", dataIndex: "titre", key: "titre" },
    { title: "Technologies", dataIndex: "technologies", key: "technologies" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Binome",
      dataIndex: "binome",
      key: "binome",
      render: (binome) => (binome ? "Oui" : "Non"),
    },
    { title: "Etat Affectation", dataIndex: "etatAffect", key: "etatAffect" },
  ];

  if (role === "admin" || role === "etudiant") {
    columns.splice(5, 0, {
      title: "Enseignant",
      dataIndex: "enseignant",
      key: "enseignant",
    });
  }

  if (role === "admin") {
    columns.splice(5, 0, {
      title: "Etudiants",
      dataIndex: "etudiant",
      key: "etudiant",
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
          <a>Modifier la période</a>
        </Space>
      ),
    });
  }

  if (role === "enseignant") {
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
          {role === "admin" && (
            <>
              <ButtonModel
                text="Publier les sujets"
                onClick={showModal}
                icon={<EyeOutlined />}
              />
              <ButtonModel
                text="Envoyer la liste actuelle"
                icon={<MailFilled />}
              />
            </>
          )}
          {role === "enseignant" && (
            <ButtonModel
              text="Ajouter un sujet PFA"
              onClick={showModal}
              icon={<PlusOutlined />}
            />
          )}
          {role === "etudiant" && (
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
        <TableData columns={columns} data={data} />
      </div>
      {role === "admin" && (
        <AddPeriod
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          title="Ajouter une période de choix PFA"
        />
      )}
      {role === "enseignant" && (
        <AddPfa
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          title="Ajouter un sujet PFA"
        />
      )}
      {role === "etudiant" && (
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
              <strong>Code:</strong> {selectedSujet.code}
            </p>
            <p>
              <strong>Titre:</strong> {selectedSujet.titre}
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
              <strong>Etat Affectation:</strong> {selectedSujet.etatAffect}
            </p>
            <p>
              <strong>Etudiants:</strong> {selectedSujet.etudiant}
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
