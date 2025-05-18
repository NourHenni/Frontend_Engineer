import { useEffect, useState } from "react";
import FormModal from "../../../components/modals/FormModal";
import { updatePfa } from "../../../services/pfaServices";
import { Input, message, Spin, Tag } from "antd";
import axios from "axios";

// Composant de mise à jour d'un sujet PFA
function UpdatePfa({
  isUpdateModalOpen,
  setIsModalOpen,
  title,
  formData,
  setFormData,
  dataPfas,
  refreshMyData,
  selectedPfaId, // <<< ici
}) {
  const [loading, setLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false); // Déplacer isChecked ici
  const [students, setStudents] = useState([]);

  // Fonction pour pré-remplir les données du formulaire si elles sont déjà disponibles dans dataPfas
  const prefillFormData = () => {
    if (dataPfas && dataPfas.length > 0) {
      // Vérifier si le tableau n'est pas vide
      const pfa = dataPfas.find((item) => item._id === selectedPfaId);

      console.log("pfa", pfa); // Accéder au premier élément du tableau

      setFormData({
        title: pfa.titreSujet || "",
        description: pfa.description || "",
        technologies: pfa.technologies || "",
        estBinome: pfa.estBinome, // Assurez-vous que estBinome soit bien un booléen
        etudiant1: pfa.idEtudiant1 || "",
        etudiant2: pfa.idEtudiant2 || "",
      });

      console.log("PFA:", pfa); // Afficher l'objet PFA pour vérifier les données
      setIsChecked(pfa.estBinome || false); // Synchroniser isChecked avec estBinome
    }
  };

  useEffect(() => {
    if (isUpdateModalOpen) {
      prefillFormData();
    }
  }, [isUpdateModalOpen, dataPfas]);

  // Fonction pour gérer le changement dans les champs input
  const handleInputChange = (title) => {
    setFormData((prevState) => ({
      ...prevState,
      title: title,
    }));
  };
  // Fonction pour gérer le changement de la case à cocher "En Binôme ?"
  const handleChoiceChange = (e) => {
    setIsChecked(e.target.checked);
  };

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

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      let newPfa = {
        titreSujet: values.titreSujet,
        description: values.description,
        technologies: values.technologies,
        estBinome: isChecked,
        idEtudiant1: values.etudiant1,
        idEtudiant2: values.etudiant2,
      };
      console.log("newPfa", newPfa);

      const pfaId = selectedPfaId;

      console.log("pfaId", pfaId);

      if (!pfaId) {
        message.error("L'ID du sujet PFA est manquant.");
        return;
      }

      const response = await updatePfa(pfaId, newPfa);
      console.log(response);

      if (response && response.message) {
        message.success(response.message);
        refreshMyData();
        setIsModalOpen(false);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour : ", error);
      message.error(
        error?.response?.data?.message || "Une erreur s'est produite !"
      );
    } finally {
      setLoading(false);
    }
  };
  const handleTagChange = (tags) => {
    setFormData((prevState) => ({
      ...prevState,
      technologies: tags,
    }));
  };

  const formFields = [
    {
      label: "Titre du sujet",
      name: "titreSujet",
      type: "input",
      onchange: handleInputChange,

      rules: [
        { required: true, message: "Veuillez entrer le titre du sujet !" },
      ],
    },
    {
      label: "Description",
      name: "description",
      type: "textarea",
      rules: [
        {
          required: true,
          message: "Veuillez entrer la description du sujet !",
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

      checked: isChecked, // Utilisez isChecked ici

      rules: [{ required: true, message: "Veuillez indiquer le type !" }],
      style: { marginBottom: 0 },
      wrapperCol: { span: 16, offset: 6 },
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
  if (loading) {
    return (
      <Spin spinning={loading} size="small" tip="Chargement en cours..." />
    );
  }
  return (
    <div>
      <FormModal
        initialValues={{ estBinome: false }}
        isModalOpen={isUpdateModalOpen}
        setIsModalOpen={setIsModalOpen}
        formFields={formFields}
        title={title}
        formData={formData}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}

export default UpdatePfa;
