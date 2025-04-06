import { useEffect, useState } from "react";
import FormModal from "../../../components/modals/FormModal";
import { updatePfa } from "../../../services/pfaServices";
import { message } from "antd";

// Composant de mise à jour d'un sujet PFA
function UpdatePfa({
  isUpdateModalOpen,
  setIsModalOpen,
  title,
  formData,
  setFormData,
  dataPfas,
  refreshMyData,
}) {
  const [loading, setLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false); // Déplacer isChecked ici

  // Fonction pour pré-remplir les données du formulaire si elles sont déjà disponibles dans dataPfas
  const prefillFormData = () => {
    if (dataPfas && dataPfas.length > 0) {
      // Vérifier si le tableau n'est pas vide
      const pfa = dataPfas[0];
      console.log("pfa", dataPfas); // Accéder au premier élément du tableau

      setFormData({
        title: pfa.titreSujet || "",
        description: pfa.description || "",
        technologies: pfa.technologies || "",
        estBinome: pfa.estBinome, // Assurez-vous que estBinome soit bien un booléen
        //etudiant1: pfa.etudiant1 || "",
        //etudiant2: pfa.etudiant2 || "",
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

  // Soumettre le formulaire pour mettre à jour le sujet PFA
  // Dans handleSubmit
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Préparer les nouvelles données du PFA
      let newPfa = {
        titreSujet: values.titreSujet,
        description: values.description,
        technologies: values.technologies, // Split si plusieurs technologies
        estBinome: isChecked,
        etudiant1: isChecked ? values.etudiant1 : "", // Si Binôme, on prend les étudiants
        etudiant2: isChecked ? values.etudiant2 : "",
      };

      const pfa = dataPfas[0];
      const pfaId = pfa._id;

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
      setLoading(false); // Assurez-vous de stopper le chargement après la requête
    }
  };

  // Définition des champs du formulaire
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
      // onchange: handleInputChange,
      // Assurez-vous que "formData.description" est défini
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
      type: "input",
      //onchange: handleInputChange,

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
      //onchange: handleChoiceChange,
      checked: isChecked, // Utilisez isChecked ici

      rules: [{ required: true, message: "Veuillez indiquer le type !" }],
      style: { marginBottom: 0 },
      wrapperCol: { span: 16, offset: 6 },
    },
    {
      label: "Etudiant 1",
      name: "etudiant1",
      type: "input",
      // onchange: handleInputChange,

      rules: [{ required: false }],
      style: { marginTop: 0 },
    },
    {
      label: "Etudiant 2",
      name: "etudiant2",
      type: "input",
      onchange: handleInputChange,

      rules: [{ required: false }],
      style: { marginTop: 0 },
    },
  ];

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
      />
    </div>
  );
}

export default UpdatePfa;
