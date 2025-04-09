import axios from "axios";

export const postInternship = async (type, formData, token) => {
  
  try {
    const response = await axios.post(
      `http://localhost:5000/internship/${type}/post`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur inconnue" };
  }
};

export const getInternshipsByType = async (type, token) => {
  const response = await axios.get(`http://localhost:5000/internship/${type}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getEnseignants = async (token) => {
  return await axios.get(`http://localhost:5000/teachers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const assignTeachersToStages = async (type, teacherIds, token) => {
  return await axios.post(
    `http://localhost:5000/internship/${type}/planning/assign`,
    { teacherIds },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};



  