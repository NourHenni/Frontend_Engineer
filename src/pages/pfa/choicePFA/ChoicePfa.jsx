import React, { useEffect, useState } from "react";
import { Form, Typography, message, Spin } from "antd";
import FormModal from "../../../components/modals/FormModal";
import { submitPfaChoices } from "../../../services/pfaServices";
import axios from "axios";
import { getLastAcademicYear } from "../../../services/appServices";

const { Title } = Typography;

const PfaSelectionForm = ({ isModalOpen, setIsModalOpen, title }) => {
  const [form] = Form.useForm();
  const [pfaOptions, setPfaOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [yearPrefix, setYearPrefix] = useState("");
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 1. Get academic year and extract second part (e.g., "2026" from "2025-2026")
        const academicYearData = await getLastAcademicYear();
        console.log("Année académique:", academicYearData);
        if (academicYearData?.data.year?.includes("-")) {
          const [_, endYear] = academicYearData.data.year.split("-");
          setYearPrefix(endYear);
        }

        // 2. Get published PFA codes
        const pfaRes = await axios.get(
          "http://localhost:5000/pfa/publishedCode",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (pfaRes.data.codes.length === 0) {
          message.info(
            pfaRes.data.message || "Pas encore de sujets PFA publiés"
          );
        }

        setPfaOptions(pfaRes.data.codes);

        // 3. Get students
        const studentsRes = await axios.get(
          "http://localhost:5000/pfa/studentsPfas",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setStudents(studentsRes.data.users || []);
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
        message.error("Erreur lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

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

  const validatePfaCode = (_, value) => {
    if (!/^\d{2}$/.test(value)) {
      return Promise.reject("Format invalide (2 chiffres requis)");
    }

    const fullCode = `PFA${yearPrefix}-${value}`;
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
      addonBefore: `PFA${yearPrefix}-`,
      rules: [
        { required: true, message: "Champ requis !" },
        { validator: validatePfaCode },
        { validator: validateUniquePriority },
      ],
      inputProps: { maxLength: 2, placeholder: "01" },
    },
    {
      label: "Priorité 2",
      name: "priority2",
      type: "inputChoice",
      addonBefore: `PFA${yearPrefix}-`,
      rules: [
        { required: true, message: "Champ requis !" },
        { validator: validatePfaCode },
        { validator: validateUniquePriority },
      ],
      inputProps: { maxLength: 2, placeholder: "02" },
    },
    {
      label: "Priorité 3",
      name: "priority3",
      type: "inputChoice",
      addonBefore: `PFA${yearPrefix}-`,
      rules: [
        { required: true, message: "Champ requis !" },
        { validator: validatePfaCode },
        { validator: validateUniquePriority },
      ],
      inputProps: { maxLength: 2, placeholder: "03" },
    },
    {
      label: "Code du sujet accepté",
      name: "acceptedpfa",
      type: "inputChoice",
      addonBefore: `PFA${yearPrefix}-`,
      rules: [
        { required: false },
        ({ getFieldValue }) => ({
          validator(_, value) {
            if (value && !/^\d{2}$/.test(value)) {
              return Promise.reject("Format invalide (2 chiffres requis)");
            }
            const fullCode = `PFA${yearPrefix}-${value}`;
            if (value && !pfaOptions.includes(fullCode)) {
              return Promise.reject("Code PFA inexistant");
            }
            return Promise.resolve();
          },
        }),
        { validator: validateUniquePriority },
      ],
      inputProps: { maxLength: 2, placeholder: "03" },
    },
    {
      label: "Votre Binôme",
      name: "binomeId",
      type: "selectStudents",
      rules: [{ required: false }],
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
        ? `PFA${yearPrefix}-${values.acceptedpfa}`
        : null,
      choices: [1, 2, 3].map((priority) => ({
        codePfa: `PFA${yearPrefix}-${values[`priority${priority}`]}`,
        priority,
      })),
    };

    try {
      const result = await submitPfaChoices(payload);
      message.success(result.message || "Soumission réussie !");
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error(error.message || "Erreur lors de la soumission.");
    }
  };

  if (loading) {
    return <Spin spinning size="large" tip="Chargement en cours..." />;
  }

  if (!yearPrefix) {
    return <div>Année universitaire non disponible.</div>;
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

export default PfaSelectionForm;
