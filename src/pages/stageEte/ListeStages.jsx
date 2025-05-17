 import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Table,
  Select,
  Tag,
  message,
  DatePicker,
  Spin,
  Button,
  Modal,
  Checkbox,
  Card,
  Typography,
  Space,
  Input,
  Tooltip,
  Empty,
  Radio,
  List,
} from "antd";
import {
  getInternshipsByTypeAndYear,
  assignTeachersToStages,
  getEnseignants,
  updateAssignedTeacher,
  togglePlanningVisibility,
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
  TeamOutlined,
  FileSearchOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import "./ListeStages.css";
import dayjs from "dayjs";

const { Option } = Select;
const { Title, Text } = Typography;

const colors = {
  primary: "#1890ff",
  secondary: "#52c41a",
  danger: "#f5222d",
  background: "#f8f9fa",
  card: "#ffffff",
  text: "#343a40",
  border: "#e9ecef",
};

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  card: {
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  },
  table: {
    borderRadius: 8,
    overflow: "hidden",
  },
  modal: {
    borderRadius: 12,
  },
  tag: {
    borderRadius: 4,
    fontWeight: 500,
  },
};

import PeriodManagement from "./PeriodManagement";

function ListeStages() {
  const [niveau, setNiveau] = useState("premiereannee");
  const [loading, setLoading] = useState(false);
  const [stages, setStages] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [teacherList, setTeacherList] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isPublished, setIsPublished] = useState(false);
 
  //const [anneeStage, setanneeStage] = useState("2024-2025");
  const [selectedStage, setSelectedStage] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [formData, setFormData] = useState({
    DateDebutDepot: "",
    DateFinDepot: "",
  });

  
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();
  const [anneeStage, setAnneeStage] = useState(dayjs().year().toString());

  const showPeriodModal = () => setModalVisible(true);
  const [sendingEmail, setSendingEmail] = useState(false);
