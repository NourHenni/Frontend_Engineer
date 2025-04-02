import React, { useEffect, useState } from "react";
import { Table, Spin, Alert } from "antd"; // Import Table and necessary components
import SidebarLayout from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";

function Users() {
  const [loading, setLoading] = useState(true); // State for loading
  const [data, setData] = useState([]); // State for fetched user data
  const [error, setError] = useState(null); // State for error

  useEffect(() => {
    // Fetch user data from API
    const fetchData = async () => {
      const token = localStorage.getItem("token");
    
      if (!token) {
        setError("No token found, please log in.");
        setLoading(false);
        return;
      }
    
      try {
        const response = await fetch("http://localhost:5000/students", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
    
        if (!response.ok) {
          throw new Error("Failed to fetch data from the server");
        }
    
        const result = await response.json();
    
        // Check if 'model' exists and is an array
        if (Array.isArray(result.model)) {
          setData(result.model); // Set the users data
        } else {
          setError("Received data is not an array.");
        }
      } catch (err) {
        setError("Failed to fetch data: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    

    fetchData(); // Call the fetch function
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "_id",
      key: "_id",
      render: (text) => <span>{text["$oid"]}</span>, // Render _id properly as string
    },
    {
      title: "Full Name",
      dataIndex: "nom",
      key: "nom",
      render: (text, record) => <span>{record.nom} {record.prenom}</span>, // Combine nom and prenom
    },
    {
      title: "CIN",
      dataIndex: "cin",
      key: "cin",
    },
    {
      title: "Email",
      dataIndex: "adresseEmail",
      key: "adresseEmail",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Date of Birth",
      dataIndex: "dateDeNaissance",
      key: "dateDeNaissance",
      render: (text) => <span>{new Date(text["$date"]).toLocaleDateString()}</span>, // Format the date
    },
    {
      title: "Account Status",
      dataIndex: "archivee",
      key: "archivee",
      render: (text) => <span>{text ? "Archived" : "Active"}</span>, // Show active or archived status
    },
  ];

  return (
    <div>
      <Navbar />
      <SidebarLayout />
      <div style={{ margin: "20px" }}>
        <h1>Users</h1>
        <p>This is the Users page where you can manage user accounts.</p>

        {/* Error message */}
        {error && <Alert message={error} type="error" showIcon />}

        {/* Loading spinner */}
        {loading ? (
          <Spin tip="Loading..." size="large" />
        ) : (
          <Table
            columns={columns}
            dataSource={data}
            rowKey="_id" // Set rowKey to the unique identifier
            pagination={true} // Enable pagination
          />
        )}
      </div>
    </div>
  );
}

export default Users;
