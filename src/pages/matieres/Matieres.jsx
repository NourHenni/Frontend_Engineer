import React, { useState } from "react";
import { Modal, Form, Input, InputNumber, Button } from "antd";
import Navbar from "../../components/navbar/Navbar";
import SidebarLayout from "../../components/sidebar/Sidebar";
import ButtonModel from "../../components/button/Button";
import TableData from "../../components/table/TableData";
import { Space } from "antd";
import { PlusOutlined , EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import "./matieres.css";

function Matieres({ userRole }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMatiere, setSelectedMatiere] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [editingMatiere, setEditingMatiere] = useState(null);
  const [matieres, setMatieres] = useState([
    {
      key: "1",
      name: "Mathématiques",
      credit: 3,
      coefficient: 2,
      isPublished: false,
    },
    {
      key: "2",
      name: "Physique",
      credit: 4,
      coefficient: 3,
      isPublished: true,
    },
    // Ajoutez d'autres matières si nécessaire
  ]);

  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalVisible(true);
  };
  const showAddModal = () => {
    setIsAddModalVisible(true);
  };
  
  const showDetailsModal = (matiere) => {
    setSelectedMatiere(matiere);
    setIsDetailsModalVisible(true);
  };
  const handleAddCancel = () => {
    setIsAddModalVisible(false);
    form.resetFields();
  };
  const showEditModal = (matiere) => {
    setEditingMatiere(matiere);
    setIsEditModalVisible(true);
    form.setFieldsValue(matiere); // Pré-remplit le formulaire avec les données existantes
  };
  
  const handleDetailsCancel = () => {
    setIsDetailsModalVisible(false);
    setSelectedMatiere(null);
  };
    
  const handleEditOk = (values) => {
    const updatedMatieres = matieres.map((matiere) =>
      matiere.key === editingMatiere.key ? { ...matiere, ...values } : matiere
    );
    setMatieres(updatedMatieres);
    setIsEditModalVisible(false);
    setEditingMatiere(null);
    form.resetFields();
  };
  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setEditingMatiere(null);
    form.resetFields();
  };
    
  const togglePublication = (key) => {
    const updatedMatieres = matieres.map((matiere) =>
      matiere.key === key ? { ...matiere, isPublished: !matiere.isPublished } : matiere
    );
    setMatieres(updatedMatieres);
  };
  

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleOk = (values) => {
    const newMatiere = {
      key: (matieres.length + 1).toString(),
      ...values,
    };
    setMatieres([...matieres, newMatiere]);
    setIsModalVisible(false);
    form.resetFields();
  };
  const handleDelete = (key) => {
    setMatieres(matieres.filter((item) => item.key !== key));
  };

  const columns = [
    {
      title: "Nom de la matière",
      dataIndex: "name",
      key: "name",
    },
 
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
           <Button onClick={() => showDetailsModal(record)}>Consulter</Button>
        
           {userRole === "admin" && (
            <>
           <Button onClick={() => showEditModal(record)}>Modifier</Button>
          <Button onClick={() => handleDelete(record.key)} danger>
            Supprimer
          </Button>
          <Button onClick={() => togglePublication(record.key)}>
              {record.isPublished ? "Masquer" : "Publier"}
            </Button>
            /</>
           )}          
          
          
        </Space>
      ),
    },
  ];
  

  return (
    <div className="matieres-container">
      <Navbar />
      <div className="main-content">
        <SidebarLayout />
        <div className="table-container">
          <div className="table-header">
            <h2>Liste des Matières</h2>
            {userRole === "admin" && (
            <ButtonModel
              text="Ajouter une matière"
              icon={<PlusOutlined />}
              onClick={showModal}
            />
        )}
          </div>
          <TableData columns={columns} data={matieres} />
        </div>
      </div>
      <Modal
        title="Ajouter une nouvelle matière"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleOk}>
          <Form.Item
            name="name"
            label="Nom de la matière"
            rules={[{ required: true, message: "Veuillez entrer le nom de la matière !" }]}         
          >
            <Input /> 
            </Form.Item>
            
           
          <Form.Item
            name="Coefficient Groupe-Module"
            label="Coefficient Groupe-Module"
            rules={[{ required: true, message: "Veuillez entrer le Coefficient Groupe-Module !" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="credit"
            label="Crédit"
            rules={[{ required: true, message: "Veuillez entrer le nombre de crédits !" }]}
          >
                 <Input />
          </Form.Item>
          <Form.Item
            name="volume-horaire"
            label="Volume-Horaire"
            rules={[{ required: true, message: "Veuillez entrer le volume horaire !" }]}
          >
             <Input />
          </Form.Item>
          <Form.Item
            name="Nbheures-cours"
            label="Nbheures-cours"
            rules={[{ required: true, message: "Veuillez entrer le nombre d'heure de cours!" }]}
          >
              <Input />
          </Form.Item>
          <Form.Item
            name="Nbheures-TD"
            label="Nbheures-TD"
            rules={[{ required: true, message: "Veuillez entrer le nombre d'heure de TD!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="Nbheures-TP"
            label="Nbheures-TP"
            rules={[{ required: true, message: "Veuillez entrer le nombre d'heure de TP!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="Année"
            label="Année"
            rules={[{ required: true, message: "Veuillez entrer l'année" }]}
          >
            
            
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item
            name="coefficient"
            label="Coefficient"
            rules={[{ required: true, message: "Veuillez entrer le coefficient !" }]}
          >
            <InputNumber min={0} />
          </Form.Item>
       
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Ajouter
            </Button>
            <Button key="close" onClick={handleCancel}>
      Annuler
    </Button>,
          </Form.Item>
        </Form>
      </Modal>
      

      <Modal
        title="Détails de la matière"
        visible={isDetailsModalVisible}
        
        onCancel={handleCancel}
        footer={[
          <Button key="close" onClick={handleDetailsCancel}>
            Fermer
          </Button>,
          
        ]}
      >
        {selectedMatiere && (
          <div>
            <p><strong>Nom :</strong> {selectedMatiere.name}</p>
            <p><strong>Coefficient Groupe-Module :</strong> {selectedMatiere["Coefficient Groupe-Module"]}</p>
            <p><strong>Crédit :</strong> {selectedMatiere.credit}</p>
            <p><strong>Volume Horaire :</strong> {selectedMatiere["volume-horaire"]}</p>
            <p><strong>Nb heures cours :</strong> {selectedMatiere["Nbheures-cours"]}</p>
            <p><strong>Nb heures TD :</strong> {selectedMatiere["Nbheures-TD"]}</p>
            <p><strong>Nb heures TP :</strong> {selectedMatiere["Nbheures-TP"]}</p>
            <p><strong>Année :</strong> {selectedMatiere["Année"]}</p>
            <p><strong>Coefficient :</strong> {selectedMatiere.coefficient}</p>
            <p><strong>Publier :</strong> {selectedMatiere.isPublished ? 'Oui' : 'Non'}</p>


          </div>
        )}
      </Modal>

      <Modal
  title="Modifier la matière"
  visible={isEditModalVisible}
  onCancel={handleCancel}
  footer={null}
>
  <Form form={form} layout="vertical" onFinish={handleEditOk}>
    <Form.Item
      name="name"
      label="Nom de la matière"
      
    >
      <Input />
    </Form.Item>
    <Form.Item
            name="Coefficient Groupe-Module"
            label="Coefficient Groupe-Module"
            
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="credit"
            label="Crédit"
           
          >
                 <Input />
          </Form.Item>
          <Form.Item
            name="volume-horaire"
            label="Volume-Horaire"
            
          >
             <Input />
          </Form.Item>
          <Form.Item
            name="Nbheures-cours"
            label="Nbheures-cours"
            
          >
              <Input />
          </Form.Item>
          <Form.Item
            name="Nbheures-TD"
            label="Nbheures-TD"
            
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="Nbheures-TP"
            label="Nbheures-TP"
           
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="Année"
            label="Année"
            
          >
            
            
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item
            name="coefficient"
            label="Coefficient"
            
          >
            <InputNumber min={0} />
          </Form.Item>
    <Form.Item>
      <Button type="primary" htmlType="submit">
        Enregistrer les modifications
      </Button>
      <Button onClick={handleEditCancel} style={{ marginLeft: 8 }}>
        Annuler
      </Button>
    </Form.Item>
  </Form>
</Modal>

      
    </div>
    
    
    
  );
}

export default Matieres;

