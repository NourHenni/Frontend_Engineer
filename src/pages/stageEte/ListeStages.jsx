import React, { useEffect, useState } from "react";
import { Table, Select, Tag, message, Spin } from "antd";
import { getInternshipsByType } from "../../services/stageServices";

const { Option } = Select;

function ListeStages() {
  const [niveau, setNiveau] = useState("premiereannee");
  const [loading, setLoading] = useState(false);
  const [stages, setStages] = useState([]);

  useEffect(() => {
    fetchStages(niveau);
  }, [niveau]);

  const fetchStages = async (selectedType) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await getInternshipsByType(selectedType, token);
      setStages(response.data);
    } catch (err) {
      message.error(err.message || "Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Étudiant",
      dataIndex: "etudiant",
      key: "etudiant",
      render: (etudiant) => (
        <>
          <div>{etudiant.nom} {etudiant.prenom}</div>
          <div style={{ color: "#888" }}>{etudiant.email}</div>
        </>
      ),
    },
    {
      title: "Titre du Sujet",
      dataIndex: ["stage", "titreSujet"],
      key: "titreSujet",
    },
    {
      title: "Entreprise",
      dataIndex: ["stage", "nomEntreprise"],
      key: "nomEntreprise",
    },
    {
      title: "Période",
      key: "periode",
      render: (_, record) => {
        const { dateDebut, dateFin } = record.stage;
        return `${new Date(dateDebut).toLocaleDateString()} - ${new Date(dateFin).toLocaleDateString()}`;
      },
    },
    {
      title: "Statut Dépôt",
      dataIndex: ["stage", "statutDepot"],
      key: "statutDepot",
      render: (statut) => (
        <Tag color={statut === "validé" ? "green" : statut === "refusé" ? "red" : "orange"}>
          {statut?.toUpperCase() || "En attente"}
        </Tag>
      ),
    },
    {
      title: "Enseignant",
      dataIndex: "enseignant",
      key: "enseignant",
      render: (enseignant) =>
        enseignant ? (
          <>
            <div>{enseignant.nom} {enseignant.prenom}</div>
            <div style={{ color: "#888" }}>{enseignant.email}</div>
          </>
        ) : (
          <Tag color="default">Non Affecté</Tag>
        ),
    },
    {
      title: "Documents",
      dataIndex: ["stage", "fichiers"],
      key: "documents",
      render: (fichiers) => (
        <div>
          {Object.entries(fichiers).map(([nom, lien]) => (
            <div key={nom}>
              <a href={lien} target="_blank" rel="noopener noreferrer">
                📄 {nom}
              </a>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <h2>Liste des Stages par Niveau</h2>
      <Select value={niveau} onChange={setNiveau} style={{ width: 220, marginBottom: 20 }}>
        <Option value="premiereannee">Première Année</Option>
        <Option value="deuxiemeannee">Deuxième Année</Option>
      </Select>

      {loading ? (
        <div style={{ textAlign: "center", marginTop: 50 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={stages}
          rowKey={(record) => record.etudiant.email + record.stage.titreSujet}
          bordered
          pagination={{ pageSize: 6 }}
        />
      )}
    </div>
  );
}

export default ListeStages;
