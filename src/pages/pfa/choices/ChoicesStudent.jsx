// import React, { useEffect, useState } from "react";
// import { Modal, Table } from "antd";
// import axios from "axios";

// const MyChoicesModal = ({ visible, onClose }) => {
//   const [loading, setLoading] = useState(true);
//   const [choicesData, setChoicesData] = useState([]);

//   const fetchMyChoices = async () => {
//     try {
//       const response = await axios.get("http://localhost:5000/pfa/getChoices", {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });

//       console.log("Mes choix :", response.data);
//       setChoicesData(response.data.choices); // adapter à la structure retournée par ton backend
//       setLoading(false);
//     } catch (error) {
//       console.error("Erreur lors de la récupération des choix", error);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (visible) {
//       fetchMyChoices();
//     }
//   }, [visible]);

//   const columns = [
//     {
//       title: "Sujet choisi",
//       dataIndex: "titreSujet",
//       key: "titreSujet",
//       render: (_, record) => record.sujet?.titreSujet || "Titre indisponible",
//     },
//     {
//       title: "Priorité",
//       dataIndex: "priority",
//       key: "priority",
//     },
//     {
//       title: "Encadrant",
//       key: "enseignant",
//       render: (_, record) =>
//         record.sujet?.enseignant
//           ? `${record.sujet.enseignant.prenom} ${record.sujet.enseignant.nom}`
//           : "Non spécifié",
//     },
//     {
//       title: "Statut",
//       key: "status",
//       render: (_, record) => (record.accepted ? "Accepté" : "En attente"),
//     },
//   ];

//   return (
//     <Modal
//       title="Mes choix de PFA"
//       visible={visible}
//       onCancel={onClose}
//       width={1000}
//       footer={null}
//     >
//       {loading ? (
//         <p>Chargement...</p>
//       ) : choicesData.length > 0 ? (
//         <Table
//           columns={columns}
//           dataSource={choicesData}
//           rowKey={(choice, index) => index}
//         />
//       ) : (
//         <p>Aucun choix effectué.</p>
//       )}
//     </Modal>
//   );
// };

// export default MyChoicesModal;
