import React, { useState } from "react";
import { Modal, Input, Button, Select, DatePicker, Form, message } from "antd";
import { createStudent } from "../../services/userService"; // Import the userService
import moment from "moment";

const { Option } = Select;

const AddStudentModal = ({ isModalVisible, handleCancel, handleAddStudent }) => {
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
    role: "etudiant",
    situation: "",
    baccalaureat: "",
    annee_bac: "",
    moyenne_bac: "",
    mention: "",
    universite: "",
    etablissement: "",
    type_licence: "",
    specialite: "",
    annee_licence: "",
    est_prepa: false,
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
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const newStudent = await createStudent(formValues); // Call the createStudent function
      message.success('Student added successfully!');
      handleAddStudent(newStudent); // Update parent component with the new student
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
        role: "etudiant",
        situation: "",
        baccalaureat: "",
        annee_bac: "",
        moyenne_bac: "",
        mention: "",
        universite: "",
        etablissement: "",
        type_licence: "",
        specialite: "",
        annee_licence: "",
        est_prepa: false,
      });
    } catch (error) {
      message.error('Failed to add student. Please try again.');
    }
  };

  return (
    <Modal
      title="Add New Student"
      visible={isModalVisible}
      onCancel={handleCancel}
      onOk={handleFormSubmit}
      okText="Add"
    >
      <Form layout="vertical">
        <Form.Item label="First Name">
          <Input
            name="nom"
            value={formValues.nom}
            onChange={handleChange}
            required
          />
        </Form.Item>

        <Form.Item label="Last Name">
          <Input
            name="prenom"
            value={formValues.prenom}
            onChange={handleChange}
            required
          />
        </Form.Item>

        <Form.Item label="CIN">
          <Input
            name="cin"
            value={formValues.cin}
            onChange={handleChange}
            type="number"
            required
          />
        </Form.Item>

        <Form.Item label="Gender">
          <Select
            name="genre"
            value={formValues.genre}
            onChange={(value) => handleSelectChange("genre", value)}
            required
          >
            <Option value="M">Male</Option>
            <Option value="F">Female</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Birth Date">
          <DatePicker
            name="dateDeNaissance"
            value={formValues.dateDeNaissance ? moment(formValues.dateDeNaissance) : null}
            onChange={handleDateChange}
            required
          />
        </Form.Item>

        <Form.Item label="Governorate">
          <Input
            name="gouvernorat"
            value={formValues.gouvernorat}
            onChange={handleChange}
            required
          />
        </Form.Item>

        <Form.Item label="Address">
          <Input
            name="addresse"
            value={formValues.addresse}
            onChange={handleChange}
            required
          />
        </Form.Item>

        <Form.Item label="City">
          <Input
            name="ville"
            value={formValues.ville}
            onChange={handleChange}
            required
          />
        </Form.Item>

        <Form.Item label="Postal Code">
          <Input
            name="code_postal"
            value={formValues.code_postal}
            onChange={handleChange}
            type="number"
            required
          />
        </Form.Item>

        <Form.Item label="Nationality">
          <Input
            name="nationalite"
            value={formValues.nationalite}
            onChange={handleChange}
            required
          />
        </Form.Item>

        <Form.Item label="Phone Number">
          <Input
            name="telephone"
            value={formValues.telephone}
            onChange={handleChange}
            type="number"
            required
          />
        </Form.Item>

        <Form.Item label="Entry Year">
          <Input
            name="annee_entree_isamm"
            value={formValues.annee_entree_isamm}
            onChange={handleChange}
            type="number"
            required
          />
        </Form.Item>

        <Form.Item label="Email">
          <Input
            name="adresseEmail"
            value={formValues.adresseEmail}
            onChange={handleChange}
            required
          />
        </Form.Item>

        <Form.Item label="Role">
          <Select
            name="role"
            value={formValues.role}
            onChange={(value) => handleSelectChange("role", value)}
            required
          >
            <Option value="etudiant">Student</Option>
            <Option value="admin">Admin</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Status">
          <Select
            name="situation"
            value={formValues.situation}
            onChange={(value) => handleSelectChange("situation", value)}
            required
          >
            <Option value="passe">Passe</Option>
            <Option value="redouble">Redouble</Option>
            <Option value="diplome">Diplome</Option>
        
          </Select>
        </Form.Item>

        <Form.Item label="Baccalaureate">
          <Input
            name="baccalaureat"
            value={formValues.baccalaureat}
            onChange={handleChange}
          />
        </Form.Item>

        <Form.Item label="Baccalaureate Year">
          <Input
            name="annee_bac"
            value={formValues.annee_bac}
            onChange={handleChange}
            type="number"
          />
        </Form.Item>

        <Form.Item label="Baccalaureate Average">
          <Input
            name="moyenne_bac"
            value={formValues.moyenne_bac}
            onChange={handleChange}
            type="number"
          />
        </Form.Item>

        <Form.Item label="Mention">
          <Input
            name="mention"
            value={formValues.mention}
            onChange={handleChange}
          />
        </Form.Item>

        <Form.Item label="University">
          <Input
            name="universite"
            value={formValues.universite}
            onChange={handleChange}
          />
        </Form.Item>

        <Form.Item label="Establishment">
          <Input
            name="etablissement"
            value={formValues.etablissement}
            onChange={handleChange}
          />
        </Form.Item>

        <Form.Item label="Degree Type">
          <Input
            name="type_licence"
            value={formValues.type_licence}
            onChange={handleChange}
          />
        </Form.Item>

        <Form.Item label="Specialty">
          <Input
            name="specialite"
            value={formValues.specialite}
            onChange={handleChange}
          />
        </Form.Item>

        <Form.Item label="Degree Year">
          <Input
            name="annee_licence"
            value={formValues.annee_licence}
            onChange={handleChange}
            type="number"
          />
        </Form.Item>

        <Form.Item label="Preparation Year">
          <Select
            name="est_prepa"
            value={formValues.est_prepa}
            onChange={(value) => handleSelectChange("est_prepa", value)}
          >
            <Option value={false}>No</Option>
            <Option value={true}>Yes</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddStudentModal;
