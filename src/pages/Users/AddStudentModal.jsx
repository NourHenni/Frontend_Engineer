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
  const mentions = ["Passable", "Assez bien", "Bien", "Très bien", "Excellent"];
  const tunisianUniversities = [
    "Université de Tunis",
    "Université de Carthage",
    "Université de La Manouba",
    "Université de Tunis El Manar",
    "Université de Sfax",
    "Université de Sousse",
    "Université de Monastir",
    "Université de Kairouan",
    "Université de Gafsa",
    "Université de Gabès",
    "Université de Jendouba",

  ];
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
  const tunisianBaccalaureats = [
    "Sciences expérimentales",
    "Mathématiques",
    "Sciences techniques",
    "Sciences de l’informatique",
    "Sciences économiques et gestion",

  ];
  const tunisianGovernorates = [
    "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba", "Kairouan",
    "Kasserine", "Kébili", "Kef", "Mahdia", "La Manouba", "Médenine", "Monastir", "Nabeul",
    "Sfax", "Sidi Bouzid", "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"
  ];
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
        <Form.Item label="First Name" required>
          <Input
            name="nom"
            value={formValues.nom}
            onChange={handleChange}
            required
          />
        </Form.Item>

        <Form.Item label="Last Name" required>
          <Input
            name="prenom"
            value={formValues.prenom}
            onChange={handleChange}
            required
          />
        </Form.Item>

        <Form.Item label="CIN" required>
          <Input
            name="cin"
            value={formValues.cin}
            onChange={handleChange}
            type="number"
            required
          />
        </Form.Item>

        <Form.Item label="Gender" required>
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

        <Form.Item label="Birth Date" required >
          <DatePicker
            name="dateDeNaissance"
            value={formValues.dateDeNaissance ? moment(formValues.dateDeNaissance) : null}
            onChange={handleDateChange}
            required
          />
        </Form.Item>

        <Form.Item label="Governorate" required>
          <Select
            name="gouvernorat"
            value={formValues.gouvernorat}
            onChange={(value) => handleChange({ target: { name: 'gouvernorat', value } })}
            placeholder="Select a governorate"
          >
            {tunisianGovernorates.map((gov) => (
              <Option key={gov} value={gov}>{gov}</Option>
            ))}
          </Select>
        </Form.Item>



        <Form.Item label="City" required>
          <Input
            name="ville"
            value={formValues.ville}
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

        <Form.Item label="Postal Code" required>
          <Input
            name="code_postal"
            value={formValues.code_postal}
            onChange={handleChange}
            type="number"
            required
          />
        </Form.Item>

        <Form.Item label="Nationality" required>
          <Input
            name="nationalite"
            value={formValues.nationalite}
            onChange={handleChange}
            required
          />
        </Form.Item>

        <Form.Item label="Phone Number" required>
          <Input
            name="telephone"
            value={formValues.telephone}
            onChange={handleChange}
            type="number"
            required
          />
        </Form.Item>

        <Form.Item label="Entry Year" required>
          <Input
            name="annee_entree_isamm"
            value={formValues.annee_entree_isamm}
            onChange={handleChange}
            type="number"
            required
          />
        </Form.Item>

        <Form.Item label="Email" required>
          <Input
            name="adresseEmail"
            value={formValues.adresseEmail}
            onChange={handleChange}
            required
          />
        </Form.Item>

        <Form.Item label="Role" required>
          <Select
            name="role"
            value={formValues.role}
            onChange={(value) => handleSelectChange("role", value)}
            disabled
          >
            <Option value="etudiant">Student</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Status" required>
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

        <Form.Item label="Baccalaureate" required>
          <Select
            name="baccalaureat"
            value={formValues.baccalaureat}
            onChange={(value) => handleChange({ target: { name: 'baccalaureat', value } })}
            placeholder="Select a Baccalaureate type"
          >
            {tunisianBaccalaureats.map((bac) => (
              <Option key={bac} value={bac}>{bac}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Baccalaureate Year" required>
          <Input
            name="annee_bac"
            value={formValues.annee_bac}
            onChange={handleChange}
            type="number"
          />
        </Form.Item>

        <Form.Item label="Baccalaureate Average" required>
          <Input
            name="moyenne_bac"
            value={formValues.moyenne_bac}
            onChange={handleChange}
            type="number"
          />
        </Form.Item>

        <Form.Item label="Mention">
  <Select
    name="mention"
    value={formValues.mention}
    onChange={(value) => handleChange({ target: { name: 'mention', value } })}
    placeholder="Select a mention"
  >
    {mentions.map((m) => (
      <Option key={m} value={m}>{m}</Option>
    ))}
  </Select>
</Form.Item>

<Form.Item label="University" required>
  <Select
    name="universite"
    value={formValues.universite}
    onChange={(value) => handleChange({ target: { name: 'universite', value } })}
    placeholder="Select a university"
    showSearch
  >
    {tunisianUniversities.map((uni) => (
      <Option key={uni} value={uni}>{uni}</Option>
    ))}
  </Select>
</Form.Item>

        <Form.Item label="Establishment" required>
          <Input
            name="etablissement"
            value={formValues.etablissement}
            onChange={handleChange}
          />
        </Form.Item>

        <Form.Item label="Degree Type" required>
  <Select
    name="type_licence"
    value={formValues.type_licence}
    onChange={(value) => handleChange({ target: { name: 'type_licence', value } })}
    placeholder="Select degree type"
  >
    <Option value="Licence">Licence</Option>
    <Option value="Mastère">Mastère</Option>
  </Select>
</Form.Item>

        <Form.Item label="Specialty" required>
          <Input
            name="specialite"
            value={formValues.specialite}
            onChange={handleChange}
          />
        </Form.Item>

        <Form.Item label="Degree Year" required>
          <Input
            name="annee_licence"
            value={formValues.annee_licence}
            onChange={handleChange}
            type="number"
          />
        </Form.Item>

        <Form.Item label="Preparation Year" required>
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
