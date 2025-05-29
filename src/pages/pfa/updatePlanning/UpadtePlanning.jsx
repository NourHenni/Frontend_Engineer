import { useEffect, useState } from "react";
import FormModal from "../../../components/modals/FormModal";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { updateSoutenance } from "../../../services/pfaServices";
import { message } from "antd";
import axios from "axios";
function UpdatePlanning({
  isModalOpen,
  setIsModalOpen,
  title,
  soutenances,
  refreshMyData,
  formData,
  setFormData,
  selectedsoutenanceId,
}) {
  dayjs.extend(utc);
  const [loading, setLoading] = useState(false);
  const [enseignants, setEnseignants] = useState([]);

  const prefillFormData = () => {
    if (soutenances && soutenances.length > 0) {
      const soutenance = soutenances.find(
        (item) => item._id === selectedsoutenanceId
      );

      if (soutenance) {
        console.log("RAW values before setFormData:", {
          date: soutenance.date_soutenance,
          heure: soutenance.heure_soutenance,
          dayjsDate: dayjs(soutenance.date_soutenance),
          dayjsHeure: dayjs(soutenance.heure_soutenance, "HH:mm"),
        });

        setFormData({
          date_soutenance: soutenance.date_soutenance
            ? dayjs.utc(soutenance.date_soutenance)
            : null,
          heure_soutenance: soutenance.heure_soutenance
            ? dayjs(soutenance.heure_soutenance, "HH:mm")
            : null,
          salle: soutenance.salle || "",
          rapporteur: soutenance.rapporteur ?? null,
        });
      }
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      prefillFormData();
    }
  }, [isModalOpen, soutenances]);

  useEffect(() => {
    const fetchEnseignants = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/pfa/enseignants/pfas",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const enseignants = response.data; // Liste des étudiants
        setEnseignants(enseignants);
      } catch (error) {
        console.error("Erreur", error);
      }
    };

    fetchEnseignants();
  }, []);

  const handleSubmit = async (values) => {
    try {
      console.log("Valeurs brutes du formulaire :", values);
      console.log("Type de heure_soutenance :", typeof values.heure_soutenance);
      console.log("Valeur heure_soutenance (dayjs) :", values.heure_soutenance);

      // Assurez-vous d'envoyer une chaîne "HH:mm"
      const heureFormatée = values.heure_soutenance
        ? dayjs(values.heure_soutenance).format("HH:mm")
        : null;

      let newPlanning = {
        date_soutenance: values.date_soutenance,
        heure_soutenance: heureFormatée,
        salle: values.salle,
        rapporteur: values.rapporteur,
      };

      console.log("Données envoyées au backend (newPlanning) :", newPlanning);

      const SoutenanceId = selectedsoutenanceId;

      if (!SoutenanceId) {
        message.error("L'ID du planning est manquant.");
        return;
      }

      const response = await updateSoutenance(SoutenanceId, newPlanning);
      console.log("Réponse backend :", response);

      if (response && response.message) {
        message.success(response.message);
        setLoading(true);
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

  const formFields = [
    {
      label: "Date de la soutenance",
      name: "date_soutenance",
      type: "date",
    },
    {
      label: "Heure de soutenance",
      name: "heure_soutenance",
      type: "time",
    },
    {
      label: "Salle de soutenance",
      name: "salle",
      type: "input",

      rules: [
        { required: true, message: "Veuillez entrer le titre du sujet !" },
      ],
    },

    {
      label: "Rapporteur",
      name: "rapporteur",
      type: "selectEnseignats",
      rules: [
        {
          required: false,
          message: "Champ requis !",
        },
      ],
      selectProps: {
        options: enseignants.map((e) => ({
          label: `${e.nom} ${e.prenom}`,
          value: e._id,
        })),
        placeholder: "Sélectionner rapporteur",
        allowClear: true,
      },
    },
  ];
  return (
    <div>
      <FormModal
        isModalOpen={isModalOpen}
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

export default UpdatePlanning;
