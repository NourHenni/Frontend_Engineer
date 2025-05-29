import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Card, Spin, Result, Descriptions, Typography, Tag } from "antd";

import dayjs from "dayjs";

import { getMyAffectationByType } from "../../../services/stageServices";

const { Title, Text } = Typography;

function AffectationView() {
  const { type } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchAffectation = useCallback(async () => {
    console.log(`Fetching affectation for type: ${type}`);
    try {
      const token = localStorage.getItem("token");
      const response = await getMyAffectationByType(type, token);
      setData(response);
      setErrorMsg("");
      console.log("Affectation data:", response);
    } catch (error) {
      console.error("Error fetching affectation:", error);

      setErrorMsg(
        error.response?.data?.message ||
          error.message ||
          "Erreur lors de la récupération de l'affectation."
      );
      setData(null);
    } finally {
    }
  }, [type]);

  useEffect(() => {
    setLoading(true);
    fetchAffectation().finally(() => setLoading(false));
  }, [fetchAffectation]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("AffectationView became visible, re-fetching data...");

        fetchAffectation();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchAffectation]);

  if (loading) return <Spin fullscreen tip="Chargement de l'affectation..." />;

  if (errorMsg && !data) {
    return (
      <Result
        status="warning"
        title="Impossible de charger l'affectation"
        subTitle={errorMsg}
      />
    );
  }

  if (!data) {
    return (
      <Result
        status="info"
        title="Aucune affectation trouvée"
        subTitle="Aucune affectation n'est disponible pour ce type de stage."
      />
    );
  }

  const { stage, enseignant, soutenance } = data;

  if (!stage) {
    return (
      <Result
        status="error"
        title="Données de stage manquantes"
        subTitle="Les informations sur le stage n'ont pas pu être chargées correctement."
      />
    );
  }

  return (
    <Card
      title={`Détail Affectation - ${
        type === "premiereannee" ? "1ère Année" : "2ème Année"
      }`}
      bordered
    >
      {errorMsg && (
        <Result
          status="error"
          title="Erreur lors du rafraîchissement"
          subTitle={errorMsg}
          style={{ marginBottom: 16 }}
        />
      )}

      <Descriptions column={1} bordered>
        <Descriptions.Item label="Titre du sujet">
          {stage.titreSujet || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Entreprise">
          {stage.nomEntreprise || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Description">
          {stage.description || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Année du stage">
          {stage.anneeStage || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Niveau">
          {stage.niveau || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Nature du sujet">
          {stage.natureSujet || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label={<Text strong>Statut Sujet</Text>}>
          <Tag color={stage.statutSujet === "Valide" ? "success" : "error"}>
            {stage.statutSujet || "N/A"}
          </Tag>
        </Descriptions.Item>
        {stage.statutSujet === "Non valide" && (
          <Descriptions.Item label={<Text strong>Raison d'invalidation</Text>}>
            {stage.raison || "Non spécifiée"}
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Enseignant Affecté">
          {enseignant ? (
            <>
              {enseignant.nom} {enseignant.prenom} (
              {enseignant.adresseEmail ||
                enseignant.email ||
                "Email non fourni"}
              )
            </>
          ) : (
            <Tag color="orange">Non affecté</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Soutenance">
          {soutenance ? (
            <>
              Jour :{" "}
              {soutenance.jour
                ? dayjs(soutenance.jour).format("DD/MM/YYYY")
                : "N/A"}{" "}
              <br />
              Horaire : {soutenance.horaire || "N/A"} <br />
              Lien :{" "}
              {soutenance.lien ? (
                <a
                  href={soutenance.lien}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {soutenance.lien}
                </a>
              ) : (
                "N/A"
              )}
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
