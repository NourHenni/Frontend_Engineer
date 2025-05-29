import React, { useContext, useState, useEffect , useCallback  } from "react";
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
  const [anneeChoisie, setAnneeChoisie] = useState("");
   const [annee, setAnnee] = useState("");
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

 const fetchStages = useCallback(async () => {
    if (userRole === "enseignant") {
      console.log("Fetching assigned stages for teacher..."); // Log
      setLoadingStages(true);
      try {
        const token = localStorage.getItem("token");
        // Assurez-vous que getAssignedStages est bien importé
        const response = await getAssignedStages(niveau, token); 
        console.log("API Response (Teacher View):", response); 

        const stagesData = Array.isArray(response) ? response : response.stages || response.data || [];
        const annee = response.anneeChoisie || new Date().getFullYear();

        setAssignedStages(stagesData);
        setFilteredStages(stagesData); // Assurez-vous que setFilteredStages est défini
        setAnneeChoisie(annee.toString()); // Assurez-vous que setAnneeChoisie est défini
        
      } catch (error) {
        message.error(error.response?.data?.message || "Erreur lors du chargement des stages assignés");
      } finally {
        setLoadingStages(false);
      }
    }
  }, [niveau, userRole]); 
   useEffect(() => {
    fetchStages();
  }, [fetchStages]);


   //  Ajoutez le useEffect pour la visibilité
  useEffect(() => {
    // Ne rien faire si ce n'est pas la vue enseignant
    if (userRole !== 'enseignant') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Teacher view became visible, re-fetching stages...");
        fetchStages();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userRole, fetchStages]);

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


 

