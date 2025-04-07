import React, { useContext, useState, useEffect } from "react";
import { message, Card, Row, Col, Steps, Alert, Divider, Result, Select, Statistic } from "antd";
import { PlusOutlined, FilePdfOutlined, InfoCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import Button from "../../components/button/Button";
import FormModal from "../../components/modals/FormModal";
import { postInternship } from "../../services/stageServices";
import { UserContext } from "../../App";
import "./stageEte.css";
import SuccessAlert from "./SuccessAlert";
import SidebarLayout from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import ListeStages from "./ListeStages";

const { Step } = Steps;
const { Option } = Select;
const { Countdown } = Statistic;

function StageEte() {
  const [collapsed, setCollapsed] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const user = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [depots, setDepots] = useState(() => {
    const saved = localStorage.getItem('depotsStage');
    return saved ? JSON.parse(saved) : [];
  });
  const [userRole, setUserRole] = useState(null);
  const [selectedDisplay, setSelectedDisplay] = useState("adminView");
  const [deadline] = useState(Date.now() + 1000 * 60 * 60 * 24 * 15); // 15 jours pour exemple

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const decodedPayload = JSON.parse(atob(base64));
        setUserRole(decodedPayload.role);
      } catch (error) {
        console.error("Error decoding token", error);
      }
    }
  }, []);

  const formFields = [
    { label: "Titre du Sujet", name: "titreSujet", type: "input", rules: [{ required: true }] },
    { label: "Nom de l'Entreprise", name: "nomEntreprise", type: "input", rules: [{ required: true }] },
    { label: "Période du stage", name: "periode", type: "rangeDate", rules: [{ required: true }] },
    { label: "Année du stage", name: "anneeStage", type: "input", rules: [{ required: true }] },
    { label: "Niveau", name: "niveau", type: "select", options: [
        { label: "Première Année", value: "premiereannee" },
        { label: "Deuxième Année", value: "deuxiemeannee" },
      ],
      rules: [{ required: true }],
    },
    { label: "Nature du sujet", name: "natureSujet", type: "input", rules: [{ required: true }] },
    { label: "Description", name: "description", type: "textarea", rules: [{ required: true }] },
    { label: "Rapport", name: "rapport", type: "upload", rules: [{ required: true }] },
    { label: "Attestation", name: "attestation", type: "upload", rules: [{ required: true }] },
    { label: "Fiche d'évaluation", name: "ficheEvaluation", type: "upload", rules: [{ required: true }] },
  
  ];

  useEffect(() => {
    localStorage.setItem('depotsStage', JSON.stringify(depots));
  }, [depots]);

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();
      const [dateDebut, dateFin] = values.periode;

      formData.append("titreSujet", values.titreSujet);
      formData.append("nomEntreprise", values.nomEntreprise);
      formData.append("dateDebut", dateDebut.format("YYYY-MM-DD"));
      formData.append("dateFin", dateFin.format("YYYY-MM-DD"));
      formData.append("anneeStage", values.anneeStage);
      formData.append("niveau", values.niveau);
      formData.append("natureSujet", values.natureSujet);
      formData.append("description", values.description);
      formData.append("rapport", values.rapport[0].originFileObj);
      formData.append("attestation", values.attestation[0].originFileObj);
      formData.append("ficheEvaluation", values.ficheEvaluation[0].originFileObj);
      const response = await postInternship(values.niveau, formData, localStorage.getItem("token"));
      message.success(response.message);

      setSuccessData({
        titreSujet: values.titreSujet,
        anneeStage:values.anneeStage,
        niveau: values.niveau,
        reference: response.reference || "REF-" + Math.floor(Math.random() * 10000)
      });
  
      setIsModalOpen(false);
    } catch (error) {
      message.error(error.message || "Échec du dépôt.");
    }
  };

    
  

  const renderStudentView = () => (
    <>
      <Card title="Dépôt de stage d'été" bordered={false} className="depot-card" extra={
        <Button type="primary" text="Nouveau dépôt" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} className="depot-button" />
      }>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Alert message="Instructions importantes" description={
              <>
                <p><InfoCircleOutlined /> Tous les champs sont obligatoires</p>
                <p><InfoCircleOutlined /> Les fichiers doivent être au format PDF</p>
                <p><InfoCircleOutlined /> Maximum 2 dépôts autorisés par étudiant</p>
              </>
            } type="info" showIcon closable />
          </Col>

          <Col span={24}>
            <Divider orientation="left">Processus de dépôt</Divider>
            <Steps current={currentStep} onChange={setCurrentStep}>
              <Step title="Remplir le formulaire" description="Toutes les informations du stage" />
              <Step title="Upload des documents" description="Rapport, attestation et fiche" />
              <Step title="Validation" description="Confirmation du dépôt" />
            </Steps>
          </Col>

          
        </Row>
      </Card>
      {successData && <SuccessAlert onClose={() => setSuccessData(null)} stageDetails={successData} />}
      <FormModal
        isModalOpen={isModalOpen} 
        setIsModalOpen={setIsModalOpen} 
        formFields={formFields} 
        title={<div className="modal-title"><FilePdfOutlined /> Nouveau dépôt de stage</div>} 
        onSubmit={handleSubmit} 
        width={800} 
      />
    </>
  );

  const renderAdminView = () => (
    <div className="admin-container">
      <div className="select-container">
        <h1>Gestion des stages d'été</h1>
        <Select 
          value={selectedDisplay} 
          onChange={setSelectedDisplay} 
          style={{ width: 250 }}
          size="large"
        >
          <Option value="etudiant">Déposer un stage</Option>
          <Option value="enseignant">Stages affectés</Option>
          <Option value="adminView">Vue d'administration</Option>
        </Select>
      </div>

      {selectedDisplay === "adminView" ? (
        <div className="admin-content">
          <Card title="Tous les stages déposés" bordered={false} className="depot-card">
            <ListeStages />
          </Card>

          <Card title="Statistiques et actions" bordered={false} className="depot-card" style={{ marginTop: 24 }}>
            <Row gutter={[24, 24]}>
              <Col span={8}>
                <Card bordered={false} className="stat-card">
                  <h3>Stages déposés</h3>
                  <p className="stat-value">124</p>
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false} className="stat-card">
                  <h3>Stages validés</h3>
                  <p className="stat-value">98</p>
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false} className="stat-card">
                  <h3>En attente</h3>
                  <p className="stat-value">26</p>
                </Card>
              </Col>
              <Col span={24}>
                <Alert 
                  message="Délai de dépôt" 
                  description={
                    <Countdown 
                      title="Temps restant pour les dépôts" 
                      value={deadline} 
                      format="J [jours] H [heures] m [minutes]" 
                    />
                  } 
                  type="info" 
                  showIcon 
                />
              </Col>
            </Row>
          </Card>
        </div>
      ) : selectedDisplay === "etudiant" ? (
        renderStudentView()
      ) : (
        <div>
          <h2>Liste des Stages Affectés</h2>
          <Card bordered={false} className="depot-card">
            <p>Interface enseignant - À implémenter</p>
          </Card>
        </div>
      )}
    </div>
  );

  const renderTeacherView = () => (
    <div className="teacher-container">
      <h1>Gestion des stages - Interface Professeur</h1>
      <Card bordered={false} className="depot-card">
        <p>Fonctionnalités enseignants à implémenter ici</p>
      </Card>
    </div>
  );

  const renderContentByRole = () => {
    switch(userRole) {
      case "etudiant":
        return renderStudentView();
      case "admin":
        return renderAdminView();
      case "enseignant":
        return renderTeacherView();
      default:
        return <div className="access-denied-card"><h1>Rôle non défini</h1></div>;
    }
  };

  return (
    <div>
      <Navbar />
      <SidebarLayout collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="stage-ete-container">
        {renderContentByRole()}
      </div>
    </div>
  );
}

export default StageEte;