import React, { useState } from "react";
import { Modal, Input, Select, DatePicker, Form, message } from "antd";
import { createTeacher } from "../../services/userService";
import moment from "moment";

const { Option } = Select;

const AddTeacherModal = ({ isModalVisible, handleCancel, handleAddTeacher }) => {
  const [formValues, setFormValues] = useState({
    nom: "",
    prenom: "",
    cin: "",
    genre: "",
    dateDeNaissance: "",
    gouvernorat: "",
    addresse: "",
    ville: "",
    code_postal: "",
    nationalite: "",
    telephone: "",
    annee_entree_isamm: "",
    adresseEmail: "",
    role: "enseignant",
    grade: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setFormValues({ ...formValues, [name]: value });
  };

  const handleDateChange = (date, dateString) => {
    setFormValues({ ...formValues, dateDeNaissance: dateString });
  };

  const handleFormSubmit = async () => {
    const { nom, prenom, cin, adresseEmail, telephone } = formValues;
    if (!nom || !prenom || !cin || !adresseEmail || !telephone) {
      message.warning("Please fill in all required fields.");
      return;
    }

    try {
      const newTeacher = await createTeacher(formValues);
      message.success("Teacher added successfully!");
      handleAddTeacher(newTeacher);
      setFormValues({
        nom: "",
        prenom: "",
        cin: "",
        genre: "",
        dateDeNaissance: "",
        gouvernorat: "",
        addresse: "",
        ville: "",
        code_postal: "",
        nationalite: "",
        telephone: "",
        annee_entree_isamm: "",
        adresseEmail: "",
        role: "enseignant",
        grade: "",
      });
    } catch (error) {
      message.error("Failed to add teacher. Please try again.");
    }
  };

  return (
    <Modal
      title="Add New Teacher"
      open={isModalVisible}
      onCancel={handleCancel}
      onOk={handleFormSubmit}
      okText="Add"
    >
      <Form layout="vertical">
        <Form.Item label="Nom">
          <Input name="nom" value={formValues.nom} onChange={handleChange} />
        </Form.Item>
        <Form.Item label="Prénom">
          <Input name="prenom" value={formValues.prenom} onChange={handleChange} />
        </Form.Item>
        <Form.Item label="CIN">
          <Input name="cin" value={formValues.cin} onChange={handleChange} />
        </Form.Item>
        <Form.Item label="Genre">
          <Select value={formValues.genre} onChange={(value) => handleSelectChange("genre", value)}>
            <Option value="M">Homme</Option>
            <Option value="F">Femme</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Date de Naissance">
          <DatePicker
            style={{ width: "100%" }}
            value={formValues.dateDeNaissance ? moment(formValues.dateDeNaissance) : null}
            onChange={handleDateChange}
          />
        </Form.Item>
        <Form.Item label="Gouvernorat">
          <Input name="gouvernorat" value={formValues.gouvernorat} onChange={handleChange} />
        </Form.Item>
        <Form.Item label="Ville">
          <Input name="ville" value={formValues.ville} onChange={handleChange} />
        </Form.Item>
        <Form.Item label="Adresse">
          <Input name="addresse" value={formValues.addresse} onChange={handleChange} />
        </Form.Item>
        <Form.Item label="Code Postal">
          <Input name="code_postal" type="number" value={formValues.code_postal} onChange={handleChange} />
        </Form.Item>
        <Form.Item label="Nationalité">
          <Input name="nationalite" value={formValues.nationalite} onChange={handleChange} />
        </Form.Item>
        <Form.Item label="Téléphone">
          <Input name="telephone" value={formValues.telephone} onChange={handleChange} />
        </Form.Item>
        <Form.Item label="Année d'entrée à ISAMM">
          <Input name="annee_entree_isamm" value={formValues.annee_entree_isamm} onChange={handleChange} />
        </Form.Item>
        <Form.Item label="Email">
          <Input name="adresseEmail" value={formValues.adresseEmail} onChange={handleChange} />
        </Form.Item>
        <Form.Item label="Rôle">
          <Select value={formValues.role} disabled>
            <Option value="enseignant">Enseignant</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Grade">
          <Input name="grade" value={formValues.grade} onChange={handleChange} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddTeacherModal;
