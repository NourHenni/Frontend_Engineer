const API_BASE_URL = "http://localhost:5000";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};
export const getLastAcademicYear = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/academic-year/lastyear`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch last academic year: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching last academic year:", error);
    throw new Error(error.message);
  }
};
