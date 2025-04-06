import Axios from "axios"

export const header = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
})

const API_URL = "http://localhost:5000/matieres"

// ➕ Ajouter une matière
export const addMatiere = async (matiere) => {
  const result = await Axios.post(API_URL, matiere, header())
  return result.data.model
}

// 🔄 Mettre à jour une matière
export const updateMatiere = async (id, matiere) => {
  const result = await Axios.patch(`${API_URL}/${id}`, matiere, header())
  return result.data.model
}

// ❌ Supprimer une matière
export const deleteMatiere = async (id) => {
  const result = await Axios.delete(`${API_URL}/${id}`, header())
  return result.data.model
}

// 📥 Récupérer une matière par ID
export const fetchMatiereById = async (id) => {
  const result = await Axios.get(`${API_URL}/${id}`, header())
  return result.data.model
}

// 📋 Récupérer toutes les matières
export const fetchMatieres = async () => {
  const result = await Axios.get(API_URL, header())
  return result.data.model
}

