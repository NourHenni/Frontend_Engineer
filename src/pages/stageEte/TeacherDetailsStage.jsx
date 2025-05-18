import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import dayjs from "dayjs";

// Ant Design
import {
  Button,
  Col,
  DatePicker,
  Descriptions,
  Card,
  message,
  Form,
  Input,
  Modal,
  Row,
  Spin,
  Space,
  Tag,
  TimePicker,
  Typography,
  Radio,
} from "antd";

// Icons
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EditOutlined,
  FileOutlined,
  LinkOutlined,
  MailOutlined,
  UserOutlined,
} from "@ant-design/icons";

// Styles
import "./admin/StageDetails.css";

const { Title, Text } = Typography;

function TeacherDetailsStage() {
  const { type, id } = useParams();
  const navigate = useNavigate();

  const [stageDetails, setStageDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [isPlanningDisabled, setIsPlanningDisabled] = useState(false);
  const [soutenanceId, setSoutenanceId] = useState(null);
  const [statutSujet, setStatutSujet] = useState("Valide");
  const [raison, setRaison] = useState();
  const [openPVModal, setOpenPVModal] = useState(false);
  const [openPlanModal, setOpenPlanModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  const fetchStageDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/internship/${type}/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const details = response.data.data;
      setStageDetails(details);

      if (details?.soutenance?._id) {
        setSoutenanceId(details.soutenance._id);
      }
    } catch (error) {
      console.error("Error fetching stage details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStageDetails();
  }, [type, id]);

  useEffect(() => {
    const isPlanned = localStorage.getItem(`soutenance_planned_${id}`);
    if (isPlanned) {
      setIsPlanningDisabled(true);
    }
  }, [id]);

  const showPlanModal = () => {
    setOpenPlanModal(true);
  };

  const showEditModal = () => {
    const soutenance = stageDetails.soutenance;
    if (soutenance) {
      form.setFieldsValue({
        jour: dayjs(soutenance.jour),
        horaire: dayjs(soutenance.horaire, "HH:mm"),
        lien: soutenance.lien,
      });
    }
    setOpenEditModal(true);
  };

  const handleCancelPlan = () => {
    setOpenPlanModal(false);
    form.resetFields();
  };

  const handleCancelEdit = () => {
    setOpenEditModal(false);
    form.resetFields();
  };

  const handlePlanSoutenance = async () => {
    try {
      const values = await form.validateFields();

      const jour = values.jour.format("YYYY-MM-DD");
      const horaire = values.horaire.format("HH:mm");
      const lien = values.lien;

      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:5000/internship/${type}/${id}`,
        {
          jour,
          horaire,
          lien,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      message.success("Soutenance planifiée avec succès !");
      localStorage.setItem(`soutenance_planned_${id}`, "true");
      setIsPlanningDisabled(true);
      setOpenPlanModal(false);
      form.resetFields();
      await fetchStageDetails();
    } catch (error) {
      console.error("Erreur planification:", error);
      message.error("Erreur lors de la planification !");
    }
  };

  const handleUpdateSoutenance = async () => {
    try {
      const values = await form.validateFields();

      await axios.patch(
        `http://localhost:5000/internship/${type}/${soutenanceId}`,
        {
          jour: values.jour.format("YYYY-MM-DD"),
          horaire: values.horaire.format("HH:mm"),
          lien: values.lien,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      message.success("Soutenance modifiée avec succès");
      setOpenEditModal(false);
      await fetchStageDetails();
    } catch (error) {
      console.error("Erreur :", error);
      message.error("Erreur lors de la modification");
    }
  };

  const downloadFile = async (fileUrl, fileName) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(fileUrl, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "document.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors du téléchargement :", error);
    }
  };

  const renderFileButton = (fileUrl, label) =>
    fileUrl && (
      <Button
        type="link"
        icon={<FileOutlined />}
        onClick={() => downloadFile(fileUrl, `${label}.pdf`)}
        className="file-button"
      >
        {label}
      </Button>
    );

  const handleSubmitPV = async () => {
    try {
      setLoading(true);
      await axios.patch(
        `http://localhost:5000/internship/valider/${type}/${id}`,
        { statutSujet, raison },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      message.success("PV enregistré avec succès");
      await fetchStageDetails();
      setOpenPVModal(false);
      setLoading(false);
    } catch (error) {
      console.error("Erreur :", error);
      message.error("Erreur lors de pv");
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="loading-container">
        <Spin size="large" tip="Chargement..." />
      </div>
    );

  if (!stageDetails)
    return (
      <div className="error-container">
        <Text type="warning">Aucune donnée disponible</Text>
        <Button
          type="primary"
          onClick={() => navigate(-1)}
          className="back-button"
        >
          Retour
        </Button>
      </div>
    );

  return (
    <div className="stage-details-container">
      {/* Header */}
      <div className="header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="back-button"
        >
          Retour
        </Button>
        <Title level={2} className="main-title">
          Détails du Stage -{" "}
          {type === "premiereannee" ? "1ère Année" : "2ème Année"}
        </Title>
      </div>

      {/* Student and Stage Info */}
      <Row gutter={[24, 24]} className="details-row">
        {/* Étudiant */}
        <Col xs={24} md={6}>
          <Card title="Étudiant" className="info-card student-card">
            <Descriptions column={1} size="small">
              <Descriptions.Item label={<Text strong>Nom</Text>}>
                <UserOutlined /> {stageDetails.etudiant.nom}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Prénom</Text>}>
                {stageDetails.etudiant.prenom}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>CIN</Text>}>
                {stageDetails.etudiant.cin}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Email</Text>}>
                <MailOutlined /> {stageDetails.etudiant.email}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Détails du Stage */}
        <Col xs={24} md={12}>
          <Card title="Détails du Stage" className="info-card stage-card">
            <Descriptions column={1} size="small">
              <Descriptions.Item label={<Text strong>Titre</Text>}>
                <Text className="stage-title">
                  {stageDetails.stage.titreSujet}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Entreprise</Text>}>
                {stageDetails.stage.nomEntreprise}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Période</Text>}>
                <CalendarOutlined /> Du{" "}
                {new Date(stageDetails.stage.dateDebut).toLocaleDateString()} au{" "}
                {new Date(stageDetails.stage.dateFin).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Description</Text>}>
                {stageDetails.stage.description}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Statut</Text>}>
                <Space>
                  <Tag
                    color={
                      stageDetails.stage.statutSujet === "Valide"
                        ? "success"
                        : "error"
                    }
                  >
                    Sujet: {stageDetails.stage.statutSujet}
                  </Tag>
                  <Tag
                    color={
                      stageDetails.stage.statutDepot === "Depose"
                        ? "success"
                        : "warning"
                    }
                  >
                    Dépôt: {stageDetails.stage.statutDepot}
                  </Tag>
                </Space>
              </Descriptions.Item>
              {stageDetails.stage.statutSujet === "Non valide" && (
                <Descriptions.Item
                  label={<Text strong>Raison d'invalidation</Text>}
                >
                  {stageDetails.stage.raison
                    ? stageDetails.stage.raison
                    : "Stage non encore validé"}
                </Descriptions.Item>
              )}

              <Descriptions.Item label={<Text strong>Documents</Text>}>
                <Space direction="vertical">
                  {renderFileButton(
                    stageDetails.stage.fichiers.rapport,
                    "Rapport"
                  )}
                  {renderFileButton(
                    stageDetails.stage.fichiers.attestation,
                    "Attestation"
                  )}
                  {renderFileButton(
                    stageDetails.stage.fichiers.ficheEvaluation,
                    "Fiche d'évaluation"
                  )}
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Bouton Planifier */}
      <Row justify="center" style={{ marginTop: 24 }}>
        <Button
          type="primary"
          onClick={showPlanModal}
          disabled={isPlanningDisabled || !!stageDetails.soutenance}
        >
          Planifier Soutenance
        </Button>
      </Row>

      {/* Soutenance si existante */}
      {stageDetails.soutenance && (
        <Row className="soutenance-row">
          <Col span={24}>
            <Card
              title="Soutenance"
              className="info-card defense-card"
              extra={
                <EditOutlined
                  onClick={showEditModal}
                  style={{
                    fontSize: "18px",
                    color: "#1890ff",
                    cursor: "pointer",
                  }}
                />
              }
            >
              <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                <Descriptions.Item label={<Text strong>Date</Text>}>
                  <CalendarOutlined />
                  {new Date(stageDetails.soutenance.jour).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label={<Text strong>Heure</Text>}>
                  <ClockCircleOutlined /> {stageDetails.soutenance.horaire}
                </Descriptions.Item>
                <Descriptions.Item label={<Text strong>Lien</Text>} span={2}>
                  <LinkOutlined />{" "}
                  <a
                    href={stageDetails.soutenance.lien}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="defense-link"
                  >
                    {stageDetails.soutenance.lien}
                  </a>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      )}

      {/* Modal Planification */}
      <Modal
        title="Planifier la soutenance"
        open={openPlanModal}
        onCancel={handleCancelPlan}
        onOk={handlePlanSoutenance}
        okText="Enregistrer"
        cancelText="Annuler"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Jour"
            name="jour"
            rules={[
              { required: true, message: "Veuillez sélectionner une date." },
            ]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Horaire"
            name="horaire"
            rules={[
              { required: true, message: "Veuillez sélectionner une heure." },
            ]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Lien Google Meet"
            name="lien"
            rules={[
              {
                required: true,
                message: "Veuillez saisir le lien Google Meet.",
              },
              {
                pattern: /^https:\/\/meet\.google\.com\/.+$/,
                message: "Le lien doit commencer par https://meet.google.com/",
              },
            ]}
          >
            <Input placeholder="https://meet.google.com/xxx-xxxx-xxx" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de modification */}
      <Modal
        title="Modifier la soutenance"
        open={openEditModal}
        onCancel={handleCancelEdit}
        onOk={handleUpdateSoutenance}
        okText="Enregistrer"
        cancelText="Annuler"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="jour"
            label="Date"
            rules={[{ required: true, message: "Veuillez choisir une date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="horaire"
            label="Heure"
            rules={[{ required: true, message: "Veuillez choisir une heure" }]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="lien"
            label="Lien"
            rules={[
              { required: true, message: "Veuillez entrer un lien valide" },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* MODALE DE VALIDATION PV */}
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <Button
          type="primary"
          onClick={() => setOpenPVModal(true)}
          style={{ backgroundColor: "#1890ff" }}
        >
          Remplir PV
        </Button>

        <Modal
          title="Validation du Stage"
          open={openPVModal}
          onCancel={() => setOpenPVModal(false)}
          footer={null}
          width={600}
        >
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Radio.Group
              onChange={(e) => setStatutSujet(e.target.value)}
              value={statutSujet}
            >
              <Radio value="Valide">Stage Validé</Radio>
              <Radio value="Non valide">Stage Non Validé</Radio>
            </Radio.Group>

            {statutSujet === "Non valide" && (
              <Input.TextArea
                placeholder="Indiquez la raison de l'invalidation"
                value={raison}
                onChange={(e) => setRaison(e.target.value)}
                rows={4}
              />
            )}

            <Button
              type="primary"
              onClick={handleSubmitPV}
              loading={loading}
              block
            >
              {loading ? "Enregistrement…" : "Enregistrer PV"}
            </Button>
          </Space>
        </Modal>
      </div>
    </div>
  );
}

export default TeacherDetailsStage;
