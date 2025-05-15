import { Input, message, Tag } from "antd";
import FormModal from "../../../components/modals/FormModal";
import { useEffect, useState } from "react";
import axios from "axios";

function ManuelAssignment({
  isModalOpen,
  setIsModalOpen,
  title,
  pfas,
  refreshMyData,
  selectedPfaId,
}) {
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  console.log("selectedPfaId", selectedPfaId);

  const [formData, setFormData] = useState({});

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

  const handleChoiceChange = (e) => {
    const checked = e.target.checked;
    setIsChecked(checked);
    setFormData((prevState) => ({
      ...prevState,
      estBinome: checked,
      etudiant2: checked ? prevState.etudiant2 : "", // Réinitialiser etudiant2 si non binôme
    }));
  };
  const handleSubmit = async (values) => {
    const { etudiant1, etudiant2, forceAffectation } = values;

    if (!etudiant1) {
      alert("Veuillez sélectionner au moins un étudiant.");
      return;
    }
    const pfa = pfas.find((item) => item._id === selectedPfaId);

    try {
      const url = `http://localhost:5000/pfa/${selectedPfaId}/assign/student/${etudiant1}/${
        etudiant2 || ""
      }`;
      const response = await axios.patch(
        url,
        { force: forceAffectation },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      message.success("Affectation réussie !");
      refreshMyData();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'affectation :", error);
      message.error(error.response?.data?.message || "Erreur serveur.");
    }
  };

  const formFields = [
    {
      label: "forceAffectation",
      name: "forceAffectation",
      type: "checkbox",
      // onchange: handleChoiceChange,
      valuePropName: "checked",

      rules: [{ required: true, message: "Veuillez indiquer le type !" }],
      style: { marginBottom: 0 },
      wrapperCol: { span: 16, offset: 6 },
    },

    {
      label: "En Binôme ?",
      name: "estBinome",
      type: "checkbox",
      onchange: handleChoiceChange,
      valuePropName: "checked",

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
  return (
    <div>
      <FormModal
        initialValues={{ estBinome: false }}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        formFields={formFields}
        title={title}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}

export default ManuelAssignment;
