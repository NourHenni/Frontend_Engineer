
export const getInternshipsByType = async (type) => {
    try {
        const response = await fetch(`http://localhost:5000/internship/${type}`, {
            method: "GET",
            headers: getAuthHeaders(), // make sure getAuthHeaders() returns the proper headers including Authorization
        });

        if (!response.ok) throw new Error("Failed to fetch internships");

        const result = await response.json();
        return result.model || [];
    } catch (error) {
        throw new Error(error.message);
    }
};
