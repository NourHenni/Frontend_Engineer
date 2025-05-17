import React, { useEffect, useState } from "react";
import { 
  Table, 
  Button, 
  message, 
  Popconfirm, 
  Space, 
  Modal, 
  Tag,
  Form, 
  DatePicker, 
  Select,
  Card,
  Row,
  Col,
  Typography 
} from "antd";
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getAllPeriods, updatePeriod, deletePeriod, addPeriod } from "../../services/stageServices";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import "./PeriodManagement.css";

const { Title } = Typography;
const { Option } = Select;

const PeriodManagement = () => {
  const [periods, setPeriods] = useState([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    DateDebutDepot: null, 
    DateFinDepot: null 
  });
  const [addFormData, setAddFormData] = useState({
    DateDebutDepot: null,
    DateFinDepot: null,
    niveau: null
  });

  const fetchPeriods = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await getAllPeriods(token);
      
      if (!response.data || !response.data.periodes) {
        throw new Error("Structure de données invalide");
      }
      
      setPeriods(response.data.periodes.map(p => ({
        ...p,
        key: p._id,
        Date_Debut_depot: new Date(p.Date_Debut_depot),
        Date_Fin_depot: new Date(p.Date_Fin_depot),
        PeriodState: p.PeriodState,
        niveau: p.niveau
      })));
      
    } catch (error) {
      console.error("Erreur fetchPeriods:", error);
      message.error(error.response?.data?.message || error.message);
      setPeriods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const handleAdd = () => {
    setAddModalVisible(true);
  };

  const handleAddSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Token d'authentification manquant");
        return;
      }

      if (!addFormData.DateDebutDepot || !addFormData.DateFinDepot || !addFormData.niveau) {
        message.error("Veuillez remplir tous les champs");
        return;
      }

      const payload = {
        DateDebutDepot: addFormData.DateDebutDepot.format('YYYY-MM-DD'),
        DateFinDepot: addFormData.DateFinDepot.format('YYYY-MM-DD'),
        niveau: addFormData.niveau
      };

      await addPeriod(payload, token);
      message.success("Période ajoutée avec succès !");
      setAddModalVisible(false);
      setAddFormData({
        DateDebutDepot: null,
        DateFinDepot: null,
        niveau: null
      });
      fetchPeriods();
    } catch (err) {
      console.error("Erreur lors de l'ajout:", err);
      message.error(err.response?.data?.message || "Erreur lors de l'ajout de la période");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await deletePeriod(id, token);
      message.success("Période supprimée.");
      fetchPeriods();
    } catch (err) {
      message.error("Erreur lors de la suppression.");
    }
  };

  const handleEdit = (period) => {
    setEditingPeriod(period);
    setFormData({
      DateDebutDepot: dayjs(period.Date_Debut_depot),
      DateFinDepot: dayjs(period.Date_Fin_depot)
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Token d'authentification manquant");
        return;
      }

      if (!formData.DateDebutDepot || !formData.DateFinDepot) {
        message.error("Veuillez sélectionner les deux dates");
        return;
      }

      const payload = {
        DateDebutDepot: formData.DateDebutDepot.format('YYYY-MM-DD'),
        DateFinDepot: formData.DateFinDepot.format('YYYY-MM-DD')
      };

      await updatePeriod(editingPeriod._id, payload, token);
      message.success("Période mise à jour !");
      setModalVisible(false);
      fetchPeriods();
    } catch (err) {
      console.error("Full error details:", err);
      if (err.response) {
        message.error(err.response.data.message || "Erreur lors de la mise à jour");
      } else {
        message.error("Erreur de connexion au serveur");
      }
    }
  };

  const columns = [
    {
      title: 'Nom',
      dataIndex: 'Nom',
      key: 'Nom',
      width: 200,
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: 'Niveau',
      dataIndex: 'niveau',
      key: 'niveau',
      width: 150,
      render: (niveau) => (
        <Tag color={niveau === 'premiereannee' ? 'blue' : 'purple'}>
          {niveau === 'premiereannee' ? 'Première année' : 'Deuxième année'}
        </Tag>
      )
    },
    {
      title: 'Date début',
      dataIndex: 'Date_Debut_depot',
      key: 'Date_Debut_depot',
      width: 150,
      render: (date) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CalendarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {dayjs(date).format('DD/MM/YYYY')}
        </div>
      )
    },
    {
      title: 'Date fin',
      dataIndex: 'Date_Fin_depot', 
      key: 'Date_Fin_depot',
      width: 150,
      render: (date) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CalendarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {dayjs(date).format('DD/MM/YYYY')}
        </div>
      )
    },
    {
      title: 'État',
      dataIndex: 'PeriodState',
      key: 'PeriodState',
      width: 120,
      render: (state) => {
        let color = '';
        let text = '';
        
        switch(state) {
          case 'In progress':
            color = 'green';
            text = 'Actif';
            break;
          case 'Not started yet':
            color = 'blue';
            text = 'Inactif';
            break;
          case 'Closed':
            color = 'red';
            text = 'Fermé';
            break;
          default:
            color = 'gray';
            text = state || 'Inconnu';
        }
        
        return <Tag color={color} style={{ borderRadius: 12 }}>{text}</Tag>;
      }
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            style={{ color: '#1890ff' }}
          />
          <Popconfirm
            title="Supprimer cette période ?"
            onConfirm={() => handleDelete(record._id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-layout">
        <Navbar />
        <div className="content">
          <Card className="period-card">
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
              <Col>
                <Title level={3} style={{ margin: 0 }}>
                  Gestion des périodes de dépôt
                </Title>
              </Col>
              <Col>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                  size="large"
                >
                  Ajouter Période
                </Button>
              </Col>
            </Row>

            <Table
              columns={columns}
              dataSource={periods}
              rowKey="_id"
              bordered
              loading={loading}
              scroll={{ x: 'max-content' }}
              pagination={{ pageSize: 5 }}
            />
          </Card>

          {/* Modal d'ajout */}
          <Modal
            title={<span style={{ fontSize: 20 }}>Ajouter une nouvelle période</span>}
            open={addModalVisible}
            onCancel={() => setAddModalVisible(false)}
            onOk={handleAddSave}
            confirmLoading={loading}
            width={600}
            okText="Confirmer"
            cancelText="Annuler"
          >
            <Form layout="vertical">
              <Form.Item label="Niveau" required>
                <Select
                  placeholder="Sélectionner un niveau"
                  value={addFormData.niveau}
                  onChange={(value) => setAddFormData({...addFormData, niveau: value})}
                  size="large"
                >
                  <Option value="premiereannee">Première année</Option>
                  <Option value="deuxiemeannee">Deuxième année</Option>
                </Select>
              </Form.Item>
              
              <Form.Item label="Date début dépôt" required>
                <DatePicker
                  value={addFormData.DateDebutDepot}
                  onChange={(date) => setAddFormData({...addFormData, DateDebutDepot: date})}
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  size="large"
                />
              </Form.Item>
              
              <Form.Item label="Date fin dépôt" required>
                <DatePicker
                  value={addFormData.DateFinDepot}
                  onChange={(date) => setAddFormData({...addFormData, DateFinDepot: date})}
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  size="large"
                />
              </Form.Item>
            </Form>
          </Modal>

          {/* Modal de modification */}
          <Modal
            title={<span style={{ fontSize: 20 }}>Modifier la période</span>}
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            onOk={handleSave}
            confirmLoading={loading}
            width={600}
            okText="Enregistrer"
            cancelText="Annuler"
          >
            <Form layout="vertical">
              <Form.Item label="Date début dépôt" required>
                <DatePicker
                  value={formData.DateDebutDepot}
                  onChange={(date) => setFormData({ ...formData, DateDebutDepot: date })}
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  size="large"
                />
              </Form.Item>
              
              <Form.Item label="Date fin dépôt" required>
                <DatePicker
                  value={formData.DateFinDepot}
                  onChange={(date) => setFormData({ ...formData, DateFinDepot: date })}
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  size="large"
                />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default PeriodManagement;