import React, { useEffect, useState } from "react";
import { Form, Typography, Input, Select, message, Spin } from "antd";
import FormModal from "../../../components/modals/FormModal";
//import { getPfaDetails, updatePfaChoices } from "../../../services/pfaServices"; // Services pour récupérer et mettre à jour les données
//import axios from "axios";

//const { Title } = Typography;

const PfaUpdateForm = ({ isModalOpen, setIsModalOpen, title, pfaId }) => {
  const [form] = Form.useForm();
  const [pfaOptions, setPfaOptions] = useState([]); // Stocker les options de PFA
  const [loading, setLoading] = useState(true); // Indicateur de chargement
  const [error, setError] = useState(null); // Pour afficher une erreur
  const [students, setStudents] = useState([]); // Liste des étudiants
  const [pfaData, setPfaData] = useState(null); // Données actuelles du PFA

  const currentYear = new Date().getFullYear();
  const pfaPrefix = `PFA${currentYear}-`;

  // Fonction pour récupérer les codes PFA publiés
  //   useEffect(() => {
  //     const fetchPfaOptions = async () => {
  //       try {
  //         const response = await axios.get(
  //           "http://localhost:5000/pfa/publishedCode",
  //           {
  //             headers: {
  //               Authorization: `Bearer ${localStorage.getItem("token")}`,
  //             },
  //           }
  //         );
  //         setPfaOptions(response.data.codes); // Récupérer les codes PFA
  //       } catch (error) {
  //         setError("Erreur lors de la récupération des sujets PFA.");
  //       }
  //     };

  //     const fetchStudents = async () => {
  //       try {
  //         const response = await axios.get(
  //           "http://localhost:5000/pfa/studentsPfas",
  //           {
  //             headers: {
  //               Authorization: `Bearer ${localStorage.getItem("token")}`,
  //             },
  //           }
  //         );
  //         const students = response.data.users; // Liste des étudiants
  //         setStudents(students);
  //       } catch (error) {
  //         console.error("Erreur", error);
  //       }
  //     };

  //     const fetchPfaData = async () => {
  //       try {
  //         const response = await getPfaDetails(pfaId); // Récupère les données du PFA
  //         setPfaData(response.data);
  //         form.setFieldsValue(response.data); // Remplir le formulaire avec les données existantes
  //       } catch (error) {
  //         message.error("Erreur lors de la récupération des données du PFA.");
  //       }
  //     };

  //     fetchPfaOptions();
  //     fetchStudents();
  //     if (pfaId) {
  //       fetchPfaData(); // Récupérer les données spécifiques au PFA
  //     }
  //     setLoading(false);
  //   }, [pfaId]);

  // Validation des doublons
  const validateUniquePriority = (_, value, allValues) => {
    const priorities = [
      allValues.priority1,
      allValues.priority2,
      allValues.priority3,
    ].filter(Boolean);

    if (new Set(priorities).size !== priorities.length) {
      return Promise.reject("Les codes doivent être uniques !");
    }
    return Promise.resolve();
  };

  // Validation format + existence
  const validatePfaCode = (_, value) => {
    if (!/^\d{2}$/.test(value)) {
      return Promise.reject("Format invalide (2 chiffres requis)");
    }

    const fullCode = `${pfaPrefix}${value}`;
    if (!pfaOptions.includes(fullCode)) {
      return Promise.reject("Code PFA inexistant");
    }

    return Promise.resolve();
  };

  const formFields = [
    {
      label: "Priorité 1",
      name: "priority1",
      type: "inputChoice",
      addonBefore: pfaPrefix,
      rules: [
        { required: true, message: "Champ requis !" },
        { validator: validatePfaCode },
        { validator: validateUniquePriority },
      ],
      inputProps: {
        maxLength: 2,
        placeholder: "01",
      },
    },
    {
      label: "Priorité 2",
      name: "priority2",
      type: "inputChoice",
      addonBefore: pfaPrefix,
      rules: [
        { required: true, message: "Champ requis !" },
        { validator: validatePfaCode },
        { validator: validateUniquePriority },
      ],
      inputProps: {
        maxLength: 2,
        placeholder: "02",
      },
    },
    {
      label: "Priorité 3",
      name: "priority3",
      type: "inputChoice",
      addonBefore: pfaPrefix,
      rules: [
        { required: true, message: "Champ requis !" },
        { validator: validatePfaCode },
        { validator: validateUniquePriority },
      ],
      inputProps: {
        maxLength: 2,
        placeholder: "03",
      },
    },
    {
      label: "Code du sujet accepté",
      name: "acceptedpfa",
      type: "inputChoice",
      addonBefore: pfaPrefix,
      rules: [
        { required: false, message: "Champ requis !" },
        ({ getFieldValue }) => ({
          validator(_, value) {
            if (value && !/^\d{2}$/.test(value)) {
              return Promise.reject("Format invalide (2 chiffres requis)");
            }

            const fullCode = `${pfaPrefix}${value}`;
            if (value && !pfaOptions.includes(fullCode)) {
              return Promise.reject("Code PFA inexistant");
            }

            return Promise.resolve();
          },
        }),
        { validator: validateUniquePriority },
      ],
      inputProps: {
        maxLength: 2,
        placeholder: "03",
      },
    },

    {
      label: "Votre Binôme",
      name: "binomeId",
      type: "selectStudents",
      rules: [{ required: false, message: "Champ requis !" }],
      selectProps: {
        options: students.map((student) => ({
          label: `${student.nom} ${student.prenom}`,
          value: student._id,
        })),
        placeholder: "Sélectionner un binôme",
        allowClear: true,
      },
    },
  ];

  const handleSubmit = async (values) => {
    const payload = {
      binomeId: values.binomeId || null,
      acceptedPfa: values.acceptedpfa
        ? `PFA${new Date().getFullYear()}-${values.acceptedpfa}`
        : null,
      choices: [1, 2, 3].map((priority) => ({
        codePfa: `PFA${new Date().getFullYear()}-${
          values[`priority${priority}`]
        }`,
        priority,
      })),
    };

    try {
      const result = await updatePfaChoices(pfaId, payload); // Mettre à jour les choix du PFA
      message.success(result.message || "Mise à jour réussie !");
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error(error.message || "Erreur lors de la mise à jour.");
    }
  };

  // Affichage du composant en fonction du chargement ou des erreurs
  if (loading) {
    return (
      <Spin spinning={loading} size="small" tip="Chargement en cours..." />
    );
  }

  return (
    <FormModal
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      title={title}
      formFields={formFields}
      onSubmit={handleSubmit}
    />
  );
};

export default PfaUpdateForm;
