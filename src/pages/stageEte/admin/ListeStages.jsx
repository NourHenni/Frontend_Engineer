import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
} from "../../../services/stageServices";
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
import "../ListeStages.css";

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

function ListeStages() {
  // --- États existants ---
  const [niveau, setNiveau] = useState(
    () => localStorage.getItem("stageNiveau") || "premiereannee"
  );
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
  const [availableYears, setAvailableYears] = useState([]);
  const [anneeStage, setAnneeStage] = useState(
    () => localStorage.getItem("stageAnnee") || null
  );
  const [editLoading, setEditLoading] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false); // Assurez-vous que cet état est utilisé
  const [publishing, setPublishing] = useState(false); // Assurez-vous que cet état est utilisé

  const navigate = useNavigate();

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
      return message.warning(
        "Veuillez sélectionner un stage et un enseignant."
      );
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
      message.success(
        `Planning ${newStatus ? "publié" : "masqué"} avec succès !`
      );

      await fetchStages(niveau, anneeStage);
    } catch (err) {
      message.error(
        err.response?.data?.message ||
          "Erreur lors de la modification du statut"
      );
      await fetchStages(niveau, anneeStage);
    } finally {
      setLoading(false);
    }
  };

  const fetchStages = useCallback(async (selectedType, selectedYear) => {
    if (!selectedType || !selectedYear) {
      console.log("fetchStages called with invalid params, skipping.");
      setStages([]);
      setIsPublished(false);
      return;
    }

    console.log(
      `Fetching stages for type: ${selectedType}, year: ${selectedYear}`
    );
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

        publie: stage.publie !== undefined ? stage.publie : stage.stage?.publie,
      }));

      setStages(stagesAvecPublication);
      setIsPublished(stagesAvecPublication.some((stage) => stage.publie));
    } catch (err) {
      console.error("Erreur fetchStages:", err);
      if (err.response && err.response.status === 404) {
        setStages([]);
        setIsPublished(false);
        console.log("Aucun stage trouvé (réponse 404 du serveur).");
      } else {
        message.error(err.message || "Erreur lors du chargement des stages.");
        setStages([]);
        setIsPublished(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // --- useEffect pour le chargement initial des années et de l'année sélectionnée ---
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/internship/years",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        let years = [];
        if (response.data && response.data.years) {
          years = response.data.years.sort((a, b) => b - a);
          setAvailableYears(years);
        }

        let currentAnnee = anneeStage;
        if (!currentAnnee) {
          const savedAnnee = localStorage.getItem("stageAnnee");
          if (savedAnnee && years.includes(parseInt(savedAnnee))) {
            currentAnnee = parseInt(savedAnnee);
          } else if (years.length > 0) {
            currentAnnee = years[0];
            localStorage.setItem("stageAnnee", years[0]);
          }
        }

        if (currentAnnee !== anneeStage) {
          setAnneeStage(currentAnnee);
        }
      } catch (error) {
        console.error("Erreur d'initialisation (années):", error);

        setAnneeStage(null);
        setAvailableYears([]);
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (niveau && anneeStage) {
      localStorage.setItem("stageNiveau", niveau);
      localStorage.setItem("stageAnnee", anneeStage);
      fetchStages(niveau, anneeStage);
    } else {
      setStages([]);
      setIsPublished(false);
    }
  }, [niveau, anneeStage, fetchStages]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && niveau && anneeStage) {
        console.log("ListeStages view became visible, re-fetching stages...");
        fetchStages(niveau, anneeStage);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [niveau, anneeStage, fetchStages]);

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
            <UserOutlined /> {etudiant?.nom} {etudiant?.prenom}
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
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Card
            bordered={false}
            style={styles.card}
            bodyStyle={{ padding: "16px 24px" }}
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
                <Select
                  placeholder="Sélectionner..."
                  style={{ width: 140 }}
                  value={anneeStage ? anneeStage.toString() : undefined}
                  onChange={(value) => setAnneeStage(parseInt(value))}
                  loading={loading && availableYears.length === 0}
                  notFoundContent={
                    loading ? <Spin size="small" /> : "Aucune année"
                  }
                  size="middle"
                >
                  {availableYears.map((year) => (
                    <Option key={year} value={year.toString()}>
                      {year}
                    </Option>
                  ))}
                </Select>
              </Space>

              {/* Boutons d'action */}
              <Tooltip title="Affecter des enseignants aux stages">
                <Button
                  type="primary"
                  icon={<TeamOutlined />}
                  onClick={() => {
                    setIsModalVisible(true);
                    getTeachers();
                  }}
                  size="middle"
                  disabled={stages.length === 0}
                >
                  Affecter enseignants
                </Button>
              </Tooltip>

              <Tooltip title="Modifier les affectations existantes">
                <Button
                  icon={<EditOutlined />}
                  type="primary"
                  onClick={() => {
                    setIsEditModalVisible(true);
                    getTeachers();
                  }}
                  size="middle"
                  disabled={stages.length === 0}
                >
                  Modifier affectation
                </Button>
              </Tooltip>

              <Tooltip title="Gérer les périodes de dépôt">
                <Button
                  icon={<EditOutlined />}
                  type="primary"
                  onClick={() => navigate("/periods/StageEte")}
                  size="middle"
                >
                  Gérer périodes
                </Button>
              </Tooltip>

              <Tooltip title="Envoyer le planning par email">
                <Button
                  icon={<SendOutlined />}
                  type="primary"
                  onClick={sendPlanningEmail}
                  loading={sendingEmail}
                  size="middle"
                  disabled={stages.length === 0}
                >
                  Envoyer planning
                </Button>
              </Tooltip>

              <Tooltip
                title={
                  isPublished ? "Masquer le planning" : "Publier le planning"
                }
              >
                <Button
                  type="primary"
                  icon={
                    isPublished ? <EyeInvisibleOutlined /> : <EyeOutlined />
                  }
                  onClick={togglePublicationStatus}
                  loading={publishing}
                  size="middle"
                  disabled={stages.length === 0}
                >
                  {isPublished ? "Masquer planning" : "Publier planning"}
                </Button>
              </Tooltip>
            </Space>
          </Card>

          {/* --- Card pour la Table --- */}
          <Card
            bordered={false}
            style={styles.card}
            bodyStyle={{ paddingTop: 0 }}
          >
            <Table
              columns={columns}
              dataSource={stages}
              loading={loading}
              onRow={(record) => ({
                onClick: () => {
                  navigate(`/internship/${niveau}/${record.stage._id}`);
                },
                style: { cursor: "pointer" },
              })}
              rowKey={(record) => record._id || record.stage?._id}
              scroll={{ x: 1300 }}
              style={styles.table}
              locale={{
                emptyText: (
                  <Empty description="Aucun stage trouvé pour le niveau et l'année sélectionnés." />
                ),
              }}
              size="middle"
            />
          </Card>
        </Space>
      </div>

      {/* Modal Affectation */}

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

      {/* Modal Modification Affectation */}
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
    </div>
  );
}

export default ListeStages;
