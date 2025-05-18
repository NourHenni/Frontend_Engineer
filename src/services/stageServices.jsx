import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';


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

export const getInternshipsByTypeAndYear = async (type, anneeStage
, token) => {
  const response = await axios.get(
    `http://localhost:5000/internship/filter/${type}/${anneeStage
}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
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





export const updateAssignedTeacher = async (type, stageId, teacherId , token) => {
  try {
    const response = await axios.patch(`http://localhost:5000/internship/${type}/planning/update`, {
      stageId,
      teacherId,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data.success) {
      console.log('Mise à jour réussie :', response.data.message);
      return response.data;
    } else {
      console.error('Échec de la mise à jour :', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('Erreur API :', error.response?.data?.message || error.message);
    return null;
  }
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


export const getMyAffectationByType = async (type, token) => {
  const response = await fetch(`http://localhost:5000/internship/monpv/${type}/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Erreur lors de la récupération du stage");
  }

  return await response.json();
};

export const togglePlanningVisibility = async (type, publishStatus) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `http://localhost:5000/internship/${type}/planning/publish/${publishStatus}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur API :', error.response?.data?.message || error.message);
    throw error;
  }
};
export const addPeriod = (data, token) => {
  return axios.post(`http://localhost:5000/internship/open`, data, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const getAllPeriods = (token) =>
  axios.get(`http://localhost:5000/internship/periodes`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updatePeriod = async (id, payload, token) => {
  return await axios.patch(`http://localhost:5000/internship/updateperiode/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}` 
    },
  });
};


export const deletePeriod = (id, token) =>
  axios.delete(`http://localhost:5000/periode/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
