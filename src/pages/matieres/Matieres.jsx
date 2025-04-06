import React, { useState, useEffect, useContext } from 'react';
import { 
  Button, Input, InputNumber, Table, Space, Modal, Form, message, 
  Spin, Alert, Tag, Select, Popconfirm, Switch 
} from 'antd';
import { 
  PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, MinusCircleOutlined 
} from '@ant-design/icons';
import Navbar from '../../components/navbar/Navbar';
import SidebarLayout from '../../components/sidebar/Sidebar';
import axios from 'axios';
import { UserContext } from '../../App';
import './Matieres.css';

const { Option } = Select;

const Matieres = () => {
  // Context et états
  const { role: userRole } = useContext(UserContext) || {};
  const [form] = Form.useForm();
  const [state, setState] = useState({
    loading: true,
    data: [],
    error: null,
    searchText: '',
    showArchived: false,
    isModalOpen: false,
    selectedMatiere: null,
    competences: []
  });

  // Destructuration de l'état
  const { 
    loading, data, error, searchText, showArchived, 
    isModalOpen, selectedMatiere, competences 
  } = state;

  // Chargement initial des données
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      
      try {
        const [matieresRes, competencesRes] = await Promise.all([
          axios.get('http://localhost:5000/matieres', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/Competences', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);


        setState(prev => ({
          ...prev,
          data: matieresRes.data.map(item => ({
            ...item,
            key: item._id,
            competences: item.competences || []
          })),
          competences: competencesRes.data,
          loading: false
        }));


      } catch (err) {
        setState(prev => ({ ...prev, error: err.message, loading: false }));
      }
    };

    fetchData();
  }, []);

  const handleUpdateAvancement = async (matiereId, chapitreIndex, sectionIndex, nouveauStatut) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.patch(
      `http://localhost:5000/matieres/${matiereId}/avancement`,
      {
        chapitreIndex,
        sectionIndex, 
        nouveauStatut: nouveauStatut
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

  setState(prev => ({
      ...prev,
      data: prev.data.map(matiere => {
        if (matiere._id === matiereId) {
          const updatedCurriculum = [...matiere.Curriculum];
          updatedCurriculum[chapitreIndex].sections[sectionIndex].AvancementSection = nouveauStatut;
          
          if (nouveauStatut === 'Terminee') {
            updatedCurriculum[chapitreIndex].sections[sectionIndex].dateFinSection = new Date();
          } else {
            updatedCurriculum[chapitreIndex].sections[sectionIndex].dateFinSection = null;
          }

          return {
            ...matiere,
            Curriculum: updatedCurriculum
          };
        }
        return matiere;
      })
    }));

    message.success({
  content: 'Statut mis à jour avec succès & Notification Envoyée',
  duration: 4.5,
});
  } catch (err) {
    message.error(err.response?.data?.message || 'Erreur de mise à jour');
  }
};
const handleEditCurriculum = (record) => {
  setState(prev => ({ 
    ...prev, 
    selectedMatiere: record, 
    isModalOpen: true 
  }));
  form.setFieldsValue({
     ...record,
    Curriculum: record.Curriculum || []
  });
};

  // Configuration des colonnes du tableau
  const columns = [
    {
      title: 'Code',
      dataIndex: 'CodeMatiere',
      key: 'CodeMatiere',

    },
    {
      title: 'Nom',
      dataIndex: 'Nom',
      key: 'Nom',
    },
    {

      title: 'Statut',
      key: 'status',
      render: (_, record) => (
        <Space>
          <Tag color={record.publiee ? 'green' : 'volcano'}>


            {record.publiee ? 'Publiée' : 'Masquée'}

          </Tag>
          <Tag color={record.archived ? 'red' : 'blue'}>
            {record.archived ? 'Archivée' : 'Active'}
          </Tag>
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button onClick={() => showDetails(record)}>Consulter</Button>

          {userRole === 'enseignant' && (
        <Button onClick={() => handleEditCurriculum(record)}>
          Modifier Curriculum
        </Button>
      )}

          {userRole === 'admin' && (
            <>
              <Button onClick={() => handleEdit(record)}>Modifier</Button>
              <Popconfirm
                title="Confirmer la suppression ?"
                onConfirm={() => handleDelete(record)}
                okText="Oui"
                cancelText="Non"
              >
                <Button danger>Supprimer</Button>
              </Popconfirm>
              <Button
                icon={record.publiee ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                onClick={() => togglePublish(record)}
              >


                {record.publiee ? 'Masquer' : 'Publier'}

              </Button>
            </>
          )}
        </Space>
      )
    }
  ];

  // Affichage des détails
  const showDetails = (record) => {
    const getStatusColor = (status) => ({
      Terminee: 'green',
      EnCours: 'blue',
    }[status] || 'gray');

    const renderCurriculum = () => {
      if (!record.Curriculum?.length) return <p>Aucun curriculum défini</p>;
      
      return record.Curriculum.map((chapitre, index) => (
        <div key={index} className="curriculum-chapitre">
          <h4>Chapitre {index + 1}: {chapitre.titreChapitre}</h4>
          <div className="chapitre-details">
            <p>Statut: <Tag color={getStatusColor(chapitre.AvancementChap)}>
              {chapitre.AvancementChap}
            </Tag></p>
            
            <h5>Sections:</h5>
            <div className="sections-list">
              {chapitre.sections?.map((section, sIndex) => (
                <div key={sIndex} className="section-item">
                  <p><strong>Section {sIndex + 1}: {section.nomSection}</strong></p>
                  <p>Description: {section.Description}</p>
                  <p>Statut: <Tag color={getStatusColor(section.AvancementSection)}>
                    {section.AvancementSection}
                  </Tag></p>
                  {section.dateFinSection && (
                    <p>Date fin: {new Date(section.dateFinSection).toLocaleDateString()}</p>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>
      ));
    };

    Modal.info({
      title: `Détails de ${record.Nom}`,
      width: 800,
      content: (
        <div className="matiere-details">
          <h2>{record.Nom} ({record.CodeMatiere})</h2>
          <div className="infos-grid">
            <div><strong>Crédits:</strong> {record.Credit}</div>
            <div><strong>Volume Horaire:</strong> {record.VolumeHoraire}h</div>
            <div><strong>Niveau:</strong> {record.Niveau}</div>
            <div><strong>Semestre:</strong> {record.Semestre}</div>
          </div>

          <h3>Compétences associées</h3>
          <ul>
            {record.competences.map((c, i) => (
              <li key={i}>{c.nomCompetence}  :  {c.codeCompetence}</li>
            ))}
          </ul>

          <h3>Curriculum</h3>
          <div className="curriculum-container">
            {renderCurriculum()}
          </div>
        </div>

      )
    });
  };

  // Gestion des modifications
  const handleEdit = (record) => {
    setState(prev => ({ ...prev, selectedMatiere: record, isModalOpen: true }));
    form.setFieldsValue({
      ...record,
      competences: record.competences?.map(c => c._id),
      Curriculum: record.Curriculum || [],
      publiee: record.publiee || false
    });
  };

  // Suppression
  const handleDelete = async (record) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/matieres/${record._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setState(prev => ({
        ...prev,
        data: prev.data.filter(item => item._id !== record._id)
      }));
      message.success('Matière supprimée avec succès');
    } catch (err) {
      message.error(err.response?.data?.message || 'Erreur de suppression');
    }
  };

  // Publication/Dépublication
  const togglePublish = async (record) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/matieres/${record._id}`,
        { publiee: !record.publiee },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setState(prev => ({
        ...prev,
        data: prev.data.map(item => 
          item._id === record._id ? { ...item, publiee: !item.publiee } : item
        )
      }));
    } catch (err) {
      message.error(err.response?.data?.message || 'Erreur de publication');
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (values) => {

    let payload;
    try {
        if (userRole === 'enseignant') {
      // Pour les enseignants, ne mettre à jour que le curriculum
      payload = {
        Curriculum: values.Curriculum?.map(chapitre => ({
          ...chapitre,
          sections: chapitre.sections?.map(section => ({
            ...section,
            dateFinSection: section.AvancementSection === 'Terminee' 
              ? new Date().toISOString() 
              : null
          })) || []
        })) || []
      };
    }else {
      // Pour les admins, logique normale avec tous les champs
      payload = {

        ...values,
        CoeffGroupeModule: Number(values.CoeffGroupeModule),
        Coefficient: Number(values.Coefficient),
        VolumeHoraire: Number(values.VolumeHoraire),
        NbHeuresCours: Number(values.NbHeuresCours),
        NbHeuresTD: Number(values.NbHeuresTD),
        NbHeuresTP: Number(values.NbHeuresTP),
        Annee: Number(values.Annee),
        Credit: Number(values.Credit),
        publiee: values.publiee,
        competences: values.competences,
        Curriculum: values.Curriculum?.map(chapitre => ({
          ...chapitre,
          sections: chapitre.sections?.map(section => ({
            ...section,
            dateFinSection: section.AvancementSection === 'Terminee' 
              ? new Date().toISOString() 
              : null
          })) || []
        })) || []
      };

    }

      const token = localStorage.getItem('token');
      const method = selectedMatiere ? 'patch' : 'post';
      const url = selectedMatiere 
        ? `http://localhost:5000/matieres/${selectedMatiere._id}`
        : 'http://localhost:5000/matieres';

      const { data: responseData } = await axios[method](url, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

        const [matieresRes, competencesRes] = await Promise.all([
          axios.get('http://localhost:5000/matieres', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/Competences', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
     setState(prev => ({
          ...prev,
          data: matieresRes.data.map(item => ({
            ...item,
            key: item._id,
            competences: item.competences || []
          })),
          competences: competencesRes.data,
          loading: false,
          isModalOpen: false
        }));



      message.success(`Matière ${selectedMatiere ? 'modifiée' : 'créée'} avec succès`);
    } catch (err) {
      message.error(err.response?.data?.message || 'Erreur de validation');
    }
  };

const handleStatusChange = async (newStatus, chapitreIndex, sectionIndex, matiereId) => {
  try {
    // Optimistic UI update
    const updatedData = data.map(matiere => {
      if (matiere._id === matiereId) {
        const updatedCurriculum = [...matiere.Curriculum];
        updatedCurriculum[chapitreIndex].sections[sectionIndex] = {
          ...updatedCurriculum[chapitreIndex].sections[sectionIndex],
          AvancementSection: newStatus,
          dateFinSection: newStatus === 'Terminee' ? new Date().toISOString() : null
        };
        
        return { ...matiere, Curriculum: updatedCurriculum };
      }
      return matiere;
    });

    setState(prev => ({ ...prev, data: updatedData }));

    // API call
    const token = localStorage.getItem('token');
    await axios.patch(
      `http://localhost:5000/matieres/${matiereId}/avancement`,
      {
        chapitreIndex,
        sectionIndex,
        nouveauStatut: newStatus
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    message.success('Statut mis à jour avec succès');
  } catch (err) {
    // Revert on error
    setState(prev => ({ ...prev }));
    message.error(err.response?.data?.message || 'Erreur de mise à jour');
  }
};
  // Rendu du formulaire
  const renderFormFields = () => (
   //  const isEnseignant = userRole === 'enseignant';

    <>
        <>

      {/* Section Informations de base */}
      <div className="form-section">
        <Form.Item
          name="CodeMatiere"
          label="Code matière"
          rules={[{ required: true, message: 'Champ obligatoire' }]}

          <Input placeholder="Ex: MTH101" disabled={userRole === 'enseignant'}  />

        </Form.Item>

        <Form.Item
          name="Nom"
          label="Nom de la matière"
          rules={[{ required: true, message: 'Champ obligatoire' }]}
        >

          <Input placeholder="Ex: Mathématiques appliquées"  disabled={userRole === 'enseignant'}  />

        </Form.Item>

        <Form.Item
          name="GroupeModule"
          label="Groupe de module"
          rules={[{ required: true, message: 'Champ obligatoire' }]}
        >

          <Input placeholder="Ex: GM1"  disabled={userRole === 'enseignant'}  />

        </Form.Item>
      </div>

      {/* Section Coefficients */}
      <div className="form-section">
        <Form.Item
          name="CoeffGroupeModule"
          label="Coefficient groupe module"
          rules={[{ 
            required: true, 
            type: 'number',
            min: 0,
            message: 'Doit être un nombre positif'
          }]}
        >

          <InputNumber min={0} style={{ width: '100%' }}  disabled={userRole === 'enseignant'}  />

        </Form.Item>

        <Form.Item
          name="Coefficient"
          label="Coefficient matière"
          rules={[{ 
            required: true, 
            type: 'number',
            min: 0,
            message: 'Doit être un nombre positif'
          }]}

          <InputNumber min={0} style={{ width: '100%' }}  disabled={userRole === 'enseignant'} />

        </Form.Item>
      </div>

      {/* Section Volume horaire */}
      <div className="form-section">
        <Form.Item
          name="VolumeHoraire"
          label="Volume horaire total"
          rules={[{ 
            required: true, 
            type: 'number',
            min: 0,
            message: 'Doit être un nombre positif'
          }]}
        >

          <InputNumber min={0} style={{ width: '100%' }}  disabled={userRole === 'enseignant'} />

        </Form.Item>

        <Form.Item
          name="NbHeuresCours"
          label="Heures de cours"
          rules={[{ required: true, type: 'number', min: 0 }]}
        >
          <InputNumber min={0} style={{ width: '100%' }}  disabled={userRole === 'enseignant'}  />

        </Form.Item>

        <Form.Item
          name="NbHeuresTD"
          label="Heures de TD"
          rules={[{ required: true, type: 'number', min: 0 }]}
        >

          <InputNumber min={0} style={{ width: '100%' }}  disabled={userRole === 'enseignant'}  />

        </Form.Item>

        <Form.Item
          name="NbHeuresTP"
          label="Heures de TP"
          rules={[{ required: true, type: 'number', min: 0 }]}
        >

          <InputNumber min={0} style={{ width: '100%' }}  disabled={userRole === 'enseignant'} />

        </Form.Item>
      </div>

      {/* Section Organisation */}
      <div className="form-section">
        <Form.Item
          name="Niveau"
          label="Niveau"
          rules={[{ required: true, message: 'Sélection obligatoire' }]}
        >

          <Select disabled={userRole === 'enseignant'} >

            <Option value="1ING">1ère année</Option>
            <Option value="2ING">2ème année</Option>
            <Option value="3ING">3ème année</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="Semestre"
          label="Semestre"
          rules={[{ required: true, message: 'Sélectionnez un semestre' }]}
        >

          <Select  disabled={userRole === 'enseignant'} >

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
          rules={[{ 
            required: true, 
            type: 'number',
            min: 2000,
            max: 2100,
            message: 'Année entre 2000 et 2100'
          }]}
        >

          <InputNumber style={{ width: '100%' }}  disabled={userRole === 'enseignant'} />

        </Form.Item>

        <Form.Item
          name="Credit"
          label="Crédits"
          rules={[{ required: true, type: 'number', min: 0 }]}
        >

          <InputNumber min={0} style={{ width: '100%' }} disabled={userRole === 'enseignant'}  />

        </Form.Item>
      </div>

      {/* Section Compétences */}
      <div className="form-section">
        <Form.Item
          name="competences"
          label="Compétences associées"
          rules={[{ required: true, message: 'Sélection obligatoire' }]}
        >

          <Select  disabled={userRole === 'enseignant'} 

            mode="multiple"
            showSearch
            optionFilterProp="children"
            placeholder="Sélectionnez les compétences"
          >
            {competences.map(c => (
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

          <Switch  disabled={userRole === 'enseignant'} 
            checkedChildren="Publiée"
            unCheckedChildren="Brouillon"
          />
        </Form.Item>
      </div>
  </>
     
      {/* Section Curriculum */}
      <Form.Item  disabled={userRole === 'enseignant'} 
        label="Curriculum"
        required
        rules={[{ required:false, message: 'Le curriculum est obligatoire' }]}

      >
        <Form.List name="Curriculum">
    {(chapitres, { add: addChapitre, remove: removeChapitre }) => (
      <div>
        {chapitres.map(({ key: chapitreKey, name: chapitreName, ...restChapitreField }) => (
          <div key={chapitreKey} style={{ marginBottom: 24, border: '1px solid #d9d9d9', padding: 16, borderRadius: 4 }}>
            <Form.Item
              {...restChapitreField}
              name={[chapitreName, 'titreChapitre']}
              label="Titre du chapitre"
              rules={[{ required: true, message: 'Titre obligatoire' }]}
            >
              <Input placeholder="Introduction à..." />

            </Form.Item>

            <Form.Item
              {...restChapitreField}
              name={[chapitreName, 'AvancementChap']}
              label="Statut du chapitre"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="NonCommencee">Non commencé</Select.Option>
                <Select.Option value="EnCours">En cours</Select.Option>
                <Select.Option value="Terminee">Terminé</Select.Option>
              </Select>
            </Form.Item>


            <Form.List name={[chapitreName, 'sections']}>
              {(sections, { add: addSection, remove: removeSection }) => (
                <>
                  {sections.map(({ key: sectionKey, name: sectionName, ...restSectionField }) => (
                    <div key={sectionKey} style={{ marginLeft: 16, marginBottom: 16, padding: 8, backgroundColor: '#fafafa' }}>
                      <Form.Item
                        {...restSectionField}
                        name={[sectionName, 'nomSection']}
                        label="Nom de la section"
                        rules={[{ required: true }]}
                      >
                        <Input />
                      </Form.Item>

                      <Form.Item
                        {...restSectionField}
                        name={[sectionName, 'Description']}
                        label="Description"
                        rules={[{ required: true }]}
                      >
                        <Input.TextArea />
                      </Form.Item>

                      <Form.Item
                        {...restSectionField}
                        name={[sectionName, 'AvancementSection']}
                        label="Statut"
                        rules={[{ required: true }]}
                      >

                        <Select  onChange={(value) => {
      handleStatusChange(
        value, 
        chapitreName, // index du chapitre
        sectionName,  // index de la section
        selectedMatiere._id
      );
    }}>

                          <Select.Option value="NonCommencee">Non commencé</Select.Option>
                          <Select.Option value="EnCours">En cours</Select.Option>
                          <Select.Option value="Terminee">Terminé</Select.Option>
                        </Select>
                      </Form.Item>

                      <MinusCircleOutlined
                        onClick={() => removeSection(sectionName)}
                        style={{ color: 'red', marginLeft: 8 }}
                      />
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => addSection()}
                    icon={<PlusOutlined />}
                    style={{ width: '60%', marginLeft: 16 }}
                  >
                    Ajouter une section
                  </Button>
                </>
              )}
            </Form.List>

            <MinusCircleOutlined
              onClick={() => removeChapitre(chapitreName)}
              style={{ color: 'red', marginTop: 8 }}
            />
          </div>
        ))}
        <Button
          type="dashed"
          onClick={() => addChapitre()}
          icon={<PlusOutlined />}
          style={{ width: '100%' }}
        >
          Ajouter un chapitre
        </Button>
      </div>
    )}
  </Form.List>
        
      </Form.Item>
    </>

);


  return (
    <div className="matieres-page">
      <Navbar />
      <SidebarLayout />
      
      <div className="content-container">
        <div className="header-section">
          <Input.Search
            placeholder="Rechercher par nom"
            onChange={e => setState(prev => ({ ...prev, searchText: e.target.value }))}
            style={{ width: 300 }}
          />
          
          {userRole === 'admin' && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setState(prev => ({
                ...prev,
                selectedMatiere: null,
                isModalOpen: true
              }))}
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
            dataSource={data.filter(item => 
              item.Nom.toLowerCase().includes(searchText.toLowerCase()) &&
              (showArchived || !item.archived)
            )}
            bordered
            pagination={{ pageSize: 8 }}
            rowClassName={record => record.archived ? 'archived-row' : ''}
          />
        )}

        <Modal
          title={selectedMatiere ? "Modifier la matière" : "Nouvelle matière"}
          open={isModalOpen}
          onCancel={() => setState(prev => ({ ...prev, isModalOpen: false }))}
          footer={null}
          width={800}
          destroyOnClose
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            {renderFormFields()}
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                {selectedMatiere ? 'Mettre à jour' : 'Créer la matière'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};


export default Matieres;    

