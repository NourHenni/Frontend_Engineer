import React, { useState, useEffect } from 'react';
import { Button, Input, Table, Space, Modal, Form, Tag, message, Select, Spin, Alert, Dropdown } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UndoOutlined, InboxOutlined, DownOutlined } from '@ant-design/icons';
import Navbar from '../../components/navbar/Navbar';
import SidebarLayout from '../../components/sidebar/Sidebar';
import axios from 'axios';
import './Competences.css';
import { useContext } from 'react';
import { UserContext } from '../../App';
function Competences() {
   const user = useContext(UserContext); // Récupérer le contexte
   const userRole = user?.role;
const CODE_HINTS = {
  outilsEtTechniquesScientifiques: "Codes valides : CS1, CS2",
  compTechnologiques: "Codes valides : CS3 à CS8",
  autoDevlopEtInnovation: "Code valide : CS9",
  Communication: "Codes valides : CS10, CS11"
};
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompetence, setSelectedCompetence] = useState(null);
  const [competences,setCompetences]=useState({ nomCompetence: "" });
const [selectedCompetenceName, setSelectedCompetenceName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
    
    const token = localStorage.getItem("token");     
      if (!token) {
        setError('Veuillez vous connecter');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/Competences', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const apiData = response.data.model || response.data;
        
        if (!Array.isArray(apiData)) {
          throw new Error('Format de données invalide');
        }

         setData(response.data.map(item => ({
        ...item,
        key: item._id,
        
        matieres: item.matieres.map(m => ({
          _id: m._id,
          Nom: m.Nom || 'Nom inconnu'
        }))
      })));
       /* setData(apiData.map(item => ({
          ...item,
          key:item._id,
          matieres: item.matieres || [],
        })));*/// Ajouter pour debug
console.log('Données reçues:', response.data);

      } catch (err) {
        console.error('Erreur:', err);
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    {
      title: 'Nom',
      dataIndex: 'nomCompetence',
      key: 'nomCompetence',
    },
    {
      title: 'Code',
      dataIndex: 'codeCompetence',
      key: 'codeCompetence',
      render: (text) => text?.toUpperCase() || 'N/A',
    },
    {
      title: 'Description',
      dataIndex: 'descriptionCompetence',
      key: 'descriptionCompetence',
    },
    {
      title: 'Matières',
      dataIndex: 'matieres',
      key: 'matieres',
      
      render: (matieres) => ( console.log("Données matières :", matieres),
        
        <Dropdown
          menu={{
            items: (matieres || []).map((matiere) => ({
              key:matiere._id,
              label:matiere.Nom,
            }))
          }}
        >
          
          <Button type="link">
            <Space>
    {(matieres || []).length} matière{(matieres||[]).length >1?'s':''}
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
      )
    },
    {
      title: 'Statut',
      dataIndex: 'archived',
      render: (archived) => (
        <Tag color={archived ? 'red' : 'green'}>
          {archived ? 'Archivée' : 'Active'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Space>
          {userRole === 'admin' && (
          <>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record)} />
          <Button 
            icon={record.archived ? <UndoOutlined /> : <InboxOutlined />}
            onClick={() => handleArchive(record)}
          >
            {record.archived ? 'Désarchiver' : 'Archiver'}
          </Button>
          </>
        )}
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}/> 
          
        </Space>
      )
    }
  ];

  const handleSearch = (e) => setSearchText(e.target.value);

  const filteredData = data.filter(item =>
    item.nomCompetence?.toLowerCase().includes(searchText.toLowerCase()) &&
    (showArchived ? item.archived : !item.archived)
  );

 const handleAdd = () => {
  setIsModalOpen(true);
  setSelectedCompetence(null);
  form.resetFields();
};

  const handleArchive = async (record) => {
    try {
       if (userRole !== 'admin') {
    message.error('Action non autorisée');
    return;
  }
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:5000/Competences/${record._id}`,
        { archived: !record.archived },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );

       setData(prevData => 
      prevData.map(item => 
        item._id === record._id ? { ...item, archived: !item.archived } : item
      )
    );
      message.success(`Compétence ${!record.archived ? 'archivée' : 'désarchivée'} !`);
    } catch (err) {
      message.error('Erreur lors de la mise à jour');
    }
  };

  const handleEdit = (record) => {
    setSelectedCompetence(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (competence) => {
  try {
    const token = localStorage.getItem('token');
 if (userRole !== 'admin') {
    message.error('Action non autorisée');
    return;
  }
    // Vérifier si la compétence est utilisée dans des matières
    if (competence.matieres?.length > 0) {
      Modal.confirm({
        title: 'Attention - Matiéres détectées',
        content: (
          <div>
            <p>Cette compétence est utilisée dans {competence.matieres.length} matière(s) :</p>
            <ul>
              {competence.matieres.map((matiere, index) => (
                <li key={index}>{matiere.Nom}</li>
              ))}
            </ul>
            <p style={{ color: '#ff4d4f', marginTop: '10px' }}>
              Êtes-vous sûr de vouloir continuer la suppression ?
            </p>
          </div>
        ),
        okText: 'Supprimer définitivement',
        cancelText: 'Annuler',
        okType: 'danger',
        async onOk() {
          try {
            await axios.delete(
              `http://localhost:5000/Competences/${competence._id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                }
              }
            );

            // Recharger les données
            const response = await axios.get('http://localhost:5000/Competences', {
              headers: {
                Authorization: `Bearer ${token}`,
              }
            });
            
            setData(response.data.model || response.data);
            message.success('Suppression  réussie !');

          } catch (err) {
            message.error(`Échec : ${err.response?.data?.message || 'Erreur serveur'}`);
          }
        },
        onCancel() {
          message.info('Suppression annulée ');
        }
      });
      return;
    }

    // Si pas de matiéres, confirmation normale
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Êtes-vous sûr de vouloir supprimer cette compétence ?',
      okText: 'Supprimer',
      cancelText: 'Annuler',
      okType: 'danger',
      async onOk() {
        try {
          setData(prev => prev.filter(item => item._id?.$oid !== competence._id?.$oid));
          
          await axios.delete(
            `http://localhost:5000/Competences/${competence._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // Rafraîchissement garantie
          const { data: freshData } = await axios.get('http://localhost:5000/Competences', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setData(freshData.model || freshData);
        } catch (err) {
          message.error('Échec de la suppression');
        }
      },
      onCancel() {
        message.info('Suppression annulée');
      }
    });

  } catch (err) {
    console.error('Erreur système:', err);
    message.error('Erreur technique lors de la suppression');
  }
};
  const handleView = (record) => {
    Modal.info({
      title: 'Détails de la compétence',
      content: (
        <div>
          <p><strong>Nom :</strong> {record.nomCompetence}</p>
          <p><strong>Code :</strong> {record.codeCompetence}</p>
          <p><strong>Description :</strong> {record.descriptionCompetence}</p>
          <p><strong>Matières associées :</strong> 
          {(record.matieres || [])
            .map(matiere => matiere.Nom) // Extraction des noms
            .join(', ') || 'Aucune'}
        </p>
          <p><strong>Statut :</strong> {record.archived ? 'Archivée' : 'Active'}</p>
        </div>
      ),
      width: 600,
    });
  };
const refreshCompetences = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/Competences', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    setState(prev => ({
      ...prev,
      competences: response.data.map(c => ({
        ...c,
        matieres: c.matieres || []
      }))
    }));
  } catch (err) {
    console.error('Erreur rafraîchissement compétences:', err);
  }
};

const handleSubmit = async (values) => {
  const token = localStorage.getItem('token');
  try {
    if (userRole !== 'admin') {
      message.error('Action non autorisée');
      return;
    }

    let response;
    if (selectedCompetence) {
      // Modification existante
      response = await axios.patch(
        `http://localhost:5000/Competences/${selectedCompetence._id}`,
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } else {
      // Nouvelle compétence
      response = await axios.post(
        'http://localhost:5000/Competences',
        {
          ...values,
          matieres: [],
          archived: false
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Mise à jour de l'état
    if (selectedCompetence) {
      setData(prev => 
        prev.map(item => 
          item._id === selectedCompetence._id ? response.data : item
        )
      );
    } else {
      setData(prev => [...prev, response.data]);
    }
    const { data: freshData } = await axios.get('http://localhost:5000/Competences', {
      headers: { Authorization: `Bearer ${token}` }
    });

    setData(freshData.map(item => ({
      ...item,
      key: item._id,
      matieres: item.matieres.map(m => ({
        _id: m._id,
        Nom: m.Nom || 'Nom inconnu'
      }))
    })));
await refreshCompetences();
    message.success(selectedCompetence ? 'Modification réussie !' : 'Ajout réussi !');
    setIsModalOpen(false);
    form.resetFields();

  } catch (err) {
    console.error('Erreur:', err);
    message.error(err.response?.data?.message || 'Erreur de sauvegarde');
  }
};
  const locale = {
    emptyText: error ? (
      <Alert message="Erreur" description={error} type="error" showIcon />
    ) : (
      <span>Aucune donnée disponible</span>
    )
  };
  
const codeCompetenceValidator = (_, value) => {
  const nomCompetence = form.getFieldValue('nomCompetence');
  
  // Autoriser la validation si on est en mode édition et que le nom n'a pas changé
  if (selectedCompetence && nomCompetence === selectedCompetence.nomCompetence) {
    return Promise.resolve();
  }

  
  const validCodes = {
    outilsEtTechniquesScientifiques: ['CS1', 'CS2'],
    compTechnologiques: ['CS3', 'CS4', 'CS5', 'CS6', 'CS7', 'CS8'],
    autoDevlopEtInnovation: ['CS9'],
    Communication: ['CS10', 'CS11']
  }[nomCompetence] || [];

  if (!validCodes.includes(value?.toUpperCase())) {
    return Promise.reject(new Error(`Code invalide pour ${nomCompetence}`));
  }
  return Promise.resolve();
};

  return (
    <div className="competences-page">
      <Navbar />
      <SidebarLayout />
      
      <div className="content-container">
        <div className="header-section">
          <Input
            placeholder="Rechercher une compétence..."
            prefix={<SearchOutlined />}
            onChange={handleSearch}
            style={{ width: 300 }}
          />
       
          <Button
            type={showArchived ? "dashed" : "primary"}
            onClick={() => userRole === 'admin' && setShowArchived(!showArchived)}
            icon={() => userRole === 'admin' && showArchived ? <UndoOutlined /> : <InboxOutlined />}
            disabled={userRole !== 'admin'}
             style={{ 
      cursor: userRole === 'admin' ? 'pointer' : 'not-allowed',
      opacity: userRole !== 'admin' ? 0.7 : 1
    }}
          >
            
            {showArchived ? "Afficher actives" : "Afficher archives"}
          </Button>
          {userRole === 'admin' && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Ajouter
          </Button>
    )}
        </div>

        <Spin spinning={loading} tip="Chargement..." className="spin-wrapper">
          <Table
            columns={columns}
            dataSource={filteredData}
            locale={locale}
            rowClassName={(record) => record.archived ? 'ant-table-row-archived' : ''}
            bordered
            pagination={{ pageSize: 5 }}
            rowKey="key"
          />
        </Spin>

        <Modal
          title={selectedCompetence ? "Modifier compétence" : "Nouvelle compétence"}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={() => userRole === 'admin' && form.submit()}
          okButtonProps={{ disabled: userRole !== 'admin' }}
          width={600}
        >
          
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item 
             name="nomCompetence"
  label="Nom de la compétence"
  rules={[{
    required: true,
    message: 'Ce champ est obligatoire',
    validator: (_, value) => {
      const validNames = [
        "outilsEtTechniquesScientifiques",
        "compTechnologiques",
        "autoDevlopEtInnovation",
        "Communication"
        
      ];
      return validNames.includes(value) 
        ? Promise.resolve() 
        : Promise.reject('Nom de compétence invalide');
    }
  }]}
>
  <Select placeholder="Sélectionnez "   onChange={(value) => {
      setSelectedCompetenceName(value);
      form.setFieldsValue({ codeCompetence: '' }); // Réinitialiser le code
    }}>
    <Select.Option value="outilsEtTechniquesScientifiques">
      Outils et Techniques Scientifiques
    </Select.Option>
    <Select.Option value="compTechnologiques">
      Compétences Technologiques
    </Select.Option>
    <Select.Option value="autoDevlopEtInnovation">
      Auto-développement et Innovation
    </Select.Option>
    <Select.Option value="Communication">
      Communication
    </Select.Option>
  </Select>
            </Form.Item>
            
            <Form.Item
  name="codeCompetence"
  label="Code"
  rules={[
    { required: true, message: 'Ce champ est obligatoire' },
    ({ getFieldValue }) => ({
      validator(_, value) {
        const code = getFieldValue('codeCompetence')?.trim().toUpperCase();
        const exists = data.some(c => 
          c.codeCompetence.toUpperCase() === code && 
          c._id !== selectedCompetence?._id
        );
        if (exists) return Promise.reject('Ce code existe déjà !');
        return Promise.resolve();
      },
    }),
    
    { validator: codeCompetenceValidator }
  ]}
  extra={form.getFieldValue('nomCompetence') && (
    <div style={{ 
      fontSize: 12,
      color: '#666',
      marginTop: 4,
      fontStyle: 'italic'
    }}>
      {CODE_HINTS[form.getFieldValue('nomCompetence')]}
    </div>
  )}
>
  <Input 
    style={{ textTransform: 'uppercase' }}
    onInput={(e) => {
      e.target.value = e.target.value.toUpperCase();
    }}
    
  />
</Form.Item>
{selectedCompetenceName && (
    <Alert
      message={
        <div>
          Codes autorisés pour {form.getFieldValue('nomCompetence')} :{' '}
          {CODE_HINTS[selectedCompetenceName]}
        </div>
      }
      type="info"
      showIcon
      style={{ 
        marginBottom: 16,
        backgroundColor: '#e6f7ff',
        borderColor: '#91d5ff'
      }}
    />
  )}

            <Form.Item
              name="descriptionCompetence"
              label="Description"
              rules={[{ required: true, message: 'Ce champ est obligatoire' }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          </Form>
          
        </Modal>
        
      </div>
      
    </div>
  );
}

export default Competences;


