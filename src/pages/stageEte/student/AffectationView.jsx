// pages/student/AffectationView.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Spin, Result, Descriptions, Typography, Tag } from "antd";
import { getMyAffectationByType } from "../../../services/stageServices";

;
const { Title, Text } = Typography;

function AffectationView() {
  const { type } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchAffectation = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await getMyAffectationByType(type, token);
        setData(response);
        console.log(response)
      } catch (error) {
        setErrorMsg(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAffectation();
  }, [type]);

  if (loading) return <Spin fullscreen />;

  if (errorMsg) {
    return (
      <Result
        status="warning"
        title="Aucune affectation disponible"
        subTitle={errorMsg}
      />
    );
  }

  const { stage, enseignant, soutenance } = data;

  return (
    <Card title={`Détail Affectation - ${type === "premiereannee" ? "1ère Année" : "2ème Année"}`} bordered>
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Titre du sujet">{stage.titreSujet}</Descriptions.Item>
        <Descriptions.Item label="Entreprise">{stage.nomEntreprise}</Descriptions.Item>
        <Descriptions.Item label="Description">{stage.description}</Descriptions.Item>
        <Descriptions.Item label="Année du stage">{stage.anneeStage}</Descriptions.Item>
        <Descriptions.Item label="Niveau">{stage.niveau}</Descriptions.Item>
        <Descriptions.Item label="Nature du sujet">{stage.natureSujet}</Descriptions.Item>
        <Descriptions.Item label={<Text strong>Statut</Text>}>
                
                  <Tag color={stage.statutSujet === "Valide" ? "success" : "error"}>
                    Statut: {stage.statutSujet}
                  </Tag>
        </Descriptions.Item>
        {stage.statutSujet === "Non valide" && (
          <Descriptions.Item label={<Text strong>Raison d'invalidation</Text>}>
            {stage.raison
              ? stage.raison
              : "Stage non encore validé"}
          </Descriptions.Item>
)}

        
        <Descriptions.Item label="Enseignant Affecté">
          {enseignant ? (
            <>
              {enseignant.nom} {enseignant.prenom} ({enseignant.adresseEmail})
            </>
          ) : (
            <Tag color="orange">Non affecté</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Soutenance">
          {soutenance ? (
            <>
              Jour : {soutenance.jour} <br />
              Horaire : {soutenance.horaire} <br />
              Lien :{" "}
              <a href={soutenance.lien} target="_blank" rel="noopener noreferrer">
                {soutenance.lien}
              </a>
            </>
          ) : (
            <Tag color="orange">Non planifiée</Tag>
          )}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}

export default AffectationView;
