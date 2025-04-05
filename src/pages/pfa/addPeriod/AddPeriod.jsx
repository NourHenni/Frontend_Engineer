import React, { useState } from "react";
import FormModal from "../../../components/modals/FormModal";
import { addPeriod, publishPfas } from "../../../services/pfaServices";
import moment from "moment";
import { message, Spin } from "antd";

function AddPeriod({
  isModalOpen,
  setIsModalOpen,
  title,
  refreshData,
  source,
}) {
  console.log("source", source);
  const [formData, setFormData] = useState({
    name: "",
    date: [],
    select: "",
  });
  console.log("dates ", formData.date);

  const [loading, setLoading] = useState(false); // État pour gérer le spinner

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

  const handleSubmit = async (values) => {
    try {
      setLoading(true); // Début de l'opération, afficher le spinner

      if (values.date && values.date.length === 2) {
        const dateDebut = moment(values.date[0].$d).format("YYYY-MM-DD");
        const dateFin = moment(values.date[1].$d).format("YYYY-MM-DD");
        console.log("valudeDate", values.date);
        console.log("dateDebut", dateDebut);
        console.log("dateFin", dateFin);

        let newPeriod = {
          Nom: values.name,
          type: values.select,
        };

        // Adapter les champs selon le contexte
        if (source === "periode") {
          newPeriod.Date_Debut_depot = dateDebut;
          newPeriod.Date_Fin_depot = dateFin;
        } else if (source === "choixpfa") {
          newPeriod.dateDebutChoix = dateDebut;
          newPeriod.dateFinChoix = dateFin;
        }

        let result;

        // Appel à la fonction appropriée selon le contexte
        if (source === "periode") {
          result = await addPeriod(newPeriod);
        } else if (source === "choixpfa") {
          result = await publishPfas(newPeriod);
        }

        // Vérification du résultat et gestion des messages
        if (result && result.message) {
          message.success(result.message); // Affiche le message de succès
          refreshData(); // Rafraîchir les données
          setIsModalOpen(false); // Fermer la modal
        } else {
          message.error(result.message);
        }
      } else {
        message.error("Veuillez sélectionner une période !");
      }
    } catch (error) {
      // Loggez l'erreur complète dans la console pour déboguer
      console.error(
        "Erreur lors de l'ajout de la période : ",
        error.response ? error.response.data : error
      );

      // Si le message d'erreur est présent dans la réponse du serveur
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        message.error(error.response.data.message); // Affiche le message d'erreur retourné par le serveur
      } else {
        message.error("Une erreur s'est produite !");
      }
    } finally {
      setLoading(false); // Arrêter le spinner après la requête
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
      onChange: handleDateChange,
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
      options: [
        { value: "PFA Project", label: "PFA Project" },
        { value: "PFA CHOICE", label: "PFA CHOICE" },
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
