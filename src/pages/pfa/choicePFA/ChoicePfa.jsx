import React from "react";
import { Form, Typography, Input, message } from "antd";
import FormModal from "../../../components/modals/FormModal";

const { Title } = Typography;

const PfaSelectionForm = ({ isModalOpen, setIsModalOpen, title }) => {
  const [form] = Form.useForm();

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

    const fullCode = `PFA2024-${value}`;
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
      addonBefore: "PFA2024-",
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
      addonBefore: "PFA2024-",
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
      addonBefore: "PFA2024-",
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
      label: "Code du sujet accepté ",
      name: "acceptedpfa",
      type: "inputChoice",
      addonBefore: "PFA2024-",
      rules: [
        { required: false, message: "Champ requis !" },
        { validator: validatePfaCode },
        { validator: validateUniquePriority },
      ],
      inputProps: {
        maxLength: 2,
        placeholder: "03",
      },
    },
    {
      label: "Votre Binome",
      name: "binomeId",
      type: "input",
      rules: [{ required: false, message: "Champ requis !" }],
    },
  ];

  const handleSubmit = (values) => {
    const result = {
      binomeId: values.binomeId,
      choices: [1, 2, 3].map((priority) => ({
        codePfa: `PFA2024-${values[`priority${priority}`]}`,
        priority,
      })),
    };

    console.log("Soumission validée :", result);
    message.success("Soumission réussie !");

    setIsModalOpen(false);
    form.resetFields();
  };

  return (
    <FormModal
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      title={title}
      formFields={formFields}
      onFinish={handleSubmit}
    />
  );
};

export default PfaSelectionForm;
