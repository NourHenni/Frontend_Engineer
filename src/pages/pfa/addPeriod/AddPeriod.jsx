import React, { useState } from "react";
import FormModal from "../../../components/modals/FormModal";
import { addPeriod, publishPfas } from "../../../services/pfaServices";
import dayjs from "dayjs"; // 👈 Préférer dayjs (plus léger et moderne)
import { message, Spin } from "antd";

// 🔹 Fonction utilitaire : formater les dates
const formatDateRange = (dateRange) => {
  if (!dateRange || dateRange.length !== 2) return null;
  
  const [start, end] = dateRange;
  return {
    debut: dayjs(start).format("YYYY-MM-DD"),
    fin: dayjs(end).format("YYYY-MM-DD"),
  };
};

// 🔹 Fonction métier : créer la période selon la source
const buildPeriodPayload = (values, source, formattedDates) => {
  const base = {
    Nom: values.name,
    type: values.select,
  };

  if (source === "periode") {
    return {
      ...base,
      Date_Debut_depot: formattedDates.debut,
      Date_Fin_depot: formattedDates.fin,
    };
  }

  if (source === "choixpfa") {
    return {
      ...base,
      dateDebutChoix: formattedDates.debut,
      dateFinChoix: formattedDates.fin,
    };
  }

  throw new Error(`Source invalide : ${source}`);
};

// 🔹 Fonction API : appeler le bon service
const callApiBySource = async (source, payload) => {
  if (source === "periode") {
    return await addPeriod(payload);
  }
  if (source === "choixpfa") {
    return await publishPfas(payload);
  }
  throw new Error(`Source API non supportée : ${source}`);
};

function AddPeriod({ isModalOpen, setIsModalOpen, title, refreshData, source }) {
  const [formData, setFormData] = useState({
    name: "",
    date: [],
    select: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDateChange = (dates) => {
    setFormData((prevState) => ({
      ...prevState,
      date: dates,
    }));
  };

  // ✅ handleSubmit refactoré (complexité < 10)
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const formattedDates = formatDateRange(values.date);
      if (!formattedDates) {
        message.error("Veuillez sélectionner une période !");
        return;
      }

      const payload = buildPeriodPayload(values, source, formattedDates);
      const result = await callApiBySource(source, payload);

      if (result?.message) {
        message.success(result.message);
        refreshData();
        setIsModalOpen(false);
      } else {
        message.error("Réponse inattendue du serveur.");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la période :", error);

      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Une erreur s'est produite !";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    {
      label: "Nom",
      name: "name",
      type: "input",
      value: formData.name,
      onChange: handleInputChange,
      rules: [{ required: true, message: "Veuillez entrer le nom de la période !" }],
    },
    {
      label: "Période",
      name: "date",
      type: "rangeDate",
      value: formData.date,
      onChange: handleDateChange,
      rules: [{ required: true, message: "Veuillez sélectionner la période !" }],
    },
    {
      label: "Type",
      name: "select",
      type: "select",
      value: formData.select,
      onChange: handleInputChange,
      options: [
        source === "periode"
          ? { value: "PFA Project", label: "PFA Project" }
          : { value: "PFA CHOICE", label: "PFA CHOICE" },
      ],
      rules: [{ required: true, message: "Veuillez choisir le type !" }],
    },
  ];

  return (
    <div>
      <Spin spinning={loading} size="large" tip="Chargement en cours...">
        <FormModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          formFields={formFields}
          title={title}
          onSubmit={handleSubmit}
        />
      </Spin>
    </div>
  );
}

export default AddPeriod;