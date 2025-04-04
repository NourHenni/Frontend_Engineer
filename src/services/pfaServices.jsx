import axios from "axios";

export const addPeriod = async (period) => {
  try {
    // Effectuer l'appel POST vers la route /open
    const result = await axios.post("http://localhost:5000/pfa/open", period, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Assurez-vous d'envoyer le token d'authentification si nécessaire
      },
    });
    return result.data.model; // Retourner la réponse du serveur
  } catch (error) {
    console.error("Erreur lors de l'ajout de la période : ", error);
    throw error; // Vous pouvez renvoyer l'erreur pour qu'elle soit gérée plus haut
  }
};

export const fetchPeriod = async () => {
  try {
    const token = localStorage.getItem("token");
    const result = await axios.get("http://localhost:5000/pfa/open", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Données reçues :", result.data); // 🔍 Vérifie la structure des données

    // Accéder directement au tableau `periodes`
    return Array.isArray(result.data.periodes) ? result.data.periodes : [];
  } catch (error) {
    console.error(error);
    return []; // 🔥 Toujours retourner un tableau pour éviter les erreurs
  }
};
