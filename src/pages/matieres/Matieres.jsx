
import React, { useState, useEffect, useContext } from 'react';
import { 
  Button, Input, InputNumber, Table, Space, Modal, Form, message, 
  Spin, Alert, Tag, Select, Popconfirm, Switch, 
  notification
} from 'antd';
import { 
  PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, MinusCircleOutlined, 
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';
import Navbar from '../../components/navbar/Navbar';
import SidebarLayout from '../../components/sidebar/Sidebar';
import axios from 'axios';
import { UserContext } from '../../App';
import './Matieres.css';
import { fetchMatiereById } from '../../services/matieresServices';




const { Option } = Select;

const Matieres = () => {
  // Context et états
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedMatiereForDetails, setSelectedMatiereForDetails] = useState(null);
  const [enseignants, setEnseignants] = useState([]);
  const [loadingEnseignants, setLoadingEnseignants] = useState(false);
  
  
  const { role: userRole } = useContext(UserContext) || {};
  const { userId: userId } = useContext(UserContext) || {};
  const [form] = Form.useForm();
  const getEvaluationLabel = (note) => {
    const labels = {
      0: 'Très insatisfait',
      1: 'Insatisfait',
      2: 'Satisfait',
      3: 'Très satisfait',
      4: 'Excellent'
    };
    return labels[note] || note;
  };
 
  const [liveCounts, setLiveCounts] = useState({});
  const [state, setState] = useState({
    loading: true,
    data: [],
    error: null,
    searchText: "",
    showArchived: false,
    isModalOpen: false,
    selectedMatiere: null,
    competences: [],
    pollingIntervals: {},
  });
  const [proposalVisible, setProposalVisible] = useState(false);
  const [selectedMatiereProposal, setSelectedMatiereProposal] = useState(null);
  const [proposalForm] = Form.useForm();
  const [validationVisible, setValidationVisible] = useState(false);
  const [pendingProposals, setPendingProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [newProposals, setNewProposals] = useState({});

  // Destructuration de l'état
  const {
    loading,
    data,
    error,
    searchText,
    showArchived,
    isModalOpen,
    selectedMatiere,
    competences,
  } = state;
  useEffect(() => {
    const initialCounts = {};
    data.forEach(matiere => {
      initialCounts[matiere._id] = matiere.evaluations?.length || 0;
    });
    setLiveCounts(initialCounts);
  }, [data]);
  const [evaluationsModalVisible, setEvaluationsModalVisible] = useState(false);
  const [currentMatiereEvaluations, setCurrentMatiereEvaluations] = useState(null);
  const [pollingIntervals, setPollingIntervals] = useState({});
  const [evaluationModalVisible, setEvaluationModalVisible] = useState(false);
  const [selectedMatiereForEvaluation, setSelectedMatiereForEvaluation] = useState(null);
  const [evaluationForm] = Form.useForm();
  const fetchData = async () => {
    const token = localStorage.getItem("token");
    try {
      const [matieresRes, competencesRes] = await Promise.all([
        axios.get("http://localhost:5000/matieres", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/Competences", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setState((prev) => ({
        ...prev,
        data: matieresRes.data.map((item) => ({
          ...item,
          key: item._id,
          competences: item.competences || [],
        })),
        competences: competencesRes.data,
        loading: false,
      }));
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message, loading: false }));
    }
  };
  // Chargement initial des données

 useEffect(() => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Récupération des enseignants
// Composant React
const fetchEnseignants = async () => {
  try {
    setLoadingEnseignants(true);
    const token = localStorage.getItem("token");
    
    const response = await axios.get("http://localhost:5000/teachers", {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    // Vérification approfondie
    if (response.status === 200 && response.data?.model) {
      if (Array.isArray(response.data.model)) {
        setEnseignants(response.data.model);
      } else {
        throw new Error("Le format des données est invalide");
      }
    } else {
      throw new Error("Réponse serveur inattendue");
    }

  } catch (error) {
    console.error("Détails techniques :", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    message.error("Erreur de format de données");
    setEnseignants([]);
  } finally {
    setLoadingEnseignants(false);
  }
};
  // Récupération des données principales
  const fetchData = async () => {
    try {
      const [matieresRes, competencesRes] = await Promise.all([
        axios.get("http://localhost:5000/matieres", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://localhost:5000/Competences", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      let filteredMatieres = matieresRes.data;

      // Filtrage pour les enseignants
      if (user?.role === "enseignant") {
        filteredMatieres = matieresRes.data.filter(matiere => {
          const enseignantId = matiere.enseignant?._id?.toString() 
            || matiere.enseignant?.toString();
          return enseignantId === user._id && matiere.publiee;
        });
      }

      // Filtrage pour les étudiants
      if (user?.role === "etudiant") {
        filteredMatieres = matieresRes.data.filter(matiere => {
          return (
            matiere.publiee &&
            matiere.semestre?.toString() === user.semestre?.toString() &&
            matiere.niveau?.toString() === user.niveau?.toString()
          );
        });
      }

      setState(prev => ({
        ...prev,
        data: filteredMatieres.map(item => ({
          ...item,
          key: item._id,
          competences: item.competences || [],
        })),
        competences: competencesRes.data,
        loading: false,
      }));

    } catch (err) {
      console.error("Erreur global fetch:", err);
      setState(prev => ({ 
        ...prev, 
        error: err.response?.data?.message || "Erreur serveur",
        loading: false 
      }));
      message.error("Échec du chargement des données");
    }
  };

  const fetchAllData = async () => {
    await fetchEnseignants();
    await fetchData();
  };
 fetchData();
  fetchAllData();
}, []); // Ajouter les dépendances nécessaires si l'utilisateur peut changer
  
  const handleProposeModification = (record) => {
    setSelectedMatiereProposal(record);
    proposalForm.setFieldsValue(record);
    setProposalVisible(true);
    // Démarrer le polling pour cette matière
    if (userRole === 'enseignant') {
      const intervalId = setInterval(() => {
        checkForUpdates(record._id);
      }, 5000);
    
  
      





  
      return () => clearInterval(intervalId); // Nettoyage
    }
  };
  const handleValidateProposal = async () => {
    if (!selectedProposal) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/matieres/${selectedProposal.matiereId}/validate`,
        { propositionId: selectedProposal._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // 1. Rafraîchir les données principales
      await fetchData();
      // 2. Recharger les propositions pour cette matière
      const updatedProposals = await fetchProposals(selectedProposal.matiereId);
      setPendingProposals(updatedProposals);
      message.success("Modification validée et données rafraîchies !");
      setSelectedProposal(null);
    } catch (err) {
      message.error(err.response?.data?.error || "Erreur de validation");
    }
  };
const fetchProposals = async (matiereId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `http://localhost:5000/matieres/${matiereId}`, 
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { populate: "historiquePropositions.enseignant" }
      }
    );
    const proposals = response.data.historiquePropositions
      .filter(p => !p.valide)
      .map(p => ({
        ...p,
        matiereId,
        enseignant: p.enseignant ? {
          nom: p.enseignant.nom,
          prenom: p.enseignant.prenom,
          email: p.enseignant.email
        } : null,
        dateFormatted: new Date(p.dateProposition).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }));
    setPendingProposals(proposals);
  } catch (err) {
    console.error("Erreur:", err);
    message.error("Erreur de chargement des propositions");
  }
};

const handleEvaluationSubmit = async (values) => {
  try {
    
    const token = localStorage.getItem("token");
    await axios.post(
      `http://localhost:5000/matieres/${selectedMatiereForEvaluation._id}/evaluation`,
      {
        VolumeHoraire: Number(values.VolumeHoraire),
        MethodesPedagogiques: Number(values.MethodesPedagogiques),
        Objectifs: Number(values.Objectifs),
        CoheranceContenu: Number(values.CoheranceContenu),
        Satisfaction: Number(values.Satisfaction),
        PertinenceMatiere: Number(values.PertinenceMatiere),
        Remarques: values.Remarques || "",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    message.success("Évaluation enregistrée avec succès !");
    setEvaluationModalVisible(false);
    evaluationForm.resetFields();
    fetchData(); // Rafraîchir les données
    setLiveCounts(prev => ({
      ...prev,
      [selectedMatiereForEvaluation._id]: (prev[selectedMatiereForEvaluation._id] || 0) + 1
    }));
  } catch (err) {
    message.error(err.response?.data?.message || "Erreur lors de l'évaluation");
  }
};
const loadEvaluations = async (matiereId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `http://localhost:5000/matieres/${matiereId}/evaluation`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setCurrentMatiereEvaluations(response.data);
    setEvaluationsModalVisible(true);
  } catch (err) {
    message.error(err.response?.data?.message || "Erreur de chargement des évaluations");
  }
};

const handleCurriculumSubmit = async (values) => {
  try {
    const token = localStorage.getItem("token");
    await axios.patch(
      `http://localhost:5000/matieres/${state.selectedMatiere._id}/curriculum`,
      { Curriculum: values.Curriculum },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    message.success("Curriculum mis à jour avec succès");
    setState(prev => ({ ...prev, isModalOpen: false }));
    fetchData();
  } catch (error) {
    message.error("Erreur lors de la mise à jour du curriculum");
  }
};
const handleEditCurriculum = (record) => {
  setState((prev) => ({
    ...prev,
    selectedMatiere: record,
    isModalOpen: true,
  }));
  form.setFieldsValue({
    ...record,
    Curriculum: record.Curriculum || N,
  });
};
  // Configuration des colonnes du tableau
  const columns = [
    {
      title: "Code",
      dataIndex: "CodeMatiere",
      key: "CodeMatiere",
    },
    {
      title: "Nom",
      dataIndex: "Nom",
      key: "Nom",
    },
    {
      title: "Statut",
      key: "status",
      render: (_, record) => (
        <Space>
          <Tag color={record.publiee ? "green" : "volcano"}>
            {record.publiee ? "Publiée" : "Masquée"}
          </Tag>
          <Tag color={record.archived ? "red" : "blue"}>
            {record.archived ? "Archivée" : "Active"}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        
        <Space>
          <Button onClick={() => showDetails(record)}>Consulter</Button>
         
          {userRole === "etudiant" && (
      <Space>
        {!record.etudiantsDejaEvalue?.includes(userId) && (
          <Button 
            type="primary" 
            onClick={() => {
             resetEvaluationForm(); 
              setSelectedMatiereForEvaluation(record);
              setEvaluationModalVisible(true);
            }}
          >
            Évaluer cette matière
          </Button>
        )}
      </Space>
    )}
 {(userRole === "admin" || 
        (userRole === "enseignant" && record.enseignant?._id === userId)) && (
          <Button
            onClick={() => loadEvaluations(record._id)}
            disabled={!record.evaluations || record.evaluations.length === 0}
          >
            Voir évaluations 
            <span style={{ 
        marginLeft: 8,
        backgroundColor: '#1890ff',
        color: 'white',
        borderRadius: 10,
        padding: '0 6px',
        fontSize: 12
      }}>
        {liveCounts[record._id] || 0}
      </span>
          
          </Button>
        )}

{userRole === "enseignant" && record.enseignant?._id === userId && (
            <Button onClick={() => handleEditCurriculum(record)}>
              Modifier Curriculum
            </Button>
          )}
         {userRole === "enseignant" && 
        
          <Button 
            onClick={() => handleProposeModification(record)}
            style={{ backgroundColor: '#1890ff', color: 'white' }}
          >
            Proposer Modification
          </Button>

         }
        
          {userRole === "admin" && (
            <>
              <Button onClick={() => handleEdit(record)} icon={<EditOutlined/>}></Button>
              <Popconfirm
                title="Confirmer la suppression ?"
                onConfirm={() => handleDelete(record)}
                okText="Oui"
                cancelText="Non"
              >
                <Button icon={<DeleteOutlined/>}></Button>
              </Popconfirm>
              <Button
                icon={
                  record.publiee ? (
                    <CloseCircleOutlined />
                  ) : (
                    <CheckCircleOutlined />
                  )
                }
                onClick={() => togglePublish(record)}
              >
                {record.publiee ? "Masquer" : "Publier"}
              </Button>
            </>
          )}
       {userRole === "admin" && (
        <Button 
        onClick={() => {
          fetchProposals(record._id);
          setValidationVisible(true);
          // Reset le compteur quand on clique
          setNewProposals(prev => ({...prev, [record._id]: false}));
        }}
        style={{ 
          backgroundColor: '#52c41a', 
          color: 'white',
          position: 'relative'
        }}
      >
        Voir Propositions
        {record.historiquePropositions?.filter(p => !p.valide).length > 0 && (
          <span className={`proposal-badge ${newProposals[record._id] ? 'new-proposal' : ''}`}>
            {record.historiquePropositions.filter(p => !p.valide).length}
          </span>
        )}
      </Button>
      )}
        </Space>
      ),
    },
  ];


const showDetails = async (record) => {
  try {
    const data = await fetchMatiereById(record._id);
    setSelectedMatiereForDetails(data);
    setIsDetailsModalOpen(true);

    const getStatusColor = (status) =>
      ({
        Terminee: "green",
        EnCours: "blue",
      }[status] || "gray");

    const renderCurriculum = () => {
      if (!data.Curriculum?.length) return <p>Aucun curriculum défini</p>;

      return data.Curriculum.map((chapitre, index) => (
        <div key={index} className="curriculum-chapitre">
          <h4>
            Chapitre {index + 1}: {chapitre.titreChapitre}
          </h4>
          <div className="chapitre-details">
            <p>
              Statut:{" "}
              <Tag color={getStatusColor(chapitre.AvancementChap)}>
                {chapitre.AvancementChap}
              </Tag>
            </p>

            <h5>Sections:</h5>
            <div className="sections-list">
              {chapitre.sections?.map((section, sIndex) => (
                <div key={sIndex} className="section-item">
                  <p>
                    <strong>
                      Section {sIndex + 1}: {section.nomSection}
                    </strong>
                  </p>
                  <p>Description: {section.Description}</p>
                  <p>
                    Statut:{" "}
                    <Tag color={getStatusColor(section.AvancementSection)}>
                      {section.AvancementSection}
                    </Tag>
                  </p>
                  {section.dateFinSection && (
                    <p>
                      Date fin:{" "}
                      {new Date(section.dateFinSection).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ));
    };

    const historyColumns = [
      {
        title: "Date",
        dataIndex: "dateModification",
        key: "date",
        render: (date) => new Date(date).toLocaleString(),
        sorter: (a, b) => new Date(a.date) - new Date(b.date),
      },
   {
  title: "Modifications",
  key: "modifications",
  render: (_, entry) => {
    const ancienne = entry.ancienneValeur || {};
    const nouvelle = entry.nouvelleValeur || {};

    // Filtrer les champs modifiés, en excluant 'Curriculum'
    const champsModifies = Object.keys({ ...ancienne, ...nouvelle }).filter(
      (key) =>
        key !== "Curriculum" &&
        JSON.stringify(ancienne[key]) !== JSON.stringify(nouvelle[key])
    );

    if (champsModifies.length === 0) return <span>Aucune modification</span>;

    return (
      <ul className="changes-list">
        {champsModifies.map((key) => (
          <li key={key}>
            <strong>{key}:</strong>{" "}
            <span style={{ color: "red", textDecoration: "line-through", marginRight: "8px" }}>
              {JSON.stringify(ancienne[key])}
            </span>
            →
            <span style={{ color: "green", marginLeft: "8px" }}>
              {JSON.stringify(nouvelle[key])}
            </span>
          </li>
        ))}
      </ul>
    );
  }
}



    ]

    Modal.info({
      title: `Détails de ${data.Nom}`,
      width: 1000,
      content: (
        <div className="matiere-details">
          <h2>
            {data.Nom} ({data.CodeMatiere})
          </h2>


          <div className="infos-grid">
            <div>
              <strong>Crédits:</strong> {data.Credit}
            </div>
            <div>
              <strong>Volume Horaire:</strong> {data.VolumeHoraire}h
            </div>
            <div>
              <strong>Niveau:</strong> {data.niveau}
            </div>
            <div>
              <strong>Semestre:</strong> {data.semestre}
            </div>
            <div>
              <strong>Coefficient:</strong> {data.Coefficient}
            </div>
            <div>
              <strong>Heures de cours:</strong> {data.NbHeuresCours}
            </div>
            <div>
              <strong>Heures de TD:</strong> {data.NbHeuresTD}
            </div>
            <div>
              <strong>Heures de TP:</strong> {data.NbHeuresTP}
            </div>
            <div>
              <strong>Enseignant:</strong>{" "}
              {data.enseignant?.nom || data.enseignant}
            </div>
            <div>
              <strong>Année:</strong> {data.Annee}


            </div>
          </div>

          <h3>Compétences associées</h3>
          <ul>
            {data.competences?.length > 0 ? (
              data.competences.map((c, i) => (
                <li key={i}>
                  {c.nomCompetence} : {c.codeCompetence}
                </li>
              ))
            ) : (
              <li>Aucune compétence associée</li>
            )}
          </ul>

          <h3>Curriculum</h3>
          <div className="curriculum-container">{renderCurriculum()}</div>

          {(userRole === "admin" || userRole === "enseignant") && (
            <>
              <h3 style={{ marginTop: 24 }}>Historique des modifications</h3>
              <Table
                columns={historyColumns}
                dataSource={data.historiqueModifications || []}
                rowKey="_id"
                pagination={{ pageSize: 5 }}
                scroll={{ y: 240 }}
                bordered
                locale={{
                  emptyText: "Aucune modification enregistrée",
                }}
              />
            </>
          )}
        </div>
      ),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des détails:", error);
  }
};



const checkForUpdates = async (matiereId) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`http://localhost:5000/matieres/${matiereId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    setState(prev => ({
      ...prev,
      data: prev.data.map(m => 
        m._id === matiereId ? response.data : m
      )
    }));
  } catch (err) {
    console.error("Erreur de rafraîchissement:", err);
  }
};

  // Gestion des modifications
  const handleEdit = (record) => {
    setState((prev) => ({
      ...prev,
      selectedMatiere: record,
      isModalOpen: true,
    }));
    form.setFieldsValue({
      ...record,
      competences: record.competences?.map((c) => c._id),
      Curriculum: record.Curriculum || [],
      publiee: record.publiee || false,
    });
  };

  // Suppression
  const handleDelete = async (record) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/matieres/${record._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setState((prev) => ({
        ...prev,
        data: prev.data.filter((item) => item._id !== record._id),
      }));
      message.success("Matière supprimée avec succès");
    } catch (err) {
      message.error(err.response?.data?.message || "Erreur de suppression");
    }
  };
  const resetEvaluationForm = () => {
    evaluationForm.resetFields();
    setSelectedMatiereForEvaluation(null);
  };
  // Publication/Dépublication
  const togglePublish = async (record) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/matieres/${record._id}`,
        { publiee: !record.publiee },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setState((prev) => ({
        ...prev,
        data: prev.data.map((item) =>
          item._id === record._id ? { ...item, publiee: !item.publiee } : item
        ),
      }));
    } catch (err) {
      message.error(err.response?.data?.message || "Erreur de publication");
    }
  };

  // Soumission du formulaire
  
  const handleSubmit = async (values) => {
    let payload;
    try {
      if (userRole === "enseignant") {
        // Pour les enseignants, ne mettre à jour que le curriculum
        payload = {
          Curriculum:
            values.Curriculum?.map((chapitre) => ({
              ...chapitre,
              sections:
                chapitre.sections?.map((section) => ({
                  ...section,
                  dateFinSection:
                    section.AvancementSection === "Terminee"
                      ? new Date().toISOString()
                      : null,
                })) || [],
            })) || [],
        };
      } else {
        // Pour les admins, logique normale avec tous les champs
        payload = {
          ...values,
          CoeffGroupeModule: Number(values.CoeffGroupeModule),
          Coefficient: Number(values.Coefficient),
          VolumeHoraire: Number(values.VolumeHoraire),
          NbHeuresCours: Number(values.NbHeuresCours),
          NbHeuresTD: Number(values.NbHeuresTD),
          NbHeuresTP: Number(values.NbHeuresTP),
          enseignant:values.enseignant,
          Annee: Number(values.Annee),
          Credit: Number(values.Credit),
          publiee: values.publiee,
          competences: values.competences,
          Curriculum:
            values.Curriculum?.map((chapitre) => ({
              ...chapitre,
              sections:
                chapitre.sections?.map((section) => ({
                  ...section,
                  dateFinSection:
                    section.AvancementSection === "Terminee"
                      ? new Date().toISOString()
                      : null,
                })) || [],
            })) || [],
        };
      }

      const token = localStorage.getItem("token");
      const method = selectedMatiere ? "patch" : "post";
      const url = selectedMatiere
        ? `http://localhost:5000/matieres/${selectedMatiere._id}`
        : "http://localhost:5000/matieres";

      const { data: responseData } = await axios[method](url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const [matieresRes, competencesRes] = await Promise.all([
        axios.get("http://localhost:5000/matieres", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/Competences", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setState((prev) => ({
        ...prev,
        data: matieresRes.data.map((item) => ({
          ...item,
          key: item._id,
          competences: item.competences || [],
        })),
        competences: competencesRes.data,
        loading: false,
        isModalOpen: false,
      }));

      message.success(
        `Matière ${selectedMatiere ? "modifiée" : "créée"} avec succès`
      );
    } catch (err) {
      message.error(err.response?.data?.message || "Erreur de validation");
    }
  };
  const handleStatusChange = async (
    newStatus,
    chapitreIndex,
    sectionIndex,
    matiereId
  ) => {
    try {
      // Optimistic UI update
      const updatedData = data.map((matiere) => {
        if (matiere._id === matiereId) {
          const updatedCurriculum = [...matiere.Curriculum];
          updatedCurriculum[chapitreIndex].sections[sectionIndex] = {
            ...updatedCurriculum[chapitreIndex].sections[sectionIndex],
            AvancementSection: newStatus,
            dateFinSection:
              newStatus === "Terminee" ? new Date().toISOString() : null,
          };

          return { ...matiere, Curriculum: updatedCurriculum };
        }
        return matiere;
      });

      setState((prev) => ({ ...prev, data: updatedData }));

      // API call
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/matieres/${matiereId}/avancement`,
        {
          chapitreIndex,
          sectionIndex,
          nouveauStatut: newStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      message.success("Statut mis à jour avec succès");
    } catch (err) {
      // Revert on error
      setState((prev) => ({ ...prev }));
      message.error(err.response?.data?.message || "Erreur de mise à jour");
    }
  };

  
  // Fonction helper pour mettre à jour le statut du chapitre
  const updateChapitreStatus = (chapitre) => {
    const sections = chapitre.sections || [];
    
    if (sections.every(s => s.AvancementSection === 'Terminee')) {
      chapitre.AvancementChap = 'Terminee';
      chapitre.dateFinChap = new Date();
    } else if (sections.some(s => s.AvancementSection === 'EnCours')) {
      chapitre.AvancementChap = 'EnCours';
      chapitre.dateFinChap = null;
    } else {
      chapitre.AvancementChap = 'NonCommencee';
      chapitre.dateFinChap = null;
    }
  };
  
  const renderCurriculumForm = () => (
    <Form.List name="Curriculum">
      {(chapitres, { add: addChapitre, remove: removeChapitre }) => (
        <div style={{ marginBottom: 16 }}>
          {chapitres.map(({ key, name: chapitreIndex }) => (
            <div key={key} style={{ marginBottom: 24, border: '1px solid #d9d9d9', padding: 16 }}>
              <Space align="baseline">
                <Form.Item
                  name={[chapitreIndex, 'titreChapitre']}
                  label="Titre du chapitre"
                  rules={[{ required: true, message: 'Requis' }]}
                >
                  <Input placeholder="Nom du chapitre" />
                </Form.Item>
                
                {/* Ajout du statut du chapitre */}
                <Form.Item
                  name={[chapitreIndex, 'AvancementChap']}
                  label="Statut du chapitre"
                >
                  <Select >
                    <Select.Option value="NonCommencee">Non commencé</Select.Option>
                    <Select.Option value="EnCours">En cours</Select.Option>
                    <Select.Option value="Terminee">Terminé</Select.Option>
                  </Select>
                </Form.Item>
                
                <MinusCircleOutlined onClick={() => removeChapitre(chapitreIndex)} />
              </Space>
              <Form.Item
                            name={[chapitreIndex, 'Description']}
                            label="Description"
                          >
                            <Input.TextArea rows={2} />
                          </Form.Item>
              <Form.List name={[chapitreIndex, 'sections']}>
                {(sections, { add: addSection, remove: removeSection }) => {
                  // Fonction pour mettre à jour le statut du chapitre
                  const updateChapitreStatus = (sections) => {
                    const formValues = form.getFieldsValue();
                    const currentSections = formValues.Curriculum[chapitreIndex].sections || [];
                    
                    let newStatus = 'NonCommencee';
                    if (currentSections.some(s => s.AvancementSection === 'EnCours')) {
                      newStatus = 'EnCours';
                    } else if (currentSections.every(s => s.AvancementSection === 'Terminee')) {
                      newStatus = 'Terminee';
                    }
                    
                    // Mise à jour du statut du chapitre
                    form.setFieldsValue({
                      Curriculum: formValues.Curriculum.map((chap, idx) => 
                        idx === chapitreIndex ? { ...chap, AvancementChap: newStatus } : chap
                      )
                    });
                  };
  
                  return (
                    <>
                      {sections.map(({ key: sKey, name: sectionIndex }) => (
                        <div key={sKey} style={{ marginBottom: 16 }}>
                          <Space align="baseline">
                            <Form.Item
                              name={[sectionIndex, 'nomSection']}
                              label="Nom de la section"
                              rules={[{ required: true, message: 'Requis' }]}
                            >
                              <Input placeholder="Nom de la section" />
                            </Form.Item>
                            <MinusCircleOutlined onClick={() => removeSection(sectionIndex)} />
                          </Space>
  
                          <Form.Item
                            name={[sectionIndex, 'Description']}
                            label="Description"
                          >
                            <Input.TextArea rows={2} />
                          </Form.Item>
  
                          <Form.Item
                            name={[sectionIndex, 'AvancementSection']}
                            label="Statut"
                            rules={[{ required: true }]}
                          >
                            <Select
                              onChange={() => {
                                // Après changement d'une section, mettre à jour le statut du chapitre
                                setTimeout(() => {
                                  const formValues = form.getFieldsValue();
                                  const currentSections = formValues.Curriculum[chapitreIndex].sections || [];
                                  updateChapitreStatus(currentSections);
                                }, 0);
                              }}
                            >
                              <Select.Option value="NonCommencee">Non commencé</Select.Option>
                              <Select.Option value="EnCours">En cours</Select.Option>
                              <Select.Option value="Terminee">Terminé</Select.Option>
                            </Select>
                          </Form.Item>
                        </div>
                      ))}
                      <Button 
                        type="dashed" 
                        onClick={() => {
                          addSection({ 
                            nomSection: '',
                            Description: '',
                            AvancementSection: 'NonCommencee'
                          });
                          // Mettre à jour le statut du chapitre après ajout
                          setTimeout(() => {
                            const formValues = form.getFieldsValue();
                            const currentSections = formValues.Curriculum[chapitreIndex].sections || [];
                            updateChapitreStatus(currentSections);
                          }, 0);
                        }} 
                        block
                      >
                        Ajouter une section
                      </Button>
                    </>
                  );
                }}
              </Form.List>
            </div>
          ))}
          <Button 
            type="dashed" 
            onClick={() => addChapitre({ 
              titreChapitre: '', 
              sections: [],
              AvancementChap: 'NonCommencee'
            })} 
            block
          >
            Ajouter un chapitre
          </Button>
        </div>
      )}
    </Form.List>
  );


        {/* Section Organisation */}
        <div className="form-section">
          <Form.Item
            name="niveau"
            label="niveau"
            rules={[{ required: true, message: "Sélection obligatoire" }]}
          >
            <Select disabled={userRole === "enseignant"}>
              <Option value="1">1ère année</Option>
              <Option value="2">2ème année</Option>
              <Option value="3">3ème année</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="semestre"
            label="semestre"
            rules={[{ required: true, message: "Sélectionnez un semestre" }]}
          >
            <Select disabled={userRole === "enseignant"}>
              <Option value="S1">S1</Option>
              <Option value="S2">S2</Option>
              
            </Select>
          </Form.Item>
        <Form.Item
  name="enseignant"
  label="Enseignant"
  rules={[{ required: true, message: "Sélection obligatoire" }]}
>
  <Select
    loading={loadingEnseignants}
    placeholder={loadingEnseignants ? "Chargement..." : "Sélectionnez un enseignant"}
  >
    {/* Vérification du type avant map */}
    {Array.isArray(enseignants) && enseignants.map(ens => (
      <Select.Option key={ens._id} value={ens._id}>
        {ens.nom} {ens.prenom}
      </Select.Option>
    ))}
    
    {/* Fallback si tableau vide */}
    {enseignants.length === 0 && !loadingEnseignants && (
      <Select.Option disabled value="none">
        Aucun enseignant trouvé
      </Select.Option>
    )}
  </Select>
</Form.Item>

          <Form.Item
            name="Annee"
            label="Année universitaire"
            rules={[
              {
                required: true,
                type: "number",
                min: 2000,
                max: 2100,
                message: "Année entre 2000 et 2100",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              disabled={userRole === "enseignant"}
            />
          </Form.Item>

          <Form.Item
            name="Credit"
            label="Crédits"
            rules={[{ required: true, type: "number", min: 0 }]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              disabled={userRole === "enseignant"}
            />
          </Form.Item>
        </div>


  // Rendu du formulaire
  const renderFormFields = () => {
    const { isCurriculumEdit } = state;
    const isEnseignant = userRole === 'enseignant';
  
    return (
      <>
        {!isCurriculumEdit ? (
          // Formulaire standard pour admin
          <>
            {/* Section Informations de base */}
            <div className="form-section">
              <Form.Item
                name="CodeMatiere"
                label="Code matière"
                rules={[{ required: true, message: "Champ obligatoire" }]}
              >
                <Input 
                  placeholder="Ex: MTH101" 
                  disabled={isEnseignant} 
                />
              </Form.Item>
  
              <Form.Item
                name="Nom"
                label="Nom de la matière"
                rules={[{ required: true, message: "Champ obligatoire" }]}
              >
                <Input
                  placeholder="Ex: Mathématiques appliquées"
                  disabled={isEnseignant}
                />
              </Form.Item>
  
              <Form.Item
                name="GroupeModule"
                label="Groupe de module"
                rules={[{ required: true, message: "Champ obligatoire" }]}
              >
                <Input 
                  placeholder="Ex: GM1" 
                  disabled={isEnseignant} 
                />
              </Form.Item>
            </div>
  
            {/* Section Coefficients */}
            <div className="form-section">
              <Form.Item
                name="CoeffGroupeModule"
                label="Coefficient groupe module"
                rules={[
                  {
                    required: true,
                    type: "number",
                    min: 0,
                    message: "Doit être positif"
                  }
                ]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  disabled={isEnseignant} 
                />
              </Form.Item>
  
              <Form.Item
                name="Coefficient"
                label="Coefficient matière"
                rules={[
                  {
                    required: true,
                    type: "number",
                    min: 0,
                    message: "Doit être positif"
                  }
                ]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  disabled={isEnseignant} 
                />
              </Form.Item>
            </div>
  
            {/* Section Volume horaire */}
            <div className="form-section">
              <Form.Item
                name="VolumeHoraire"
                label="Volume horaire total"
                rules={[
                  {
                    required: true,
                    type: "number",
                    min: 0,
                    message: "Doit être positif"
                  }
                ]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  disabled={isEnseignant} 
                />
              </Form.Item>
  
              <Form.Item
                name="NbHeuresCours"
                label="Heures de cours"
                rules={[{ required: true, type: "number", min: 0 }]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  disabled={isEnseignant} 
                />
              </Form.Item>
  
              <Form.Item
                name="NbHeuresTD"
                label="Heures de TD"
                rules={[{ required: true, type: "number", min: 0 }]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  disabled={isEnseignant} 
                />
              </Form.Item>
  
              <Form.Item
                name="NbHeuresTP"
                label="Heures de TP"
                rules={[{ required: true, type: "number", min: 0 }]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  disabled={isEnseignant} 
                />
              </Form.Item>
            </div>
  
            {/* Section Organisation */}
            <div className="form-section">
              <Form.Item
                name="Niveau"
                label="Niveau"
                rules={[{ required: true, message: "Sélection requise" }]}
              >
                <Select disabled={isEnseignant}>
                  <Option value="1ING">1ère année</Option>
                  <Option value="2ING">2ème année</Option>
                  <Option value="3ING">3ème année</Option>
                </Select>
              </Form.Item>
  
              <Form.Item
                name="Semestre"
                label="Semestre"
                rules={[{ required: true, message: "Sélection requise" }]}
              >
                <Select disabled={isEnseignant}>
                  <Option value="S1">S1</Option>
                  <Option value="S2">S2</Option>
                  <Option value="S3">S3</Option>
                  <Option value="S4">S4</Option>
                  <Option value="S5">S5</Option>
                </Select>
              </Form.Item>
  
              <Form.Item
                name="Annee"
                label="Année universitaire"
                rules={[
                  {
                    required: true,
                    type: "number",
                    min: 2000,
                    max: 2100,
                    message: "Entre 2000 et 2100"
                  }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  disabled={isEnseignant} 
                />
              </Form.Item>
  
              <Form.Item
                name="Credit"
                label="Crédits"
                rules={[{ required: true, type: "number", min: 0 }]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  disabled={isEnseignant} 
                />
              </Form.Item>
            </div>
  
            {/* Section Compétences */}
            <div className="form-section">
              <Form.Item
                name="competences"
                label="Compétences associées"
                rules={[{ required: true, message: "Sélection requise" }]}
              >
                <Select
                  mode="multiple"
                  disabled={isEnseignant}
                  showSearch
                  optionFilterProp="children"
                  placeholder="Sélectionnez les compétences"
                >
                  {competences.map((c) => (
                    <Option key={c._id} value={c._id}>
                      {c.nomCompetence} ({c.codeCompetence})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
  
              <Form.Item 
                name="publiee" 
                label="Publication" 
                valuePropName="checked"
              >
                <Switch
                  disabled={isEnseignant}
                  checkedChildren="Publiée"
                  unCheckedChildren="Masquée"
                />
              </Form.Item>
            </div>
          </>
        ) : (
          // Mode édition du curriculum pour enseignant
          
          <Form.Item
        disabled={userRole === "admin"}
        label="Curriculum"
        
        rules={[{ required: true, message: "Le curriculum est obligatoire" }]}
      >
     
        <Form.List name="Curriculum">
          {(chapitres, { add: addChapitre, remove: removeChapitre }) => (
            <div>
              {chapitres.map(
                ({
                  key: chapitreKey,
                  name: chapitreName,
                  ...restChapitreField
                }) => (
                  <div
                    key={chapitreKey}
                    style={{
                      marginBottom: 24,
                      border: "1px solid #d9d9d9",
                      padding: 16,
                      borderRadius: 4,
                    }}
                  >
                    <Form.Item
                      {...restChapitreField}
                      name={[chapitreName, "titreChapitre"]}
                      label="Titre du chapitre"
                      rules={[{ required: true, message: "Titre obligatoire" }]}
                    >
                      <Input placeholder="Introduction à..." />
                    </Form.Item>

                    <Form.Item
                      {...restChapitreField}
                      name={[chapitreName, "AvancementChap"]}
                      label="Statut du chapitre"
                      rules={[{ required: true }]}
                    >
                      <Select>
                        <Select.Option value="NonCommencee">
                          Non commencé
                        </Select.Option>
                        <Select.Option value="EnCours">En cours</Select.Option>
                        <Select.Option value="Terminee">Terminé</Select.Option>
                      </Select>
                    </Form.Item>

                    <Form.List name={[chapitreName, "sections"]}>
                      {(
                        sections,
                        { add: addSection, remove: removeSection }
                      ) => (
                        <>
                          {sections.map(
                            ({
                              key: sectionKey,
                              name: sectionName,
                              ...restSectionField
                            }) => (
                              <div
                                key={sectionKey}
                                style={{
                                  marginLeft: 16,
                                  marginBottom: 16,
                                  padding: 8,
                                  backgroundColor: "#fafafa",
                                }}
                              >
                                <Form.Item
                                  {...restSectionField}
                                  name={[sectionName, "nomSection"]}
                                  label="Nom de la section"
                                  rules={[{ required: true }]}
                                >
                                  <Input />
                                </Form.Item>

                                <Form.Item
                                  {...restSectionField}
                                  name={[sectionName, "Description"]}
                                  label="Description"
                                  rules={[{ required: true }]}
                                >
                                  <Input.TextArea />
                                </Form.Item>

                                <Form.Item
                                  {...restSectionField}
                                  name={[sectionName, "AvancementSection"]}
                                  label="Statut"
                                  rules={[{ required: true }]}
                                >
                                  <Select
                                    onChange={(value) => {
                                      handleStatusChange(
                                        value,
                                        chapitreName, // index du chapitre
                                        sectionName, // index de la section
                                        selectedMatiere._id
                                      );
                                    }}
                                  >
                                    <Select.Option value="NonCommencee">
                                      Non commencé
                                    </Select.Option>
                                    <Select.Option value="EnCours">
                                      En cours
                                    </Select.Option>
                                    <Select.Option value="Terminee">
                                      Terminé
                                    </Select.Option>
                                  </Select>
                                </Form.Item>

                                <MinusCircleOutlined
                                  onClick={() => removeSection(sectionName)}
                                  style={{ color: "red", marginLeft: 8 }}
                                />
                              </div>
                            )
                          )}
                          <Button
                            type="dashed"
                            onClick={() => addSection()}
                            icon={<PlusOutlined />}
                            style={{ width: "60%", marginLeft: 16 }}
                          >
                            Ajouter une section
                          </Button>
                        </>
                      )}
                    </Form.List>

                    <MinusCircleOutlined
                      onClick={() => removeChapitre(chapitreName)}
                      style={{ color: "red", marginTop: 8 }}
                    />
                  </div>
                )
              )}
              <Button
                type="dashed"
                onClick={() => addChapitre()}
                icon={<PlusOutlined />}
                style={{ width: "100%" }}
              >
                Ajouter un chapitre
              </Button>
            </div>
          )}
        </Form.List>
        {renderCurriculumForm()}

      </Form.Item>
        )}
      </>
    );
  };

  return (
    <div className="matieres-page">
      <Navbar />
      <SidebarLayout />

      <div className="content-container">
        <div className="header-section">
          <Input.Search
            placeholder="Rechercher par nom"
            onChange={(e) =>
              setState((prev) => ({ ...prev, searchText: e.target.value }))
            }
            style={{ width: 300 }}
          />

          {userRole === "admin" && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  selectedMatiere: null,
                  isModalOpen: true,
                }))
              }
            >
              Nouvelle matière
            </Button>
          )}
        </div>

        {error && <Alert message={error} type="error" showIcon />}

        {loading ? (
          <Spin size="large" />
        ) : (
          <Table
            columns={columns}
            dataSource={data.filter(
              (item) =>
                item.Nom.toLowerCase().includes(searchText.toLowerCase()) &&
                (showArchived || !item.archived)
            )}
            bordered
            pagination={{ pageSize: 8 }}
            rowClassName={(record) => (record.archived ? "archived-row" : "")}
          />
        )}

<Modal
          title="Modifier le Curriculum"
          open={state.isModalOpen}
          onCancel={() => setState(prev => ({ ...prev, isModalOpen: false }))}
          footer={null}
          width={800}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCurriculumSubmit}
          >
            {renderCurriculumForm()}
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Enregistrer les modifications
              </Button>
            </Form.Item>
          </Form>
        </Modal>
{userRole === "admin" && 
<Modal
          title={selectedMatiere ? "Modifier la matière" : "Nouvelle matière"}
          open={isModalOpen}
          onCancel={() => setState((prev) => ({ ...prev, isModalOpen: false }))}
          footer={null}
          width={800}
          destroyOnClose
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            {renderFormFields()}
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                {selectedMatiere ? "Mettre à jour" : "Créer la matière"}
              </Button>
            </Form.Item>
          </Form>
</Modal>
}
   <Modal
  title="Proposition de Modification"
  open={proposalVisible}
  onCancel={() => setProposalVisible(false)}
  onOk={() => proposalForm.submit()}
  width={800}
  destroyOnClose
>
  <Form
    form={proposalForm}
    onFinish={async (values) => {
      try {
        const token = localStorage.getItem("token");
        const { raison, ...contenu } = values;
        
        // Nettoyer les champs non autorisés
        delete contenu.nom;
        delete contenu.competences;
        delete contenu.CodeMatiere;

        await axios.patch(
          `http://localhost:5000/matieres/${selectedMatiereProposal._id}/proposition`,
          { contenu, raison },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        message.success("Proposition envoyée avec succès !");
        setProposalVisible(false);
      } catch (err) {
        message.error(err.response?.data?.message || "Erreur lors de la proposition");
      }
    }}
    layout="vertical"
  >
    {/* Section Raison */}
   

    {/* Section Modifications Proposées */}
    <div className="form-section">
      <h3>Modifications proposées</h3>

      <Form.Item name="GroupeModule" label="Groupe de module">
        <Input />
      </Form.Item>

      <Form.Item name="CoeffGroupeModule" label="Coefficient groupe module">
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="Credit" label="Crédits">
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="VolumeHoraire" label="Volume Horaire">
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="NbHeuresCours" label="Heures de Cours">
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="NbHeuresTD" label="Heures de TD">
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="NbHeuresTP" label="Heures de TP">
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>

      
    </div>
    <Form.Item
      name="raison"
      label="Raison de la modification"
      rules={[{ required: true, message: 'Ce champ est obligatoire' }]}
    >
      <Input.TextArea rows={3} />
    </Form.Item>
  </Form>
</Modal>

 <Modal
  title="Validation des Modifications"
  open={validationVisible}
  onCancel={() => setValidationVisible(false)}
  width={1000}
  footer={null}
>
  <List
    dataSource={pendingProposals}
    renderItem={(proposal) => (
      <List.Item
        actions={[
          <Button 
            type="primary" 
            onClick={() => setSelectedProposal(proposal)}
          >
            Examiner
          </Button>
        ]}
      >
        <List.Item.Meta
          title={`Proposition du ${proposal.dateProposition}`}
          description={`Raison : ${proposal.raison}`}
        />
      </List.Item>
    )}
  />

  {/* Modal d'examen détaillé */}
<Modal
  title="Détails de la Proposition"
  open={!!selectedProposal}
  onCancel={() => setSelectedProposal(null)}
  onOk={handleValidateProposal}  
  okText="Valider"
  width={800}
>
  {selectedProposal && (
    <div>
      
  <h3>Modification(s) Proposée(s) Par :</h3>
      <div className="teacher-info">
        
        <h5>
          {selectedProposal.enseignant?.nom} {selectedProposal.enseignant?.prenom}  
          <br/>
          
        </h5>
        <h4>Raison : {selectedProposal.raison}</h4>
      </div>
      <Table
        columns={[
          { title: 'Champ', dataIndex: 'field', key: 'field' },
          { 
            title: 'Ancienne Valeur', 
            dataIndex: 'oldValue',
            render: value => <span style={{ color: 'red' }}>{value}</span>
          },
          { 
            title: 'Nouvelle Valeur', 
            dataIndex: 'newValue',
            render: value => <span style={{ color: 'green' }}>{value}</span>
          }
        ]}
        dataSource={
          Object.entries(selectedProposal.contenu)
            .filter(([key, newValue]) => {
              const originalMatiere = data.find(m => m._id === selectedProposal.matiereId);
              const oldValue = originalMatiere[key];
              
              // Comparaison profonde pour les objets complexes
              if (typeof newValue === 'object' || typeof oldValue === 'object') {
                return JSON.stringify(newValue) !== JSON.stringify(oldValue);
              }
              return newValue !== oldValue;
            })
            .map(([key, newValue]) => {
              const originalMatiere = data.find(m => m._id === selectedProposal.matiereId);
              const oldValue = originalMatiere[key];
              
              return {
                key,
                field: key,
                oldValue: JSON.stringify(oldValue, null, 2),
                newValue: JSON.stringify(newValue, null, 2)
              };
            })
        }
        pagination={false}
      />

      {(selectedProposal.contenu.Curriculum && 
        JSON.stringify(selectedProposal.contenu.Curriculum) !== 
        JSON.stringify(data.find(m => m._id === selectedProposal.matiereId).Curriculum)) && (
        <>
          <h3 style={{ marginTop: 20 }}>Changements dans le Curriculum :</h3>
          <div style={{ maxHeight: 400, overflow: 'auto' }}>
            {(selectedProposal.contenu.Curriculum || []).map((chapitre, idx) => {
              const originalChapitre = data.find(m => m._id === selectedProposal.matiereId)
                .Curriculum[idx];

              return (
                <div key={idx} style={{ marginBottom: 15 }}>
                  <h4>Chapitre {idx + 1}: {chapitre.titreChapitre}</h4>
                  {chapitre.sections?.map((section, sIdx) => {
                    const originalSection = originalChapitre?.sections?.[sIdx];

                    return (
                      <div key={sIdx} style={{ marginLeft: 15 }}>
                        {(!originalSection || 
                          section.nomSection !== originalSection.nomSection ||
                          section.Description !== originalSection.Description) && (
                          <div style={{ borderLeft: '3px solid #1890ff', paddingLeft: 10 }}>
                            <strong>{section.nomSection}</strong>
                            <p>{section.Description}</p>
                            {originalSection && (
                              <div style={{ color: '#666', fontSize: '0.9em' }}>
                                <div>Ancien nom: {originalSection.nomSection}</div>
                                <div>Ancienne description: {originalSection.Description}</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  )}
</Modal>
</Modal>
<Modal
  title={`Évaluation - ${selectedMatiereForEvaluation?.Nom || ''}`}
  open={evaluationModalVisible}
  onCancel={() => {
    setEvaluationModalVisible(false);
    evaluationForm.resetFields();
  }}
  onOk={() => {
    evaluationForm.submit() 
    //setEvaluationModalVisible(false) // Ferme le modal après soumission
  }}
  width={700}
>
  <Form
    form={evaluationForm}
    onFinish={handleEvaluationSubmit}
    layout="vertical"
    initialValues={{
      VolumeHoraire: 2,
      MethodesPedagogiques: 2,
      Objectifs: 2,
      CoheranceContenu: 2,
      Satisfaction: 2,
      PertinenceMatiere: 2,
      Remarques: '',
    }}
  >
    {['VolumeHoraire', 'MethodesPedagogiques', 'Objectifs', 
      'CoheranceContenu', 'Satisfaction', 'PertinenceMatiere'].map((item) => (
        <Form.Item
          key={item}
          name={item}
          label={item.replace(/([A-Z])/g, ' $1')}
          rules={[{ required: true, message: 'Ce champ est obligatoire' }]}
        >
          <Select>
            {[0, 1, 2, 3, 4].map((value) => (
              <Select.Option key={value} value={value}>
                {value} - {[
                  'Très insatisfaisant',
                  'Insatisfaisant',
                  'Moyen',
                  'Satisfaisant',
                  'Très satisfaisant'
                ][value]}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      ))}

    <Form.Item name="Remarques" label="Remarques (optionnel)">
      <Input.TextArea rows={4} />
    </Form.Item>
    
  </Form>
</Modal>



<Modal
  title={`Évaluations - ${currentMatiereEvaluations?.matiere?.Nom || ''}`}
  open={evaluationsModalVisible}
  onCancel={() => setEvaluationsModalVisible(false)}
  width={1000}
  footer={null}
>
  {currentMatiereEvaluations && (
    <>
      <div style={{ marginBottom: 20 }}>
        <h3>Matière: {currentMatiereEvaluations.matiere.Nom}</h3>
        <p>Code: {currentMatiereEvaluations.matiere.CodeMatiere}</p>
        {currentMatiereEvaluations.matiere.Enseignant && (
          <p>Enseignant: {currentMatiereEvaluations.matiere.Enseignant.nom} {currentMatiereEvaluations.matiere.Enseignant.prenom}</p>
        )}
        <p>Nombre d'évaluations: {currentMatiereEvaluations.nombreEvaluations}</p>
      </div>

      <Table
        columns={[
         
          { title: 'Volume Horaire', dataIndex: 'VolumeHoraire', key: 'VolumeHoraire' ,render: (note) => getEvaluationLabel(note) },
          { title: 'Méthodes Pédagogiques', dataIndex: 'MethodesPedagogiques', key: 'MethodesPedagogiques' ,render: (note) => getEvaluationLabel(note) },
          { title: 'Objectifs', dataIndex: 'Objectifs', key: 'Objectifs',render: (note) => getEvaluationLabel(note) },
          { title: 'Cohérence', dataIndex: 'CoheranceContenu', key: 'CoheranceContenu' ,render: (note) => getEvaluationLabel(note) },
          { title: 'Satisfaction', dataIndex: 'Satisfaction', key: 'Satisfaction',render: (note) => getEvaluationLabel(note)  },
          { title: 'Pertinence', dataIndex: 'PertinenceMatiere', key: 'PertinenceMatiere' ,render: (note) => getEvaluationLabel(note) },
          { title: 'Remarques', dataIndex: 'Remarques', key: 'Remarques',
            render: text => text || 'Aucune remarque' 
          },
          { title: 'Date', dataIndex: 'dateEvaluation', key: 'date',
            render: date => new Date(date).toLocaleDateString('fr-FR')
          }
        ]}
        dataSource={currentMatiereEvaluations.evaluations}
        rowKey="dateEvaluation"
      />
    </>
  )}
</Modal>


      </div>
    </div>
  );
};

export default Matieres;