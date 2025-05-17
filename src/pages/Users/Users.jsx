import React, { useState, useEffect } from "react";
import { Tabs, Card } from "antd";
import SidebarLayout from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import StudentTable from "./StudentTable";
import TeacherTable from "./TeacherTable";
import { Route, Routes } from "react-router-dom"; // No need for <Router> here
import StudentDetails from "./StudentDetails"; // Import the StudentDetails component
import "./Users.css";

function Users() {
  const { TabPane } = Tabs;
  const [collapsed, setCollapsed] = useState(false);
  const [userRole, setUserRole] = useState(null); // State to hold the user's role

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Decode the token (JWT structure: Header.Payload.Signature)
        const base64Url = token.split(".")[1]; // Get the payload part of the JWT token
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Adjust URL-safe base64 characters
        const decodedPayload = JSON.parse(atob(base64)); // Decode and parse the base64 payload
        
        // Extract the role from the decoded payload
        setUserRole(decodedPayload.role); // Assuming 'role' is stored in the token
      } catch (error) {
        console.error("Error decoding token", error);
      }
    }
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", paddingTop: "20px" }}>
      <Navbar />
      <SidebarLayout collapsed={collapsed} setCollapsed={setCollapsed} />
      
      {/* Content area that adjusts based on sidebar collapsed state */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          marginLeft: collapsed ? "80px" : "250px", // Adjust margin based on sidebar state
          transition: "margin-left 0.3s ease", // Smooth transition for margin
          padding: "20px",
        }}
      >
        <h1>Manage Users</h1>
        <p>Select a user category to manage students or teachers.</p>

        <Tabs
          defaultActiveKey="1"
          style={{ marginBottom: 24 }}
          tabBarStyle={{ width: "100%" }}
        >
          <TabPane tab="Students" key="1">
            <Card
              title="Students List"
              bordered={false}
              style={{
                height: "auto", // Let the card's height be determined by its content
                overflow: "hidden", 
                marginBottom: "20px", // Optional: Adds space between cards if needed
              }}
            >
              <StudentTable />
            </Card>
          </TabPane>
          
          {/* Conditionally render TeacherTable based on the decoded user role */}
          {userRole === "admin" && (
            <TabPane tab="Teachers" key="2">
              <Card
                title="Teachers List"
                bordered={false}
                style={{
                  height: "auto", // Let the card's height be determined by its content
                  overflow: "hidden",
                }}
              >
                <TeacherTable />
              </Card>
            </TabPane>
          )}
        </Tabs>

        {/* Add routing for Student Details */}
        <Routes>
          <Route path="/students/details/:id" element={<StudentDetails />} />
        </Routes>
      </div>
    </div>
  );
}

export default Users;
