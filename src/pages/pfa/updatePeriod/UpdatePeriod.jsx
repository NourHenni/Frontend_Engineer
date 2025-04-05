import { useEffect, useState } from "react";
import { message } from "antd"; // N'oublie pas d'importer message d'Ant Design
import FormModal from "../../../components/modals/FormModal";
import { updatePeriode } from "../../../services/pfaServices"; // Assure-toi que cette fonction existe
import moment from "moment";

function UpdatePeriod({
  isModalOpen,
  setIsModalOpen,
  title,
  formData,
  setFormData,
  periodData,
  refreshData,
}) {
  const [loading, setLoading] = useState(false);

  // Si la période est déjà passée en props (periodData), on pré-remplit les données dans formData
  const prefillFormData = () => {
    if (periodData) {
      setFormData({
        name: periodData.Nom || "",
        date: [
          moment(periodData.Date_Debut_depot),
          moment(periodData.Date_Fin_depot),
        ],
        select: periodData.type || "",
      });
    }
  };

  // Pré-remplir les données au premier rendu du modal
  useEffect(() => {
    if (isModalOpen) {
      prefillFormData();
    }
  }, [isModalOpen, periodData]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      if (values.date && values.date.length === 2) {
        const dateDebut = moment(values.date[0].$d).format("YYYY-MM-DD");
        const dateFin = moment(values.date[1].$d).format("YYYY-MM-DD");

        let newPeriod = {
          Date_Debut_depot: dateDebut,
          Date_Fin_depot: dateFin,
        };

        const updatedPeriod = await updatePeriode(newPeriod); // Envoie les données mises à jour
        console.log(updatedPeriod); // Pour déboguer et vérifier les données retournées

        // Vérification du résultat et gestion des messages
        if (updatedPeriod && updatedPeriod.message) {
          message.success(updatedPeriod.message); // Affiche le message de succès
          refreshData(); // Rafraîchir les données
          setIsModalOpen(false); // Fermer la modal
        } else {
          message.error(updatedPeriod.message || "Erreur inconnue");
        }
      } else {
        message.error("Veuillez sélectionner une période !");
      }
    } catch (error) {
      // Loggez l'erreur complète dans la console pour déboguer
      console.error("Erreur lors de la mise à jour de la période : ", error);

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

  const handleDateChange = (dates) => {
    setFormData((prevState) => ({
      ...prevState,
      date: dates,
    }));
  };

  const formFields = [
    {
      label: "Période",
      name: "date",
      type: "rangeDate",
      onChange: handleDateChange,
      rules: [
        { required: true, message: "Veuillez sélectionner la période !" },
      ],
    },
  ];

  return (
    <div>
      <FormModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        formFields={formFields}
        title={title}
        formData={formData} // Passe formData ici
        onSubmit={handleSubmit}
        loading={loading} // Passe également l'état de chargement pour gérer le spinner dans FormModal
      />
    </div>
  );
}

export default UpdatePeriod;
