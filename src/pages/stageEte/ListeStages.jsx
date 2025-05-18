import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
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
  Typography,
  Divider,
  Space,
  Input,
  Tooltip,
  Popconfirm
} from "antd";
import {
  getInternshipsByType,
  assignTeachersToStages,
  getEnseignants,
} from "../../services/stageServices";
import {
  SearchOutlined,
  UserOutlined,
  MailOutlined,
  FileOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SendOutlined,
  EditOutlined,
  TeamOutlined
} from "@ant-design/icons";
import "./ListeStages.css"; // Fichier CSS pour les styles personnalisés

const { Option } = Select;
const { Title, Text } = Typography;

// Couleurs personnalisées
const colors = {
  primary: "#1890ff",
  secondary: "#52c41a",
  danger: "#f5222d",
  background: "#f8f9fa",
  card: "#ffffff",
  text: "#343a40",
  border: "#e9ecef"
};

function ListeStages() {
  const [niveau, setNiveau] = useState("premiereannee");
  const [loading, setLoading] = useState(false);
  const [stages, setStages] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [teacherList, setTeacherList] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [etatPublication, setEtatPublication] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  useEffect(() => {
    fetchStages(niveau);
  }, [niveau]);

  const fetchStages = async (selectedType) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await getInternshipsByType(selectedType, token);
      const stagesAvecPublication = response.data.map((stage) => ({
        ...stage,
        publie: stage.publie ?? true,
      }));
      setStages(stagesAvecPublication);
    } catch (err) {
      message.error(err.message || "Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  };

  const getTeachers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await getEnseignants(token);
      setTeacherList(response.data.model || []);
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

  const sendPlanningEmail = async (niveau) => {
    if (!niveau) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const planningLink = `${window.location.origin}/planning-stages/${niveau}`;

      const response = await axios.post(
        `http://localhost:5000/internship/${niveau}/planning/send`,
        { link: planningLink },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        message.success({
          content: "🎉 Planning envoyé avec succès aux étudiants et enseignants.",
          duration: 4,
        });
      } else {
        message.error(response.data.message || "Une erreur s'est produite.");
      }
    } catch (error) {
      console.error("Erreur axios :", error);
      message.error("Échec de l'envoi. Vérifiez votre connexion ou le serveur.");
    } finally {
      setLoading(false);
    }
  };

  const changerEtatPublication = (etat) => {
    const nouveauxStages = stages.map((stage) => ({
      ...stage,
      publie: etat,
    }));
    setStages(nouveauxStages);
    setEtatPublication(etat);
    message.success(etat ? "Tous les stages sont maintenant publiés" : "Tous les stages sont maintenant masqués");
  };

  const filteredTeachers = teacherList.filter((teacher) =>
    `${teacher.nom} ${teacher.prenom}`.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Étudiant",
      dataIndex: "etudiant",
      key: "etudiant",
      render: (etudiant) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: colors.text }}>
            <UserOutlined /> {etudiant.nom} {etudiant.prenom}
          </Text>
          <Text type="secondary">
            <MailOutlined /> {etudiant.email}
          </Text>
        </Space>
      ),
      width: 220,
      fixed: "left",
    },
    {
      title: "Titre du Sujet",
      dataIndex: ["stage", "titreSujet"],
      key: "titreSujet",
      ellipsis: true,
      render: (text) => <Text style={{ color: colors.text }}>{text}</Text>,
    },
    {
      title: "Période",
      key: "periode",
      render: (_, record) => {
        const { dateDebut, dateFin } = record.stage;
        return (
          <Text style={{ color: colors.text }}>
            {new Date(dateDebut).toLocaleDateString()} - {new Date(dateFin).toLocaleDateString()}
          </Text>
        );
      },
      width: 180,
    },
    {
      title: "Statut Dépôt",
      dataIndex: ["stage", "statutDepot"],
      key: "statutDepot",
      render: (statut) => (
        <Tag
          color={
            statut === "Depose" ? colors.secondary : 
            statut === "Depose avec retard" ? colors.danger : "orange"
          }
          style={{ fontWeight: 500, borderRadius: 4 }}
        >
          {statut?.toUpperCase() || "EN ATTENTE"}
        </Tag>
      ),
      align: "center",
      width: 120,
    },
    {
      title: "Statut Sujet",
      dataIndex: ["stage", "statutSujet"],
      key: "statutSujet",
      render: (statut) => (
        <Tag
          color={
            statut === "Valide" ? colors.secondary : 
            statut === "Non valide" ? colors.danger : "orange"
          }
          style={{ fontWeight: 500, borderRadius: 4 }}
        >
          {statut?.toUpperCase() || "EN ATTENTE"}
        </Tag>
      ),
      align: "center",
      width: 120,
    },
    {
      title: "Enseignant",
      dataIndex: "enseignant",
      key: "enseignant",
      render: (enseignant) =>
        enseignant ? (
          <Space direction="vertical" size={0}>
            <Text strong style={{ color: colors.text }}>
              <UserOutlined /> {enseignant.nom} {enseignant.prenom}
            </Text>
            <Text type="secondary">
              <MailOutlined /> {enseignant.email}
            </Text>
          </Space>
        ) : (
          <Tag icon={<UserOutlined />} color="default" style={{ borderRadius: 4 }}>
            NON AFFECTÉ
          </Tag>
        ),
      width: 220,
    },
    {
      title: "Publication",
      dataIndex: "publie",
      key: "publie",
      render: (publie) => (
        <Tag 
          color={publie ? colors.secondary : colors.danger} 
          icon={publie ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          style={{ borderRadius: 4 }}
        >
          {publie ? "PUBLIÉ" : "MASQUÉ"}
        </Tag>
      ),
      align: "center",
      width: 120,
    },
    {
      title: "Documents",
      dataIndex: ["stage", "fichiers"],
      key: "documents",
      render: (fichiers) => (
        <Space direction="vertical" size={4}>
          {Object.entries(fichiers || {}).map(([nom, lien]) => (
           <a
           key={nom}
           href={lien}
           download
           style={{ color: colors.primary, display: 'inline-flex', alignItems: 'center', gap: 4 }}
         >
           <FileOutlined />
           {nom}
         </a>
         
          ))}
        </Space>
      ),
      width: 150,
    },
  ];

  return (
    <div style={{ 
      padding: 24, 
      backgroundColor: colors.background,
      minHeight: "100vh"
    }}>
      <div style={{ 
        maxWidth: 1400, 
        margin: "0 auto"
      }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Title level={3} style={{ 
            marginBottom: 0,
            color: colors.text,
            fontWeight: 600
          }}>
            Gestion des stages d'été
          </Title>
          
          <Card 
            bordered={false} 
            style={{ 
              boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
              borderRadius: 8,
              backgroundColor: colors.card
            }}
            bodyStyle={{ padding: 16 }}
          >
            <Space size="middle" align="center" wrap>
              <Space>
                <Text strong style={{ color: colors.text }}>Niveau :</Text>
                <Select 
                  value={niveau} 
                  onChange={setNiveau}
                  style={{ width: 180 }}
                  size="middle"
                  className="custom-select"
                >
                  <Option value="premiereannee">Première Année</Option>
                  <Option value="deuxiemeannee">Deuxième Année</Option>
                </Select>
              </Space>
              
              <Tooltip title="Affecter des enseignants aux stages">
                <Button
                  type="primary"
                  icon={<TeamOutlined />}
                  onClick={() => {
                    setIsModalVisible(true);
                    getTeachers();
                  }}
                  className="custom-button"
                >
                  Affecter enseignants
                </Button>
              </Tooltip>

              <Tooltip title="Modifier les affectations existantes">
                <Button
                  type="default"
                  icon={<EditOutlined />}
                  onClick={() => setIsEditModalVisible(true)}
                  className="custom-button"
                >
                  Modifier affectation
                </Button>
              </Tooltip>
    
              <Tooltip title="Envoyer le planning par email">
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={() => sendPlanningEmail(niveau)}
                  loading={loading}
                  className="custom-button"
                >
                  Envoyer planning
                </Button>
              </Tooltip>
    
              <Space>
                <Tooltip title="Publier tous les stages">
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => changerEtatPublication(true)}
                    className="custom-button"
                  >
                    Publier
                  </Button>
                </Tooltip>
                <Tooltip title="Masquer tous les stages">
                  <Button
                    danger
                    icon={<EyeInvisibleOutlined />}
                    onClick={() => changerEtatPublication(false)}
                    className="custom-button"
                  >
                    Masquer
                  </Button>
                </Tooltip>
              </Space>
            </Space>
          </Card>
    
          <Card 
            bordered={false} 
            style={{ 
              boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
              borderRadius: 8,
              backgroundColor: colors.card
            }}
            bodyStyle={{ padding: 0 }}
          >
            {loading ? (
              <div style={{ 
                textAlign: 'center', 
                padding: 40,
                minHeight: 300,
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}>
                <Spin size="large" />
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={stages}
                rowKey={(record) => record.etudiant.email + record.stage.titreSujet}
                pagination={{ 
                  pageSize: 8, 
                  showSizeChanger: false,
                  position: ['bottomCenter'],
                  showTotal: (total) => `${total} stages au total`,
                  className: "custom-pagination"
                }}
                scroll={{ x: 'max-content' }}
                size="middle"
                className="custom-table"
                locale={{
                  emptyText: (
                    <div style={{ 
                      padding: 40,
                      color: colors.text
                    }}>
                      Aucun stage trouvé pour ce niveau
                    </div>
                  )
                }}
              />
            )}
          </Card>
        </Space>
    
        {/* Modal d'affectation des enseignants */}
        <Modal
          title={
            <Space direction="vertical" size={0}>
              <Title level={4} style={{ marginBottom: 0, color: colors.text }}>
                Affectation des enseignants
              </Title>
              <Text type="secondary">
                Niveau: {niveau === 'premiereannee' ? 'Première Année' : 'Deuxième Année'}
              </Text>
            </Space>
          }
          visible={isModalVisible}
          onOk={handleAffectation}
          onCancel={() => {
            setIsModalVisible(false);
            setSelectedTeachers([]);
            setSearchText("");
          }}
          okText="Affecter"
          cancelText="Annuler"
          okButtonProps={{ className: "custom-button" }}
          cancelButtonProps={{ className: "custom-button" }}
          width={600}
          bodyStyle={{ padding: "16px 24px" }}
          className="custom-modal"
        >
          <Input
            placeholder="Rechercher un enseignant..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ marginBottom: 16 }}
            className="custom-input"
          />
    
          <div style={{ 
            maxHeight: 400, 
            overflowY: 'auto', 
            paddingRight: 8,
            borderTop: `1px solid ${colors.border}`,
            paddingTop: 16
          }}>
            <Checkbox.Group
              style={{ width: '100%' }}
              value={selectedTeachers}
              onChange={setSelectedTeachers}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher) => (
                    <Checkbox 
                      key={teacher._id} 
                      value={teacher._id}
                      className="custom-checkbox"
                    >
                      <Space direction="vertical" size={0}>
                        <Text strong style={{ color: colors.text }}>
                          {teacher.nom} {teacher.prenom}
                        </Text>
                        <Text type="secondary">{teacher.email}</Text>
                      </Space>
                    </Checkbox>
                  ))
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: 16,
                    color: colors.text
                  }}>
                    Aucun enseignant trouvé
                  </div>
                )}
              </Space>
            </Checkbox.Group>
          </div>
        </Modal>

        {/* Modal de modification d'affectation */}
        <Modal
          title={
            <Space direction="vertical" size={0}>
              <Title level={4} style={{ marginBottom: 0, color: colors.text }}>
                Modification des affectations
              </Title>
              <Text type="secondary">
                Niveau: {niveau === 'premiereannee' ? 'Première Année' : 'Deuxième Année'}
              </Text>
            </Space>
          }
          visible={isEditModalVisible}
          onOk={() => setIsEditModalVisible(false)}
          onCancel={() => setIsEditModalVisible(false)}
          okText="Enregistrer"
          cancelText="Annuler"
          okButtonProps={{ className: "custom-button" }}
          cancelButtonProps={{ className: "custom-button" }}
          width={800}
          bodyStyle={{ padding: "16px 24px" }}
          className="custom-modal"
        >
          <div style={{ color: colors.text }}>
            Fonctionnalité de modification des affectations à implémenter ici...
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default ListeStages;