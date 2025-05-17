const API_BASE_URL = "http://localhost:5000";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};

// Fetch all students
export const fetchStudents = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/students`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) throw new Error("Failed to fetch students");

        const result = await response.json();
        return result.model || [];
    } catch (error) {
        throw new Error(error.message);
    }
};

// Fetch student by ID

export const fetchStudentById = async (id) => {
    try {
        console.log("Fetching student with ID:", id); // Debug log to check the ID being passed
        const response = await fetch(`${API_BASE_URL}/students/${id}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            // If response is not OK, capture the error message from the server
            const errorMessage = await response.text();
            throw new Error(`Failed to fetch student: ${errorMessage}`);
        }

        const data = await response.json();  // Parse the JSON response
        console.log("Student data fetched successfully:", data);  // Debug log to check the returned data
        return data;
    } catch (error) {
        console.error("Error fetching student data:", error);  // Improved error logging
        throw new Error(error.message);  // Rethrow the error message for further handling
    }
};


// Create a new student
export const createStudent = async (studentData) => {
    try {
      console.log("Sending POST request to create student with data:", studentData);
      const response = await fetch(`${API_BASE_URL}/students`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(studentData),
      });
  
      // Log the status of the response
      console.log("Response status:", response.status);
      
      // Check if the response is okay (status in the range 200-299)
      if (!response.ok) {
        const errorText = await response.text();  // Get the error message from response
        console.error("Failed to create student, error details:", errorText);
        throw new Error(`Failed to create student. Status: ${response.status}. Response: ${errorText}`);
      }
  
      // Log the success response data
      const data = await response.json();
      console.log("Student created successfully:", data);
  
      return data;
    } catch (error) {
      console.error("Error during student creation:", error);
      throw new Error(`Error during student creation: ${error.message}`);
    }
  };

// Update a student


export const updateStudent = async (id, updatedData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${id}`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to update student");
        }

        return await response.json();
    } catch (error) {
        throw new Error(error.message);
    }
};
export const updateStudentPassword = async (id, { newPassword, confirmPassword }) => {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${id}/password`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                nouveau: newPassword,
                confirmationNouveau: confirmPassword,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error updating password");
        }
        return response.json(); // Return the response
    } catch (error) {
        throw error; // Catch any errors and throw
    }
};
export const deleteStudent = async (id) => {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      body: JSON.stringify({ action: "delete" }),
    });
  
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Failed to delete student: ${errorMessage}`);
    }
  
    return await response.json();
  };
  
// Fetch all teachers
export const fetchTeachers = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/teachers`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) throw new Error("Failed to fetch teachers");

        const result = await response.json();
        return result.model || [];
    } catch (error) {
        throw new Error(error.message);
    }
};
// Fetch student CV by ID
export const fetchStudentCV = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${id}/CV`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch student CV: ${errorText}`);
        }

        const data = await response.json(); // Assuming the CV is returned as JSON
        return data;
    } catch (error) {
        console.error("Error fetching student CV:", error);
        throw new Error(error.message);
    }
};

// Fetch teacher by ID
export const fetchTeacherById = async (id) => {
    try {
        console.log("Fetching teacher with ID:", id); // Debug log to check the ID being passed
        const response = await fetch(`${API_BASE_URL}/teachers/${id}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            // If response is not OK, capture the error message from the server
            const errorMessage = await response.text();
            throw new Error(`Failed to fetch teacher: ${errorMessage}`);
        }

        const data = await response.json();  // Parse the JSON response
        console.log("Teacher data fetched successfully:", data);  // Debug log to check the returned data
        return data;
    } catch (error) {
        console.error("Error fetching teacher data:", error);  // Improved error logging
        throw new Error(error.message);  // Rethrow the error message for further handling
    }
};



// Create a new teacher
export const createTeacher = async (teacherData) => {
    try {
      console.log("Sending POST request to create teacher with data:", teacherData);
      const response = await fetch(`${API_BASE_URL}/teachers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(), // Include auth headers if needed
        },
        body: JSON.stringify(teacherData),
      });
  
      console.log("Response status:", response.status);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to create teacher, error details:", errorText);
        throw new Error(`Failed to create teacher. Status: ${response.status}. Response: ${errorText}`);
      }
  
      const data = await response.json();
      console.log("Teacher created successfully:", data);
      return data;
    } catch (error) {
      console.error("Error during teacher creation:", error);
      throw new Error(`Error during teacher creation: ${error.message}`);
    }
  };
  
  export const updateTeacherById = async (id, updatedData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/teachers/${id}`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to update teacher");
        }

        return await response.json();
    } catch (error) {
        throw new Error(error.message);
    }
};

export const updateTeacherPassword = async (id, { newPassword, confirmPassword }) => {
    try {
        const response = await fetch(`${API_BASE_URL}/teachers/${id}/password`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                nouveau: newPassword, // Send the new password
                confirmationNouveau: confirmPassword, // Send the confirmation of the new password
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error updating password");
        }
        return response.json(); // Return the response
    } catch (error) {
        throw error; // Catch any errors and throw
    }
};

  export const deleteTeacher = async (id) => {
    const response = await fetch(`${API_BASE_URL}/teachers/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      body: JSON.stringify({ action: "delete" }),
    });
  
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Failed to delete teacher: ${errorMessage}`);
    }
  
    return await response.json();
  };
// Login
export const login = async (credentials) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) throw new Error("Login failed");

        return await response.json();
    } catch (error) {
        throw new Error(error.message);
    }
};

// Logout
export const logout = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: "POST",
            headers: getAuthHeaders(),
        });

        if (!response.ok) throw new Error("Logout failed");

        return await response.json();
    } catch (error) {
        throw new Error(error.message);
    }
};
// Add this to your userService.js
export const updateStudentSituation = async (id, { nouvelleSituation, anneeAcademique }) => {
  const response = await fetch(`${API_BASE_URL}/years/student/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ nouvelleSituation, anneeAcademique })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update student situation');
  }
  
  return await response.json();
};
export const batchUpdateStudentSituation = async (ids, updateData) => {
  try {
    const results = await Promise.all(
      ids.map(id => updateStudentSituation(id, updateData))
    );
    return results;
  } catch (error) {
    throw new Error(`Batch update failed: ${error.message}`);
  }
};
export const createAcademicYear = async (anneeUniversitaire) => {
  try {
    const response = await fetch(`${API_BASE_URL}/years/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(anneeUniversitaire),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create academic year: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating academic year:", error);
    throw new Error(error.message);
  }
};
export const fetchAcademicYearData = async (year) => {
    try {
        const response = await fetch(`${API_BASE_URL}/years/${year}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch academic year data: ${errorText}`);
        }

        const data = await response.json();
        return data; // contient: users, pfas, stagesEte, competences, matieres
    } catch (error) {
        console.error("Error fetching academic year data:", error);
        throw new Error(error.message);
    }
};


// Add this to your userService.js
export const notifyDiplomeStudents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/years/notify`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to notify students: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error notifying students:", error);
    throw new Error(error.message);
  }
};