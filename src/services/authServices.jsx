// Fonction pour récupérer les informations de l'utilisateur après connexion
import axios from "axios";
export const fetchUserInfo = async () => {
  const response = await axios.get("http://localhost:5000/auth/me", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`, // Assurez-vous d'envoyer le token d'authentification si nécessaire
    },
  });

  if (response.status === 200) {
    // Stocker l'utilisateur dans le contexte
    return response.data.model;
  } else {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    message.error("Impossible de récupérer les informations utilisateur.");
  }
};
