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



export const updateAssignedTeacher = async (niveau, data, token) => {
  const response = await axios.put(
    `http://localhost:5000/internship/${type}/planning/update`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const getAssignedStages = async (niveau, token) => {
  const response = await fetch(`http://localhost:5000/internship/${niveau}/assign/tome`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Erreur lors du chargement des stages assignés");
  }
  return data.stages;
};






  