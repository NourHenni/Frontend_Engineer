import { useEffect, useState } from "react";
import FormModal from "../../../components/modals/FormModal";
import { addPfa } from "../../../services/pfaServices";
import { message, Input, Tag } from "antd"; // Importer Input et Tag d'Ant Design
import axios from "axios";

function AddPfa({ isModalOpen, setIsModalOpen, title, refreshMyData }) {
  const [formData, setFormData] = useState({
    titreSujet: "",
    description: "",
    technologies: [],
    estBinome: false,
    etudiant1: "",
    etudiant2: "",
  });
  const [isChecked, setIsChecked] = useState(false); // Utilisé pour savoir si c'est un binôme ou non
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/pfa/studentsPfas",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const students = response.data.users; // Liste des étudiants
        setStudents(students);
      } catch (error) {
        console.error("Erreur", error);
      }
    };

    fetchStudents();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleChoiceChange = (e) => {
    const checked = e.target.checked;
    setIsChecked(checked);
    setFormData((prevState) => ({
      ...prevState,
      estBinome: checked,
      etudiant2: checked ? prevState.etudiant2 : "", // Réinitialiser etudiant2 si non binôme
    }));
  };

  const handleTagChange = (tags) => {
    setFormData((prevState) => ({
      ...prevState,
      technologies: tags, // Mettre à jour la liste des technologies avec les tags
    }));
  };

  const handleSubmit = async (values) => {
    try {
      // Créer l'objet PFA avec les IDs des étudiants
      const newPfa = {
        titreSujet: values.titreSujet,
        description: values.description,
        technologies: values.technologies,
        estBinome: isChecked,
        idEtudiant1: values.etudiant1,
        idEtudiant2: values.etudiant2,
      };

      // Effectuer la requête pour ajouter un PFA
      const response = await addPfa(newPfa);
      console.log("response", response);

      if (response.message) {
        message.success(response.message);
        refreshMyData();
        setIsModalOpen(false);
      } else {
        message.error(response.message || "Message vide du backend");
      }
    } catch (error) {
      console.error(
        "Erreur lors de l'ajout du PFA : ",
        error.response?.data || error
      );
      const errorMessage =
        error.response?.data?.message || "Une erreur s'est produite !";
      message.error(errorMessage);
    }
  };

  const formFields = [
    {
      label: "Titre du sujet",
      name: "titreSujet",
      type: "input",
      onchange: handleInputChange,
      rules: [
        { required: true, message: "Veuillez entrer le titre du sujet  !" },
      ],
    },
    {
      label: "Description",
      name: "description",
      type: "textarea",
      onchange: handleInputChange,
      rules: [
        {
          required: true,
          message: "Veuillez entrer la description du sujet  !",
        },
      ],
    },
    {
      label: "Technologies",
      name: "technologies",
      type: "tags",
      onchange: handleTagChange,
      value: formData.technologies, // Afficher les tags existants
      render: (tags) => (
        <div>
          {tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </div>
      ),
      component: (
        <Input
          placeholder="Ajouter des technologies"
          onPressEnter={(e) => {
            handleTagChange([...formData.technologies, e.target.value]);
            e.target.value = "";
          }}
        />
      ),
      rules: [
        {
          required: true,
          message: "Veuillez entrer au moins une technologie !",
        },
      ],
    },
    {
      label: "En Binôme ?",
      name: "estBinome",
      type: "checkbox",
      rules: [{ required: true, message: "Champ requis !" }],
      onchange: handleChoiceChange,
      valuePropName: "checked", // Corrigé la valeur de "checked" au lieu de "isChecked"
      style: { marginBottom: 0 },
    },
    {
      label: "Etudiant1",
      name: "etudiant1",
      type: "selectStudents",
      rules: [{ required: false, message: "Champ requis !" }],
      selectProps: {
        options: students.map((student) => ({
          label: `${student.nom} ${student.prenom}`,
          value: student._id,
        })),
        placeholder: "Sélectionner un étudiant",
        allowClear: true,
      },
    },
    {
      label: "Etudiant2",
      name: "etudiant2",
      type: "selectStudents",
      rules: [
        {
          required: false,
          message: "Champ requis !",
        },
      ],
      selectProps: {
        options: students.map((student) => ({
          label: `${student.nom} ${student.prenom}`,
          value: student._id,
        })),
        placeholder: "Sélectionner un binôme",
        allowClear: true,
        disabled: !isChecked, // Désactiver ce champ si pas de binôme
      },
    },
  ];

  return (
    <div>
      <FormModal
        initialValues={{
          estBinome: false, // ou true selon le cas par défaut
        }}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        formFields={formFields}
        title={title}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default AddPfa;
