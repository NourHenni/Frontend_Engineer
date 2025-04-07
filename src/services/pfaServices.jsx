import axios from "axios";

export const addPeriod = async (period) => {
  try {
    // Effectuer l'appel POST vers la route /open
    const result = await axios.post("http://localhost:5000/pfa/open", period, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Assurez-vous d'envoyer le token d'authentification si nécessaire
      },
    });
    return result.data; // Retourner la réponse du serveur
  } catch (error) {
    console.error("Erreur lors de l'ajout de la période : ", error);
    throw error; // Vous pouvez renvoyer l'erreur pour qu'elle soit gérée plus haut
  }
};

export const updatePeriode = async (period) => {
  try {
    // Effectuer l'appel POST vers la route /open
    const result = await axios.patch("http://localhost:5000/pfa/open", period, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Assurez-vous d'envoyer le token d'authentification si nécessaire
      },
    });
    return result.data; // Retourner la réponse du serveur
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

export const fetchPeriodById = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const result = await axios.get(`http://localhost:5000/pfa/open/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Données reçues :", result.data);
    return result.data.periode || null; // Retourner null si periode est inexistant
  } catch (error) {
    console.error(error);
    return null; // Retourner null si une erreur se produit
  }
};

export const fetchPfas = async () => {
  const token = localStorage.getItem("token");
  const result = await axios.get("http://localhost:5000/pfa/getPfas", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return result.data.model;
};

export const publishPfas = async (period) => {
  try {
    const result = await axios.patch(
      "http://localhost:5000/pfa/publish/true",
      period,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Assurez-vous d'envoyer le token d'authentification si nécessaire
        },
      }
    );
    return result.data; // Retourner la réponse du serveur
  } catch (error) {
    console.error("Erreur lors la publication des pfas : ", error);
    throw error; // Vous pouvez renvoyer l'erreur pour qu'elle soit gérée plus haut
  }
};

export const maqsuedPfas = async () => {
  try {
    const result = await axios.patch(
      "http://localhost:5000/pfa/publish/false",
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Assurez-vous d'envoyer le token d'authentification si nécessaire
        },
      }
    );
    return result.data.message; // Retourner la réponse du serveur
  } catch (error) {
    console.error("Erreur lors la publication des pfas : ", error);
    throw error; // Vous pouvez renvoyer l'erreur pour qu'elle soit gérée plus haut
  }
};

export const sendEmail = async (period) => {
  try {
    // Effectuer l'appel POST vers la route /open
    const result = await axios.post(
      "http://localhost:5000/pfa/list/send",
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Assurez-vous d'envoyer le token d'authentification si nécessaire
        },
      }
    );
    return result.data.message;
  } catch (error) {
    console.error("Erreur lors de l'ajout de la période : ", error);
    throw error; // Vous pouvez renvoyer l'erreur pour qu'elle soit gérée plus haut
  }
};

export const fetchMyPfas = async () => {
  const token = localStorage.getItem("token");
  const result = await axios.get("http://localhost:5000/pfa/mine", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return result.data.model;
};

export const addPfa = async (pfa) => {
  try {
    // Effectuer l'appel POST vers la route /open
    const result = await axios.post("http://localhost:5000/pfa/post", pfa, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Assurez-vous d'envoyer le token d'authentification si nécessaire
      },
    });
    return result.data; // Retourner la réponse du serveur
  } catch (error) {
    console.error("Erreur lors de l'ajout de la période : ", error);
    throw error; // Vous pouvez renvoyer l'erreur pour qu'elle soit gérée plus haut
  }
};

export const updatePfa = async (id, pfa) => {
  try {
    console.log("id", id);
    const result = await axios.patch(
      `http://localhost:5000/pfa/${id}/mine`,
      pfa,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Assurez-vous d'envoyer le token d'authentification si nécessaire
        },
      }
    );
    return result.data; // Retourner la réponse du serveur
  } catch (error) {
    console.error("Erreur dans la modification du pfa : ", error);
    throw error; // Vous pouvez renvoyer l'erreur pour qu'elle soit gérée plus haut
  }
};

export const fetchPublishedPfas = async () => {
  const token = localStorage.getItem("token");
  const result = await axios.get("http://localhost:5000/pfa/getPublishedPfas", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return result.data.model;
};

export const submitPfaChoices = async (data) => {
  try {
    const response = await axios.patch(
      "http://localhost:5000/pfa/choiceSubject",
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur inconnue" };
  }
};
