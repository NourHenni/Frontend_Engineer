import ButtonModel from "../../../components/button/Button";
import Navbar from "../../../components/navbar/Navbar";
import SidebarLayout from "../../../components/sidebar/Sidebar";
import { useEffect, useState } from "react";
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  MailFilled,
} from "@ant-design/icons";
import TableData from "../../../components/table/TableData";
import "./ListeAffectedPfa.css";
import {
  automatedAssignment,
  fetchPublishedPfas,
  maskedffectedPfas,
  publishAffectedPfas,
  sendAffectedEmail,
} from "../../../services/pfaServices";
import { message, Space, Tag } from "antd";
import ManuelAssignment from "../manualAssignment/ManuelAssignment";
import { useNavigate } from "react-router-dom";

function ListeAffectedPfa() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(4); //
  const [currentPage, setCurrentPage] = useState(1);
  const [pfas, setPfas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPfaId, setSelectedPfaId] = useState(null);

  useEffect(() => {
    const loadPfas = async () => {
      const data = await fetchPublishedPfas();
      console.log("pfas récupérée", data);

      setPfas(data);
      setLoading(false);
    };

    loadPfas();
  }, []);

  const paginatedData = pfas.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );
  const pagination = {
    current: currentPage,
    pageSize: limit,
    total: pfas.length,
  };

  const handlePaginationChange = (page, pageSize) => {
    setCurrentPage(page); // Mettre à jour la page courante
    setLimit(pageSize); // Mettre à jour la taille de la page
  };

  const handleAffectedPfa = async () => {
    try {
      setLoading(true);
      const response = await automatedAssignment();

      if (response.success) {
        message.success(response.message);
      } else {
        message.warning(response.message || "Une erreur est survenue.");
      }

      const updatedPfas = await fetchPublishedPfas();
      setPfas(updatedPfas);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Erreur inattendue.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishedPfa = async () => {
    try {
      setLoading(true);
      const response = await publishAffectedPfas();

      if (response) {
        message.success(response.message);
      } else {
        message.warning(response.message);
      }

      const updatedPfas = await fetchPublishedPfas();
      setPfas(updatedPfas);
    } catch (error) {
      const errorMessage = error?.response?.data?.message;
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMasquedPfa = async () => {
    try {
      setLoading(true);
      const response = await maskedffectedPfas();

      if (response) {
        message.success(response.message);
      } else {
        message.warning(response.message);
      }

      const updatedPfas = await fetchPublishedPfas();
      setPfas(updatedPfas);
    } catch (error) {
      const errorMessage = error?.response?.data?.message;
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sendAffectedePfas = async () => {
    try {
      setLoading(true);
      const result = await sendAffectedEmail();
      console.log("result", result);
      message.success(result); // Le serveur retourne déjà un `message` explicite
      const updatedPfas = await fetchPublishedPfas();
      setPfas(updatedPfas);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Une erreur est survenue";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onAffectPfa = (info) => {
    setIsModalOpen(true);
    console.log("info passé à onUpdatePfa", info);

    const pfasdata = pfas.find((pfa) => pfa._id === info._id);
    console.log("pfasdata", pfasdata);

    if (pfasdata) {
      setSelectedPfaId(pfasdata._id); // <<< ICI on enregistre l'ID !
    } else {
      console.error("pfa non trouvée");
    }
  };

  const refreshMyData = async () => {
    const data = await fetchPublishedPfas();
    setPfas(data); // Mettre à jour l'état avec les données récupérées
  };

  const handleNavigate = () => {
    navigate("/home/listeSoutenancesPfa");
  };

  const columns = [
    { title: "Code PFA", dataIndex: "code_pfa", key: "code" },
    { title: "Titre du sujet", dataIndex: "titreSujet", key: "titreSujet" },
    {
      title: "Binome",
      dataIndex: "estBinome",
      key: "estBinome",
      render: (binome) => (binome ? "Oui" : "Non"),
    },
    {
      title: "Enseignant",
      dataIndex: "enseignant",
      key: "enseignant",
      render: (enseignant) => `${enseignant.nom} ${enseignant.prenom}`,
    },
    {
      title: "Étudiants",
      dataIndex: "etudiants",
      key: "etudiants",
      render: (etudiants) => (
        <>
          {etudiants && etudiants.length > 0
            ? etudiants.map((etudiant, index) => (
                <div key={index}>
                  {etudiant.nom} {etudiant.prenom}
                </div>
              ))
            : null}
        </>
      ),
    },
    {
      title: "État Affectation",
      dataIndex: "etatAffectation",
      key: "etatAffectation",
      render: (etat) => {
        let color = "red";
        let text = "Non affecté";

        if (etat === "affected") {
          color = "green";
          text = "Affecté";
        } else if (etat === "published") {
          color = "blue";
          text = "Publié";
        } else if (etat === "masked") {
          color = "orange";
          text = "Masqué";
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => onAffectPfa(record)}>
            Affecter manuellement ce sujet
          </a>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Navbar />
      <SidebarLayout collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="table-container">
        <h3>Liste des sujets PFA affecté</h3>
        <div className="table-header">
          <>
            <ButtonModel
              text="Lancer l'affectation automatique"
              onClick={handleAffectedPfa}
              icon={<EyeOutlined />}
            />
            <ButtonModel
              text="Publier les sujets"
              onClick={handlePublishedPfa}
              icon={<EyeOutlined />}
            />
            <ButtonModel
              text="Masquer les sujets"
              onClick={handleMasquedPfa}
              icon={<EyeInvisibleOutlined />}
            />
            <ButtonModel
              text="Envoyer la liste actuelle"
              onClick={sendAffectedePfas}
              icon={<MailFilled />}
            />
            <ButtonModel
              text="Consulter la liste des soutenances"
              onClick={handleNavigate}
              icon={<EyeOutlined />}
            />
          </>
        </div>
        <TableData
          columns={columns}
          data={paginatedData}
          loading={loading}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}

          // Passer la fonction pour gérer la pagination
        />
      </div>
      {isModalOpen && (
        <ManuelAssignment
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          title={"Affecter manuellement"}
          refreshMyData={refreshMyData}
          pfas={pfas}
          selectedPfaId={selectedPfaId} // <<< Important !
        />
      )}
    </div>
  );
}

export default ListeAffectedPfa;
