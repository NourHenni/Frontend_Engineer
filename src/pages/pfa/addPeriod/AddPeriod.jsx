import React, { useState } from "react";
import FormModal from "../../../components/modals/FormModal";
import { addPeriod } from "../../../services/pfaServices"; // Import de la fonction
import moment from "moment";

function AddPeriod({ isModalOpen, setIsModalOpen, title, refreshData }) {
  const [formData, setFormData] = useState({
    name: "",
    date: [],
    select: "",
  });
  console.log(formData.date);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (values) => {
    try {
      // Si la plage de dates est définie, formater les dates
      if (values.date && values.date.length === 2) {
        values.Date_Debut_depot = moment(values.date[0]).format("YYYY-MM-DD");
        values.Date_Fin_depot = moment(values.date[1]).format("YYYY-MM-DD"); // Add the time part to match the backend
      }

      // Construire l'objet à envoyer à l'API
      const newPeriod = {
        Nom: values.name,
        Date_Debut_depot: values.Date_Debut_depot,
        Date_Fin_depot: values.Date_Fin_depot,
        type: values.select,
      };

      // Appeler la fonction pour ajouter la période (envoi à l'API)
      const result = await addPeriod(newPeriod);
      console.log("Période ajoutée avec succès : ", result);
      setIsModalOpen(false);
      refreshData();
    } catch (error) {
      console.error("Erreur lors de l'ajout de la période : ", error);
    }
  };

  const formFields = [
    {
      label: "Nom",
      name: "name",
      type: "input",
      value: formData.name,
      onChange: handleInputChange,
      rules: [
        { required: true, message: "Veuillez entrer le nom de la période !" },
      ],
    },
    {
      label: "Période",
      name: "date",
      type: "rangeDate",
      value: formData.date,
      onChange: handleInputChange,
      rules: [
        { required: true, message: "Veuillez sélectionner la période !" },
      ],
    },
    {
      label: "Type",
      name: "select",
      type: "select",
      value: formData.select,
      onChange: handleInputChange,
      options: [{ value: "PFA Project", label: "PFA Project" }],
      rules: [{ required: true, message: "Veuillez choisir le type !" }],
    },
  ];

  return (
    <div>
      <FormModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        formFields={formFields}
        title={title}
        onSubmit={handleSubmit} // Appeler handleSubmit dans AddPeriod
      />
    </div>
  );
}

export default AddPeriod;
