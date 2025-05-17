import React, { useState } from "react";
import { Layout } from "antd";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar"; // Assuming Sidebar has its own collapsing logic
import DashboardContent from "./DashboardContent";

const { Content } = Layout;

function HomePage() {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin-left 0.3s' }}>
        {/* Navbar */}
        <Navbar />

        {/* Content */}
        <Content
          style={{
            padding: "20px",
            marginTop: "20px", // Adjust as needed to keep it below the navbar
            background: "#fff",
            minHeight: "100vh", // Ensure content area stretches fully
          }}
        >
          <DashboardContent />
        </Content>
      </Layout>
    </Layout>
  );
}

export default HomePage;
