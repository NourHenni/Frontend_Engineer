import React, { useEffect, useState } from "react";
import {
  Table,
  Select,
  Tag,
  message,
  Spin,
  Button,
  Modal,
  Checkbox,
  Card,
  Typography
} from "antd";
import {
  getInternshipsByType,
  assignTeachersToStages,
  getEnseignants,
} from "../../services/stageServices";

const { Option } = Select;
const { Title } = Typography;

function ListeStages() {
  const [niveau, setNiveau] = useState("premiereannee");
  const [loading, setLoading] = useState(false);
  const [stages, setStages] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [teacherList, setTeacherList] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);

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

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await getEnseignants(token);
      setTeacherList(response.data.teachers || []);
    } catch (error) {
      message.error("Erreur lors du chargement des enseignants.");
    }
  };

  const handleAffectation = async () => {
    if (selectedTeachers.length === 0) {
      return message.warning("Veuillez sélectionner au moins un enseignant.");
    }

    try {
      const token = localStorage.getItem("token");
      await assignTeachersToStages(niveau, selectedTeachers, token);
      message.success("Affectation réussie !");
      setIsModalVisible(false);
      setSelectedTeachers([]);
      fetchStages(niveau);
    } catch (err) {
      message.error("Erreur lors de l'affectation.");
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
          {Object.entries(fichiers || {}).map(([nom, lien]) => (
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
      <Title level={2}>Gestion des stages d'été</Title>
      <Title level={4}>Liste des Stages par Niveau</Title>

      <div style={{ marginBottom: 20 }}>
        <Select 
          value={niveau} 
          onChange={setNiveau} 
          style={{ width: 220 }}
        >
          <Option value="premiereannee">Première Année</Option>
          <Option value="deuxiemeannee">Deuxième Année</Option>
        </Select>

        <Button
          type="primary"
          onClick={() => {
            setIsModalVisible(true);
            fetchTeachers();
          }}
          style={{ marginLeft: 16 }}
        >
          Affecter Enseignant
        </Button>
      </div>

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

      <Modal
        title={
          <div>
            <Title level={4}>Affectation automatique des stages aux enseignants</Title>
            <div>Niveau de stage: {niveau === 'premiereannee' ? 'Première Année' : 'Deuxième Année'}</div>
          </div>
        }
        open={isModalVisible}
        onOk={handleAffectation}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedTeachers([]);
        }}
        okText="Valider l'affectation"
        cancelText="Annuler"
        width={600}
      >
        <Card bordered={false}>
          <div style={{ marginBottom: 16 }}>
            <strong>Enseignants disponibles ({teacherList.length})</strong>
          </div>
          
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            <Checkbox.Group
              style={{ width: '100%' }}
              value={selectedTeachers}
              onChange={setSelectedTeachers}
            >
              {teacherList.map((teacher) => (
                <div key={teacher._id} style={{ marginBottom: 8 }}>
                  <Checkbox value={teacher._id}>
                    {teacher.nom} {teacher.prenom}
                  </Checkbox>
                </div>
              ))}
            </Checkbox.Group>
          </div>
        </Card>
      </Modal>
    </div>
  );
}

export default ListeStages;