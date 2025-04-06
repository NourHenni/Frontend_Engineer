import React, { useState, useEffect } from "react";
import { Modal, Table } from "antd";
import axios from "axios";

const ChoicesModal = ({ record, visible, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [choicesData, setChoicesData] = useState([]);

  // Fonction pour récupérer les choix de PFA depuis l'API avec l'ID du sujet
  const fetchPfaChoices = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/pfa/pfasChoice/${record._id}`, // Utilisation de l'ID du sujet (record._id)
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("response", response);
      setChoicesData(response.data.sujet.choices); // On récupère les choix associés à ce sujet
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des choix de PFA", error);
      setLoading(false);
    }
  };

  // Appeler la fonction fetchPfaChoices lorsque la modale s'ouvre
  useEffect(() => {
    if (visible) {
      fetchPfaChoices();
    }
  }, [visible, record]); // Ajout de 'record' comme dépendance pour éviter la mise à jour des données lors de l'ouverture de la modale

  return (
    <Modal
      title={`Choix pour le sujet: ${record.titreSujet}`}
      visible={visible}
      onCancel={onClose}
      width={1200}
      bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
      footer={null}
    >
      <div>
        {loading ? (
          <div>Chargement...</div>
        ) : choicesData.length > 0 ? (
          <Table
            columns={[
              { title: "Priorité", dataIndex: "priority", key: "priority" },
              {
                title: "Étudiants",
                key: "etudiants",
                render: (choice) => (
                  <>
                    {choice.etudiantsIds.length > 0 ? (
                      choice.etudiantsIds.map((etudiant, idx) => (
                        <span key={etudiant._id}>
                          {etudiant.nom} {etudiant.prenom}
                          {idx < choice.etudiantsIds.length - 1 ? ", " : ""}
                        </span>
                      ))
                    ) : (
                      <span>Aucun étudiant</span>
                    )}
                  </>
                ),
              },
              {
                title: "Binômes",
                key: "binomes",
                render: (choice) => (
                  <>
                    {choice.binomeIds.length > 0 ? (
                      choice.binomeIds.map((binome, idx) => (
                        <span key={idx}>
                          {binome.etudiantId.nom} {binome.etudiantId.prenom}{" "}
                          &amp; {binome.binomeId.nom} {binome.binomeId.prenom}
                          {idx < choice.binomeIds.length - 1 ? ", " : ""}
                        </span>
                      ))
                    ) : (
                      <span>Aucun binôme</span>
                    )}
                  </>
                ),
              },
              {
                title: "Acceptations",
                key: "acceptations",
                render: (choice) => (
                  <>
                    {choice.acceptedPfa.etudiantsAcceptedIds.length > 0 ? (
                      choice.acceptedPfa.etudiantsAcceptedIds.join(", ")
                    ) : // Afficher le nom et prénom de l'enseignant
                    choice.acceptedPfa.enseignant ? (
                      <span>
                        {choice.enseignant.prenom} {choice.enseignant.nom}
                      </span>
                    ) : (
                      <span>Aucun enseignant</span>
                    )}
                  </>
                ),
              },
            ]}
            dataSource={choicesData} // Utilisation de choicesData au lieu de record.choices
            rowKey={(choice, idx) => idx}
          />
        ) : (
          <div>Aucun choix effectué</div>
        )}
      </div>
    </Modal>
  );
};

export default ChoicesModal;
