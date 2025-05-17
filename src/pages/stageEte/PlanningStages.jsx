import React, { useEffect, useState } from "react";
import { Table, Typography, Spin, message, Card, Button } from "antd";
import { getInternshipsByTypeAndYear } from "../../services/stageServices";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Title } = Typography;

function PlanningStages() {
  const [loading, setLoading] = useState(false);
  const [stages, setStages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStages();
  }, []);

  const fetchStages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await ggetInternshipsByTypeAndYeare("premiereannee", "2024-2025", token);
      setStages(response.data);
    } catch (err) {
      message.error("Erreur lors du chargement des stages.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Étudiant",
      dataIndex: "etudiant",
      key: "etudiant",
      render: (etudiant) => `${etudiant.nom} ${etudiant.prenom}`,
    },
    {
      title: "Sujet",
      dataIndex: ["stage", "titreSujet"],
      key: "titreSujet",
    },
    {
      title: "Enseignant",
      dataIndex: "enseignant",
      key: "enseignant",
      render: (enseignant) =>
        enseignant ? `${enseignant.nom} ${enseignant.prenom}` : "Non affecté",
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginBottom: 16 }}
        >
          Retour à la liste des stages
        </Button>

        <Title level={3}>Planning des stages d'été</Title>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={stages}
            rowKey={(record) =>
              record.etudiant.email + record.stage.titreSujet
            }
            pagination={false}
            bordered
          />
        )}
      </Card>
    </div>
  );
}

export default PlanningStages;