const [publishing, setPublishing] = useState(false);


  // Un seul useEffect pour le chargement initial
  useEffect(() => {
    // Récupérer les préférences sauvegardées si elles existent
    const savedNiveau = localStorage.getItem('stageNiveau');
    const savedAnnee = localStorage.getItem('stageAnnee');
    
    if (savedNiveau) setNiveau(savedNiveau);
    if (savedAnnee) setAnneeStage(savedAnnee);
    
    // Charger les données
    fetchStages(savedNiveau || niveau, savedAnnee || dayjs().year().toString());
  }, []);

  // useEffect pour les changements de critères
  useEffect(() => {
    if (niveau && anneeStage) {
      // Sauvegarder les préférences
      localStorage.setItem('stageNiveau', niveau);
      localStorage.setItem('stageAnnee', anneeStage);
      
      // Charger les données
      fetchStages(niveau, anneeStage);
    }
  }, [niveau, anneeStage]);

  useEffect(() => {
    if (stages.length > 0) {
      const publishedStatus = stages.some((stage) => stage.publie);
      setIsPublished(publishedStatus);
    }
  }, [stages]);

 const fetchStages = async (selectedType, selectedYear) => {
    if (!selectedType || !selectedYear) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await getInternshipsByTypeAndYear(
        selectedType,
        selectedYear,
        token
      );
      
      const stagesData = response.data || [];
      const stagesAvecPublication = stagesData.map((stage) => ({
        ...stage,
        publie: stage.stage.publie,
      }));
      
      setStages(stagesAvecPublication);
      setIsPublished(stagesAvecPublication.some((stage) => stage.publie));
    } catch (err) {
      console.error("Erreur fetchStages:", err);
      message.error(err.message || "Erreur lors du chargement.");
      setStages([]);
      setIsPublished(false);
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
      fetchStages(niveau, anneeStage);
    } catch (err) {
      message.error("Erreur lors de l'affectation.");
    }
  };

  const handleUpdateAffectation = async () => {
    if (!selectedStage || !selectedTeacherId) {
      return message.warning("Veuillez sélectionner un stage et un enseignant.");
    }

    setEditLoading(true);
    try {
      const token = localStorage.getItem("token");
      await updateAssignedTeacher(
        niveau,
        selectedStage.stage._id,
        selectedTeacherId,
        token
      );
      message.success("Affectation mise à jour avec succès !");
      setIsEditModalVisible(false);
      fetchStages(niveau, anneeStage);
    } catch (err) {
      message.error(
        err.message || "Erreur lors de la mise à jour de l'affectation."
      );
    } finally {
      setEditLoading(false);
    }
  };

  const sendPlanningEmail = async () => {
    if (!niveau) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const planningLink = `${window.location.origin}/planning-stages/${niveau}`;
      const response = await axios.post(
        `http://localhost:5000/internship/${niveau}/planning/send`,
        { link: planningLink },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        message.success("🎉 Planning envoyé avec succès.");
      } else {
        message.error(response.data.message || "Une erreur s'est produite.");
      }
    } catch (error) {
      message.error("Échec de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  const togglePublicationStatus = async () => {
    try {
      setLoading(true);
      const newStatus = !isPublished;
      
      await togglePlanningVisibility(niveau, newStatus);
      
      setStages((prevStages) =>
        prevStages.map((stage) => ({
          ...stage,
          publie: newStatus,
        }))
      );
      
      setIsPublished(newStatus);
      message.success(`Planning ${newStatus ? "publié" : "masqué"} avec succès !`);
      
      await fetchStages(niveau, anneeStage);
    } catch (err) {
      message.error(
        err.response?.data?.message || "Erreur lors de la modification du statut"
      );
      await fetchStages(niveau, anneeStage);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teacherList.filter((teacher) =>
    `${teacher.nom} ${teacher.prenom}`
      .toLowerCase()
      .includes(searchText.toLowerCase())
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
      title: "Statut Dépôt",
      dataIndex: ["stage", "statutDepot"],
      key: "statutDepot",
      render: (statut) => (
        <Tag
          color={
            statut === "Depose"
              ? colors.secondary
              : statut === "Depose avec retard"
              ? colors.danger
              : "orange"
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
            statut === "Valide"
              ? colors.secondary
              : statut === "Non valide"
              ? colors.danger
              : "orange"
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
          <Tag
            icon={<UserOutlined />}
            color="default"
            style={{ borderRadius: 4 }}
          >
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
  ];

  return (
    <div
      style={{
        padding: 24,
        backgroundColor: colors.background,
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Title
            level={3}
            style={{ marginBottom: 0, color: colors.text, fontWeight: 600 }}
          >
            Gestion des stages d'été
          </Title>

          <Card
            bordered={false}
            style={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
              borderRadius: 8,
              backgroundColor: colors.card,
            }}
            bodyStyle={{ padding: 16 }}
          >
            <Space size="middle" align="center" wrap>
              <Space>
                <Text strong style={{ color: colors.text }}>
                  Niveau :
                </Text>
                <Select
                  value={niveau}
                  onChange={setNiveau}
                  style={{ width: 180 }}
                  size="middle"
                >
                  <Option value="premiereannee">Première Année</Option>
                  <Option value="deuxiemeannee">Deuxième Année</Option>
                </Select>
              </Space>

              <Space>
                <Text strong style={{ color: colors.text }}>
                  Année :
                </Text>
                <DatePicker
  picker="year"
  value={anneeStage ? dayjs(anneeStage, 'YYYY') : null}
  onChange={(date) => {
    setAnneeStage(date ? date.year().toString() : dayjs().year().toString());
  }}
  placeholder="Sélectionner une année"
  style={{ width: 160 }}
/>

              </Space>

              <Tooltip title="Affecter des enseignants aux stages">
                <Button
                  type="primary"
                  icon={<TeamOutlined />}
                  onClick={() => {
                    setIsModalVisible(true);
                    getTeachers();
                  }}
                >
                  Affecter enseignants
                </Button>
              </Tooltip>

              <Tooltip title="Modifier les affectations existantes">
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    setIsEditModalVisible(true);
                    getTeachers();
                  }}
                >
                  Modifier affectation
                </Button>
              </Tooltip>

              <Tooltip title="Gérer les périodes de dépôt">
  <Button
    type="primary"
    icon={<EditOutlined />}
    onClick={() => navigate("/periods/StageEte")}
  >
    Gérer périodes
  </Button>
</Tooltip>

              <Tooltip title="Envoyer le planning par email">
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={sendPlanningEmail}
                  loading={loading}
                >
                  Envoyer planning
                </Button>
              </Tooltip>

              <Tooltip
                title={isPublished ? "Masquer le planning" : "Publier le planning"}
              >
                <Button
                  type={isPublished ? "primary" : "danger"}
                  icon={isPublished ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  onClick={togglePublicationStatus}
                  loading={loading}
                >
                  {isPublished ? "Masquer planning" : "Publier planning"}
                </Button>
              </Tooltip>
            </Space>
          </Card>

          <Card
  bordered={false}
  style={{
    boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
    borderRadius: 8,
    backgroundColor: colors.card,
  }}
  bodyStyle={{ padding: 0 }}
>
  {loading ? (
    <div style={{ textAlign: "center", padding: 40, minHeight: 300 }}>
      <Spin size="large" />
    </div>
  ) : stages.length === 0 ? (
    <div
      style={{
        textAlign: "center",
        padding: "60px 20px",
        color: "#999",
        minHeight: 300,
      }}
    >
      <FileSearchOutlined style={{ fontSize: 50, color: "#ccc" }} />
      <Text
        type="secondary"
        style={{ display: "block", marginTop: 20, fontSize: 18 }}
      >
        Aucun stage trouvé pour le niveau et l'année sélectionnés.
      </Text>
    </div>
  ) : (
    <Table
      columns={columns}
      dataSource={stages}
      rowKey={(record) => record.stage._id}
      onRow={(record) => ({
        onClick: () => {
          navigate(`/internship/${niveau}/${record.stage._id}`);
        },
        style: { cursor: "pointer" },
      })}
      scroll={{ x: "max-content" }}
      size="middle"
    />
  )}
</Card>

          <Modal
            title="Affectation des enseignants"
            open={isModalVisible}
            onOk={handleAffectation}
            onCancel={() => {
              setIsModalVisible(false);
              setSelectedTeachers([]);
              setSearchText("");
            }}
            okText="Affecter"
            cancelText="Annuler"
            width={600}
          >
            <Input
              placeholder="Rechercher un enseignant..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <Checkbox.Group
              style={{ width: "100%" }}
              value={selectedTeachers}
              onChange={setSelectedTeachers}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                {filteredTeachers.map((teacher) => (
                  <Checkbox key={teacher._id} value={teacher._id}>
                    <Text strong>
                      {teacher.nom} {teacher.prenom}
                    </Text>
                    <Text type="secondary">{teacher.email}</Text>
                  </Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          </Modal>

          <Modal
            title="Modification des affectations"
            open={isEditModalVisible}
            onOk={handleUpdateAffectation}
            onCancel={() => {
              setIsEditModalVisible(false);
              setSelectedStage(null);
              setSelectedTeacherId(null);
            }}
            okText="Enregistrer"
            cancelText="Annuler"
            width={800}
            confirmLoading={editLoading}
          >
            <div style={{ display: "flex", gap: 24 }}>
              <div style={{ flex: 1 }}>
                <Title level={5} style={{ marginBottom: 16 }}>
                  Liste des stages
                </Title>
                <List
                  bordered
                  dataSource={stages}
                  renderItem={(stage) => (
                    <List.Item
                      onClick={() => {
                        setSelectedStage(stage);
                        setSelectedTeacherId(stage.enseignant?._id || null);
                      }}
                      style={{
                        cursor: "pointer",
                        backgroundColor:
                          selectedStage?.stage._id === stage.stage._id
                            ? "#f0f7ff"
                            : "transparent",
                        padding: "8px 12px",
                      }}
                    >
                      <Space direction="vertical" size={0}>
                        <Text strong>{stage.stage.titreSujet}</Text>
                        <Text type="secondary">
                          {stage.etudiant.nom} {stage.etudiant.prenom}
                        </Text>
                        {stage.enseignant && (
                          <Text type="secondary">
                            Enseignant actuel: {stage.enseignant.nom}{" "}
                            {stage.enseignant.prenom}
                          </Text>
                        )}
                      </Space>
                    </List.Item>
                  )}
                />
              </div>

              <div style={{ flex: 1 }}>
                <Title level={5} style={{ marginBottom: 16 }}>
                  Liste des enseignants
                </Title>
                <Input
                  placeholder="Rechercher un enseignant..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ marginBottom: 16 }}
                />
                <Radio.Group
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  style={{ width: "100%" }}
                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {filteredTeachers.map((teacher) => (
                      <Radio
                        key={teacher._id}
                        value={teacher._id}
                        style={{
                          display: "block",
                          marginBottom: 8,
                          padding: "8px 12px",
                        }}
                      >
                        <Space direction="vertical" size={0}>
                          <Text strong>
                            {teacher.nom} {teacher.prenom}
                          </Text>
                          <Text type="secondary">{teacher.email}</Text>
                        </Space>
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              </div>
            </div>
          </Modal>
        </Space>
      </div>
    </div>
  );
}

export default ListeStages;