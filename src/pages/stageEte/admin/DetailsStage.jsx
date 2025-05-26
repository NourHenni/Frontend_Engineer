import React from "react";
import { useParams } from "react-router-dom";
import { 
  Card, Typography, Button, Space, Tag, Descriptions, Row, Col, Spin,
  Divider, Avatar, Badge
} from "antd";
import {
  UserOutlined, MailOutlined, CalendarOutlined,
  FileOutlined, TeamOutlined, ClockCircleOutlined, LinkOutlined,
  EnvironmentOutlined, PhoneOutlined, IdcardOutlined,
  BookOutlined, SafetyCertificateOutlined, ScheduleOutlined
} from "@ant-design/icons";
import axios from "axios";
import { useEffect, useState } from "react";
import "./StageDetails.css";

const { Title, Text, Paragraph } = Typography;

const StageDetails = () => {
  const { type, id } = useParams();
  const [stageDetails, setStageDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStageDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/internship/${type}/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStageDetails(response.data.data);
      } catch (error) {
        console.error("Error fetching stage details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStageDetails();
  }, [type, id]);

  const downloadFile = async (fileUrl, fileName) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(fileUrl, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'document.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement :', error);
    }
  };

  const renderFileButton = (fileUrl, label) => (
    fileUrl && (
      <Button
        type="link"
        icon={<FileOutlined />}
        onClick={() => downloadFile(fileUrl, `${label}.pdf`)}
        className="file-button"
      >
        {label}
      </Button>
    )
  );

  if (loading) return (
    <div className="loading-container">
      <Spin size="large" tip="Chargement en cours..." />
    </div>
  );

  if (!stageDetails) return (
    <div className="error-container">
      <Text type="warning">Aucune donnée disponible pour ce stage</Text>
    </div>
  );

  return (
    <div className="stage-details-container">
      <div className="header-section">
        <Title level={2} className="main-title">
          <BookOutlined /> Détails du Stage {type === 'premiereannee' ? '1ère Année' : '2ème Année'}
        </Title>
        
        <div className="status-section">
          <div className="status-item">
            <Text strong>Sujet :</Text>
             <Tag color={stageDetails.stage.statutSujet === "Valide" ? "success" : "error"}>
                                 {stageDetails.stage.statutSujet}
                              </Tag>
          </div>
         <div className="status-item">
  <Text strong>Statut Dépôt :</Text>
   <Tag color={stageDetails.stage.statutDepot === "Depose" ? "success" : "error"}>
                       {stageDetails.stage.statutDepot}
                    </Tag>
</div>
        </div>
      </div>

      <Row gutter={[24, 24]} className="details-row">
        {/* Étudiant Section */}
        <Col xs={24} md={8}>
          <Card 
            title={
              <span className="card-title">
                <UserOutlined /> Informations Étudiant
              </span>
            } 
            className="info-card student-card"
          >
            <div className="student-profile">
              <Avatar size={64} icon={<UserOutlined />} className="student-avatar" />
              <Title level={4} className="student-name">
                {stageDetails.etudiant.prenom} {stageDetails.etudiant.nom}
              </Title>
            </div>
            
            <Descriptions column={1} size="small" className="student-info">
              <Descriptions.Item label={<Text strong>CIN :</Text>}>
                {stageDetails.etudiant.cin}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Email :</Text>}>
                {stageDetails.etudiant.email}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Téléphone :</Text>}>
                {stageDetails.etudiant.telephone || 'Non renseigné'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Stage Section */}
        <Col xs={24} md={16}>
          <Card 
            title={
              <span className="card-title">
                <EnvironmentOutlined /> Détails du Stage
              </span>
            } 
            className="info-card stage-card"
          >
            <Descriptions column={1} size="middle" className="stage-info">
              <Descriptions.Item label={<Text strong>Titre :</Text>}>
                {stageDetails.stage.titreSujet}
              </Descriptions.Item>
              
              <Descriptions.Item label={<Text strong>Nom Entreprise :</Text>}>
                {stageDetails.stage.nomEntreprise}
              </Descriptions.Item>
              
              {stageDetails.stage.adresseEntreprise && (
                <Descriptions.Item label={<Text strong>Adresse Entreprise :</Text>}>
                  {stageDetails.stage.adresseEntreprise}
                </Descriptions.Item>
              )}
              
              <Descriptions.Item label={<Text strong>Période de stage :</Text>}>
                Du {new Date(stageDetails.stage.dateDebut).toLocaleDateString()} au {new Date(stageDetails.stage.dateFin).toLocaleDateString()}
              </Descriptions.Item>
              
              <Descriptions.Item label={<Text strong>Description :</Text>}>
                {stageDetails.stage.description || 'Aucune description fournie'}
              </Descriptions.Item>
              
              {stageDetails.stage.statutSujet === "Non valide" && (
                <Descriptions.Item label={<Text strong>Raison d'invalidation :</Text>}>
                  {stageDetails.stage.raison || "Raison non spécifiée"}
                </Descriptions.Item>
              )}
              
              <Descriptions.Item label={<Text strong>Documents :</Text>}>
                <Space direction="vertical" className="documents-section">
                  {renderFileButton(stageDetails.stage.fichiers.rapport, "Rapport de stage")}
                  {renderFileButton(stageDetails.stage.fichiers.attestation, "Attestation de stage")}
                  {renderFileButton(stageDetails.stage.fichiers.ficheEvaluation, "Fiche d'évaluation")}
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} className="secondary-row">
        {/* Encadrant Section */}
        <Col xs={24} md={12}>
          <Card 
            title={
              <span className="card-title">
                <TeamOutlined /> Encadrement Pédagogique
              </span>
            } 
            className="info-card teacher-card"
          >
            {stageDetails.enseignant ? (
              <div className="teacher-profile">
                <Avatar size={64} icon={<UserOutlined />} className="teacher-avatar" />
                <Descriptions column={1} size="small" className="teacher-info">
                  <Descriptions.Item label={<Text strong>Nom :</Text>}>
                    {stageDetails.enseignant.nom}
                  </Descriptions.Item>
                  <Descriptions.Item label={<Text strong>Email :</Text>}>
                    {stageDetails.enseignant.email}
                  </Descriptions.Item>
                  {stageDetails.enseignant.telephone && (
                    <Descriptions.Item label={<Text strong>Téléphone :</Text>}>
                      {stageDetails.enseignant.telephone}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </div>
            ) : (
              <div className="no-teacher-container">
                <Text type="secondary" className="no-teacher">
                  <SafetyCertificateOutlined /> Aucun enseignant assigné
                </Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Soutenance Section */}
        <Col xs={24} md={12}>
          {stageDetails.soutenance && (
            <Card 
              title={
                <span className="card-title">
                  <ScheduleOutlined /> Détails de Soutenance
                </span>
              } 
              className="info-card defense-card"
            >
              <Descriptions column={1} size="small" className="defense-info">
                <Descriptions.Item label={<Text strong>Date :</Text>}>
                  {new Date(stageDetails.soutenance.jour).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label={<Text strong>Heure :</Text>}>
                  {stageDetails.soutenance.horaire}
                </Descriptions.Item>
                {stageDetails.soutenance.lien && (
                  <Descriptions.Item label={<Text strong>Lien :</Text>}>
                    <a 
                      href={stageDetails.soutenance.lien} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="defense-link"
                    >
                      <LinkOutlined /> Accéder à la soutenance
                    </a>
                  </Descriptions.Item>
                )}
                {stageDetails.soutenance.salle && (
                  <Descriptions.Item label={<Text strong>Salle :</Text>}>
                    {stageDetails.soutenance.salle}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default StageDetails;