import React, { useState, useEffect } from "react";

import { Tabs, Card, Button, message, Select, Space, Modal, Input } from "antd";

import StudentTable from "./StudentTable";
import TeacherTable from "./TeacherTable";
import { Route, Routes } from "react-router-dom";
import StudentDetails from "./StudentDetails";
import { createAcademicYear } from "../../services/userService";
import { getLastAcademicYear } from "../../services/appServices";
import "./Users.css";
import Navbar from "../../components/Navbar/Navbar";
import SidebarLayout from "../../components/Sidebar/Sidebar";

const { Option } = Select;

function Users() {
  const { TabPane } = Tabs;
  const [collapsed, setCollapsed] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [isLoadingYears, setIsLoadingYears] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);
  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const decodedPayload = JSON.parse(atob(base64));
          setUserRole(decodedPayload.role);
        } catch (error) {
          console.error("Error decoding token", error);
        }
      }

      // Fetch academic years data
      const response = await getLastAcademicYear();
      if (response.success) {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = -2; i <= 1; i++) {
          years.push(currentYear + i);
        }

        const formattedYears = years.map((year) => `${year}-${year + 1}`);
        setAcademicYears(formattedYears);

        if (response.data?.year) {
          setSelectedYear(response.data.year);
        } else {
          setSelectedYear(`${currentYear}-${currentYear + 1}`);
        }
      }
    } catch (error) {
      console.error("Failed to fetch academic years:", error);
      message.error("Failed to load academic years");
    } finally {
      setIsLoadingYears(false);
    }
  };
  const handleCreateNewYear = async () => {
    try {
      Modal.confirm({
        title: "Create New Academic Year",
        content: (
          <div>
            <p style={{ color: "red", marginBottom: 16 }}>
              Warning: Creating a new academic year will archive all current
              PFAs and summer internships. You won't be able to view them in the
              current interface after this action.
            </p>
            <p>Enter the academic year you want to create:</p>
            <Input
              placeholder="e.g., 2024-2025"
              id="yearInput"
              defaultValue={`${new Date().getFullYear()}-${
                new Date().getFullYear() + 1
              }`}
            />
          </div>
        ),
        okText: "Continue",
        cancelText: "Cancel",
        onOk: async () => {
          const input = document.getElementById("yearInput");
          const academicYear = input?.value.trim();

          // Validate format
          if (!academicYear || !/^\d{4}-\d{4}$/.test(academicYear)) {
            message.error(
              "Please enter a valid academic year in YYYY-YYYY format"
            );
            return Promise.reject();
          }

          // Extract years
          const [startYear, endYear] = academicYear.split("-").map(Number);

          // Validate year sequence
          if (endYear !== startYear + 1) {
            message.error(
              "Academic year must be exactly one year (e.g., 2025-2026)"
            );
            return Promise.reject();
          }

          // Check for exact match only

          setLoading(true);
          try {
            await createAcademicYear({ anneeUniversitaire: academicYear });
            message.success(
              `New academic year ${academicYear} created successfully.`
            );
            await fetchInitialData();
          } catch (error) {
            message.error(`Error: ${error.message}`);
            return Promise.reject();
          } finally {
            setLoading(false);
          }
        },
      });
    } catch (error) {
      console.error("Error in new year creation:", error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        paddingTop: "20px",
      }}
    >
      <Navbar />
      <SidebarLayout collapsed={collapsed} setCollapsed={setCollapsed} />

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          marginLeft: collapsed ? "80px" : "250px",
          transition: "margin-left 0.3s ease",
          padding: "20px",
        }}
      >
        <h1>Manage Users</h1>
        <p>Select a user category to manage students or teachers.</p>

        <Space style={{ marginBottom: 16 }}>
          {userRole === "admin" && (
            <Button
              type="primary"
              onClick={handleCreateNewYear}
              loading={loading}
            >
              Create New Year
            </Button>
          )}
        </Space>

        <Tabs defaultActiveKey="1" style={{ marginBottom: 24 }}>
          <TabPane tab="Students" key="1">
            <Card
              title="Students List"
              bordered={false}
              style={{
                height: "auto",
                overflow: "hidden",
                marginBottom: "20px",
              }}
            >
              <StudentTable academicYear={selectedYear} />
            </Card>
          </TabPane>

          {userRole === "admin" && (
            <TabPane tab="Teachers" key="2">
              <Card
                title="Teachers List"
                bordered={false}
                style={{ height: "auto", overflow: "hidden" }}
              >
                <TeacherTable academicYear={selectedYear} />
              </Card>
            </TabPane>
          )}
        </Tabs>

        <Routes>
          <Route path="/students/details/:id" element={<StudentDetails />} />
        </Routes>
      </div>
    </div>
  );
}

export default Users;
