import React, { useContext, useState,useEffect } from "react";
import { message, Card, Row, Col, Steps, Alert, Divider , Result } from "antd";
import { 
  PlusOutlined, 
  FilePdfOutlined,
  InfoCircleOutlined ,
  CheckCircleOutlined
} from "@ant-design/icons";
import Button from "../../components/button/Button";
import FormModal from "../../components/modals/FormModal";
import { postInternship } from "../../services/stageServices";
import { UserContext } from "../../App";
import "./stageEte.css";
import SuccessAlert from "./SuccessAlert"; 

const { Step } = Steps;



function StageEte() {
  const [successData, setSuccessData] = useState(null);
  const user = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [depots, setDepots] = useState(() => {
    const saved = localStorage.getItem('depotsStage');
    return saved ? JSON.parse(saved) : [];
  });

  const formFields = [
    { 
      label: "Titre du Sujet", 
      name: "titreSujet", 
      type: "input", 
      rules: [{ required: true, message: "Ce champ est obligatoire" }],
      placeholder: "Ex: Développement d'une application web"
    },
    { 
      label: "Nom de l'Entreprise", 
      name: "nomEntreprise", 
      type: "input", 
      rules: [{ required: true, message: "Ce champ est obligatoire" }],
      placeholder: "Ex: Google France"
    },
    { 
      label: "Période du stage", 
      name: "periode", 
      type: "rangeDate", 
      rules: [{ required: true, message: "Sélectionnez la période" }] 
    },
    { 
      label: "Année du stage", 
      name: "anneeStage", 
      type: "select",
      options: [
        { label: "2023-2024", value: "2023-2024" },
        { label: "2024-2025", value: "2024-2025" }
      ],
      rules: [{ required: true, message: "Sélectionnez l'année" }],
    },
    { 
      label: "Niveau", 
      name: "niveau", 
      type: "select", 
      options: [
        { label: "Première Année", value: "premiereannee" },
        { label: "Deuxième Année", value: "deuxiemeannee" },
      ],
      rules: [{ required: true, message: "Sélectionnez votre niveau" }],
    },
    { 
      label: "Nature du sujet", 
      name: "natureSujet", 
      type: "select",
      options: [
        { label: "Développement", value: "developpement" },
        { label: "Recherche", value: "recherche" },
        { label: "Analyse de données", value: "analyse" }
      ],
      rules: [{ required: true, message: "Ce champ est obligatoire" }],
    },
    { 
      label: "Description", 
      name: "description", 
      type: "textarea", 
      rules: [{ required: true, message: "Décrivez votre stage" }],
      placeholder: "Décrivez en détail les missions effectuées..."
    },
    { 
      label: "Rapport de stage (PDF)", 
      name: "rapport", 
      type: "upload", 
      rules: [{ required: true, message: "Téléversez votre rapport" }],
      accept: ".pdf",
      icon: <FilePdfOutlined />
    },
    { 
      label: "Attestation de stage (PDF)", 
      name: "attestation", 
      type: "upload", 
      rules: [{ required: true, message: "Téléversez votre attestation" }],
      accept: ".pdf",
      icon: <FilePdfOutlined />
    },
    { 
      label: "Fiche d'évaluation (PDF)", 
      name: "ficheEvaluation", 
      type: "upload", 
      rules: [{ required: true, message: "Téléversez la fiche d'évaluation" }],
      accept: ".pdf",
      icon: <FilePdfOutlined />
    },
  ];

  useEffect(() => {
    localStorage.setItem('depotsStage', JSON.stringify(depots));
  }, [depots]);
  

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();
      const [dateDebut, dateFin] = values.periode;

      // Ajout des champs texte
      Object.entries(values).forEach(([key, value]) => {
        if (key !== 'periode' && !Array.isArray(value)) {
          formData.append(key, value);
        }
      });

      // Ajout des dates
      formData.append("dateDebut", dateDebut.format("YYYY-MM-DD"));
      formData.append("dateFin", dateFin.format("YYYY-MM-DD"));

      // Ajout des fichiers
      ['rapport', 'attestation', 'ficheEvaluation'].forEach(field => {
        if (values[field]?.[0]) {
          formData.append(field, values[field][0].originFileObj);
        }
      });

      const response = await postInternship(values.niveau, formData, localStorage.getItem("token"));
         
    // Après soumission réussie :
    const nouveauDepot = {
      titreSujet: values.titreSujet,
      nomEntreprise: values.nomEntreprise,
      niveau: values.niveau === 'premiereannee' ? '1ère année' : '2ème année',
      date: new Date().toLocaleDateString()
    };
    
    setDepots([...depots, nouveauDepot]);

    setSuccessData({
      titreSujet: values.titreSujet,
      nomEntreprise: values.nomEntreprise,
      reference: `STG-${Date.now().toString().slice(-6)}`,
      niveau: values.niveau === 'premiereannee' ? '1ère année' : '2ème année'
    });
    
    message.success("Dépôt effectué avec succès!");
    setIsModalOpen(false);
    message.destroy(); // Supprime les messages précédents
  } catch (error) {
    message.error(error.message || "Échec du dépôt.");
  }
};
  
  return (
    <div className="stage-ete-container">
      {user.role === "etudiant" ? (
        <Card 
          title="Dépôt de stage d'été" 
          bordered={false}
          className="depot-card"
          extra={
            <Button
              type="primary"
              text="Nouveau dépôt"
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

            
            <Col span={24}>
              <Card 
                title={`Vos dépôts récents (${depots.length}/2)`} 
                className="depots-list"
              >
                {depots.length > 0 ? (
                  <div className="depots-container">
                    {depots.map((depot, index) => (
                      <Result
                        key={index}
                        icon={<CheckCircleOutlined className="success-icon" />}
                        title={
                          <>
                            Votre sujet "<strong>{depot.titreSujet}</strong>" pour {' '}
                            <strong>{depot.nomEntreprise}</strong>
                          </>
                        }
                        subTitle={`Niveau: ${depot.niveau} | Déposé le: ${depot.date}`}
                        className="depot-result"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>Vous n'avez pas encore déposé de stage</p>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </Card>
      ) : (
        <Card className="access-denied-card">
          <div className="access-denied-content">
            <h2>Accès restreint</h2>
            <p>Seuls les étudiants peuvent déposer un sujet de stage.</p>
          </div>
        </Card>
      )}

{successData && (
  <SuccessAlert 
    onClose={() => setSuccessData(null)} 
    stageDetails={successData}
  />
)}

      <FormModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        formFields={formFields}
        title={
          <div className="modal-title">
            <FilePdfOutlined /> Nouveau dépôt de stage
          </div>
        }
        onSubmit={handleSubmit}
        width={800}
      />
    </div>
  );
}

export default StageEte;