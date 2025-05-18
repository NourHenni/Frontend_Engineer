import React, { useContext, useState, useEffect } from "react";
import { 
  message, 
  Card, 
  Row, 
  Col, 
  Steps, 
  Button, 
  Alert, 
  Divider, 
  Result, 
  Select, 
  Statistic, 
  Table, 
  Spin, 
  Input,
  Empty, 
  Space,
  Tag, 
  Typography,
  Badge
} from "antd";
import { 
  PlusOutlined, 
  InfoCircleOutlined, 
  CheckCircleOutlined,
  SearchOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileOutlined,
  UserOutlined,
  MailOutlined,
  FilterOutlined,
  CalendarOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import FormModal from "../../components/modals/FormModal";
import { postInternship } from "../../services/stageServices";
import { UserContext } from "../../App";
import "./stageEte.css";
import "./TeacherView.css";
import SuccessAlert from "./SuccessAlert";
import SidebarLayout from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import ListeStages from "./admin/ListeStages";
import { getAssignedStages } from "../../services/stageServices";

const { Step } = Steps;
const { Option } = Select;
const { Countdown } = Statistic;
const { Search } = Input;
const { Title, Text } = Typography;

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
  const [deadline] = useState(Date.now() + 1000 * 60 * 60 * 24 * 15);
  const [niveau, setNiveau] = useState("premiereannee");
  const [assignedStages, setAssignedStages] = useState([]);
  const [loadingStages, setLoadingStages] = useState(false);
  const [currentYear, setCurrentYear] = useState("");
  const navigate = useNavigate();
  const [filteredStages, setFilteredStages] = useState([]);
  const [searchText, setSearchText] = useState("");

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

  useEffect(() => {
    const fetchStages = async () => {
      if (userRole === "enseignant") {
        setLoadingStages(true);
        try {
          const token = localStorage.getItem("token");
          const response = await getAssignedStages(niveau, token);

          console.log("API Response:", response);
          
          if (response.success) {
            setAssignedStages(response.stages);
            setFilteredStages(response.stages);
            if (response.stages.length > 0) {
              setCurrentYear(response.stages[0].anneeStage);
            }
          }
        } catch (error) {
          message.error(error.message || "Erreur lors du chargement des stages");
        } finally {
          setLoadingStages(false);
        }
      }
    };

    fetchStages();
  }, [niveau, userRole]);

  const refreshData = () => {
    setSearchText("");
    const token = localStorage.getItem("token");
    getAssignedStages(niveau, token)
      .then(response => {
        if (response.success) {
          setAssignedStages(response.stages);
          setFilteredStages(response.stages);
          if (response.stages.length > 0) {
            setCurrentYear(response.stages[0].anneeStage);
          }
          message.success("Données actualisées avec succès");
        }
      })
      .catch(error => {
        message.error("Erreur lors de l'actualisation des données");
      });
  };

  const handleSearch = (value) => {
    setSearchText(value);
    const lower = value.toLowerCase();
    const filtered = assignedStages.filter(
      (stage) =>
        stage.titreSujet?.toLowerCase().includes(lower) ||
        stage.nomEntreprise?.toLowerCase().includes(lower) ||
        stage.etudiant?.nom?.toLowerCase().includes(lower) ||
        stage.etudiant?.email?.toLowerCase().includes(lower)
    );
    setFilteredStages(filtered);
  };

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
        anneeStage: values.anneeStage,
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
        <Button type="primary" text="Déposer un sujet" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} className="depot-button" />
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

      <Button
        type="primary"
        icon={<FilePdfOutlined />}
        onClick={() => navigate("/affectation/premiereannee")}
      >
        Consulter PV 1ère Année
      </Button>

      <Button
        type="default"
        icon={<FilePdfOutlined />}
        onClick={() => navigate("/affectation/deuxiemeannee")}
        style={{ marginLeft: "10px" }}
      >
        Consulter PV 2ème Année
      </Button>
    </>
  );

  const renderAdminView = () => (
    <div className="admin-container">
      <div className="select-container">
        <h1>Gestion des stages d'été</h1>
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
      ) : renderStudentView()}
    </div>
  );

  const renderTeacherView = () => {
    const colors = {
      primary: "#1890ff",
      secondary: "#52c41a",
      danger: "#f5222d",
      background: "#f8f9fa",
      card: "#ffffff",
      text: "#343a40",
      border: "#e9ecef"
    };

    const columns = [
      {
        title: "Titre",
        dataIndex: "titreSujet",
        key: "titre",
        render: (text) => <Text strong>{text}</Text>,
        width: 200,
        fixed: "left"
      },
      {
        title: "Entreprise",
        dataIndex: "nomEntreprise",
        key: "entreprise",
        width: 150
      },
      {
        title: "Année",
        dataIndex: "anneeStage",
        key: "annee",
        render: (text) => (
          <Tag color="blue" icon={<CalendarOutlined />}>
            {text}
          </Tag>
        ),
        align: "center",
        width: 120
      },
      {
        title: "Niveau",
        dataIndex: "niveau",
        key: "niveau",
        render: (text) => (
          <Tag color={text === "premiereannee" ? "geekblue" : "cyan"}>
            {text === "premiereannee" ? "1ère Année" : "2ème Année"}
          </Tag>
        ),
        align: "center",
        width: 120
      },
      {
        title: "Statut",
        dataIndex: "statutSujet",
        key: "statut",
        render: (text) => (
          <Tag 
            color={
              text === "validé" ? "green" : 
              text === "en attente" ? "orange" : 
              "red"
            }
          >
            {text}
          </Tag>
        ),
        align: "center",
        width: 120
      },
      {
        title: "Étudiant",
        key: "etudiant",
        render: (_, record) => (
          <Space direction="vertical" size={0}>
            <Text strong>
              <UserOutlined /> {record.etudiant.nom}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <MailOutlined /> {record.etudiant.email}
            </Text>
          </Space>
        ),
        width: 220
      }
    ];

    return (
      <div style={{ padding: 24, minHeight: "100vh" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Title level={3} style={{ marginBottom: 0 }}>
              Mes stages assignés
            </Title>
            
            <Card bordered={false} bodyStyle={{ padding: 16 }}>
              <Space size="middle" align="center" wrap>
                <Space>
                  <Text strong>Niveau :</Text>
                  <Select 
                    value={niveau} 
                    onChange={setNiveau}
                    style={{ width: 180 }}
                  >
                    <Option value="premiereannee">Première Année</Option>
                    <Option value="deuxiemeannee">Deuxième Année</Option>
                  </Select>
                </Space>
                
                <Space>
                  <Text strong>Année :</Text>
                  <Badge 
                    count={currentYear || "N/A"} 
                    style={{ 
                      backgroundColor: '#1890ff',
                      fontSize: 14,
                      padding: '4px 8px',
                      borderRadius: 4
                    }} 
                  />
                </Space>

                <Input
                  placeholder="Rechercher un stage..."
                  prefix={<SearchOutlined />}
                  onChange={(e) => handleSearch(e.target.value)}
                  value={searchText}
                  style={{ width: 300 }}
                  allowClear
                />

                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={refreshData}
                >
                  Actualiser
                </Button>
              </Space>
            </Card>
      
            <Card bordered={false} bodyStyle={{ padding: 0 }}>
              {loadingStages ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: 40,
                  minHeight: 300,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}>
                  <Spin size="large" tip="Chargement des stages..." />
                </div>
              ) : filteredStages.length > 0 ? (
                <Table
                  columns={columns}
                  dataSource={filteredStages}
                  rowKey={(record) => record._id}
                  onRow={(record) => ({
                    onClick: () => {
                      navigate(`/internship/${niveau}/${record._id}`);
                    },
                    style: { 
                      cursor: 'pointer',
                      ':hover': {
                        backgroundColor: '#f5f5f5'
                      }
                    } 
                  })}
                  pagination={{ 
                    pageSize: 8, 
                    showSizeChanger: false,
                    position: ['bottomCenter'],
                    showTotal: (total) => `${total} stages au total`
                  }}
                  scroll={{ x: 'max-content' }}
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <Text>
                      {searchText ? 
                        "Aucun stage ne correspond à votre recherche" : 
                        `Aucun stage trouvé pour ${niveau === "premiereannee" ? "la première année" : "la deuxième année"} ${currentYear ? `en ${currentYear}` : ''}`
                      }
                    </Text>
                  }
                  style={{ padding: 40 }}
                />
              )}
            </Card>
          </Space>
        </div>
      </div>
    );
  };

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