const validatePdfAndRequired = (_, fileList) => {
  // Vérifie si le champ est vide
  if (!fileList || fileList.length === 0) {
   
    return Promise.reject(new Error('Ce fichier est obligatoire.')); 
  }
  
  
  const file = fileList[0];
  const isPdf = file.type === 'application/pdf' || (file.name && file.name.toLowerCase().endsWith('.pdf'));
  
  // Rejette si ce n'est pas un PDF
  if (!isPdf) {
    return Promise.reject(new Error('Le fichier doit être au format PDF.'));
  }
  
  // Si le fichier est présent et est un PDF, la validation réussit
  return Promise.resolve();
};


  const formFields = [
    { label: "Titre du Sujet", name: "titreSujet", type: "input", rules: [{ required: true }] },
    { label: "Nom de l'Entreprise", name: "nomEntreprise", type: "input", rules: [{ required: true }] },
    
       { label: "Période du stage", name: "periode", type: "rangeDate", rules: [{ required: true }] },
   {
  label: "Année du stage", 
  name: "anneeStage", 
  type: "input", 
  rules: [
    { 
      required: true, 
      message: "L'année du stage est obligatoire." // Message pour le champ requis
    }, 
    {
      pattern: /^\d{4}$/, // Expression régulière pour exactement 4 chiffres
      message: "L'année doit être composée de 4 chiffres exactement." // Message si le format est incorrect
    }
  ]
},
   
    { 
      label: "Niveau", 
      name: "niveau", 
      type: "select", 
      options: [
        { label: "Première Année", value: "premiereannee" },
        { label: "Deuxième Année", value: "deuxiemeannee" },
      ],
      rules: [{ required: true }],
    },
    { label: "Nature du sujet", name: "natureSujet", type: "input", rules: [{ required: true }] },
    { label: "Description", name: "description", type: "textarea", rules: [{ required: true }] },
   {
    label: "Rapport",
    name: "rapport",
    type: "upload",
    rules: [
      
      { validator: validatePdfAndRequired } 
    ]
  },
    {
    label: "Attestation",
    name: "attestation",
    type: "upload",
    rules: [
     
      { validator: validatePdfAndRequired } 
    ]
  },
     {
    label: "Fiche d'évaluation",
    name: "ficheEvaluation",
    type: "upload",
    rules: [
      
      { validator: validatePdfAndRequired } 
    ]
  },
  ];

  useEffect(() => {
    localStorage.setItem('depotsStage', JSON.stringify(depots));
  }, [depots]);

  const handleSubmit = async (values) => {
  try {
    // Vérification initiale des fichiers (avant de créer FormData)
    if (!values.rapport || values.rapport.length === 0) {
      message.error("Le fichier du rapport est manquant.");
      return; // Arrêter la soumission
    }
    if (!values.attestation || values.attestation.length === 0) {
      message.error("Le fichier de l'attestation est manquant.");
      return; // Arrêter la soumission
    }
    if (!values.ficheEvaluation || values.ficheEvaluation.length === 0) {
      message.error("Le fichier de la fiche d'évaluation est manquant.");
      return; // Arrêter la soumission
    }
    // Vérification aussi pour la période, au cas où
    if (!values.periode || values.periode.length !== 2) {
        message.error("La période de stage est invalide ou manquante.");
        return;
    }

    const formData = new FormData();
    const [dateDebut, dateFin] = values.periode; // Maintenant, on sait que values.periode est un tableau de 2 éléments

    formData.append("titreSujet", values.titreSujet);
    formData.append("nomEntreprise", values.nomEntreprise);
    formData.append("dateDebut", dateDebut.format("YYYY-MM-DD"));
    formData.append("dateFin", dateFin.format("YYYY-MM-DD"));
    formData.append("anneeStage", values.anneeStage);
    formData.append("niveau", values.niveau);
    formData.append("natureSujet", values.natureSujet);
    formData.append("description", values.description);
    
    // Accès sécurisé aux fichiers après vérification
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
    console.error("Erreur lors du dépôt:", error); // Log plus détaillé de l'erreur
    message.error(error.response?.data?.message || error.message || "Échec du dépôt.");
  }
};


  const renderStudentView = () => (
    <>
      <Card 
        title="Dépôt de stage d'été" 
        bordered={false} 
        className="depot-card" 
        extra={
          <Button 
            type="primary" 
            text="Déposer un sujet" 
            icon={<PlusOutlined />} 
            onClick={() => setIsModalOpen(true)} 
            className="depot-button" 
          />
        }
      >
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Alert 
              message="Instructions importantes" 
              description={
                <>
                  <p><InfoCircleOutlined /> Tous les champs sont obligatoires</p>
                  <p><InfoCircleOutlined /> Les fichiers doivent être au format PDF</p>
                  <p><InfoCircleOutlined /> Maximum 2 dépôts autorisés par étudiant</p>
                </>
              } 
              type="info" 
              showIcon 
              closable 
            />
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

          <Card 
            title="Statistiques et actions" 
            bordered={false} 
            className="depot-card" 
            style={{ marginTop: 24 }}
          >
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

    const getFileIcon = (fileName) => {
      if (!fileName) return null;
      const extension = fileName.split('.').pop().toLowerCase();
      switch (extension) {
        case 'pdf':
          return <FilePdfOutlined style={{ color: '#FF0000' }} />;
        case 'doc':
        case 'docx':
          return <FileWordOutlined style={{ color: '#2B579A' }} />;
        case 'xls':
        case 'xlsx':
          return <FileExcelOutlined style={{ color: '#217346' }} />;
        default:
          return <FileOutlined />;
      }
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
              text === "Valide" ? "green" : 
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

    const renderTableContent = () => {
      console.log("Filtered stages:", filteredStages); 
      if (loadingStages) {
        return (
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
        );
      }

      if (filteredStages.length > 0) {
         console.log("Rendering table with data:", filteredStages);
        return (
          <Table
            columns={columns}
            dataSource={filteredStages}
            rowKey={(record) => record?._id || record?.id || Math.random()}
            onRow={(record) => ({
              onClick: () => navigate(`/internship/${niveau}/${record._id}`),
              style: { cursor: 'pointer' } 
            })}
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
          />
        );
      }

      return (
        <Empty
          description={
            <Text style={{ color: colors.text }}>
              {anneeChoisie 
                ? `Aucun stage trouvé pour ${niveau === 'premiereannee' ? 'la 1ère année' : 'la 2ème année'}  cette année`
                : "Aucun stage trouvé pour les critères sélectionnés"}
            </Text>
          }
          style={{ padding: 40 }}
        />
      );
    };

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
            <Title 
              level={3} 
              style={{ 
                marginBottom: 0,
                color: colors.text,
                fontWeight: 600
              }}
            >
              Mes stages de l'année courante
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
                  
                  {annee && (
                    <Text strong style={{ color: colors.text, marginLeft: 16 }}>
                      Année : {annee}
                    </Text>
                  )}
                </Space>
                
                <Input
                  placeholder="Rechercher un stage..."
                  prefix={<SearchOutlined />}
                  onChange={(e) => handleSearch(e.target.value)}
                  value={searchText}
                  style={{ width: 300 }}
                  allowClear
                  className="custom-input"
                />
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
              {renderTableContent()}
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
        return (
          <div className="access-denied-card">
            <h1>Rôle non défini</h1>
          </div>
        );
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