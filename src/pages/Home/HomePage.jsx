import React, { useState } from "react";
import { Layout } from "antd";
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar"; // Assuming Sidebar has its own collapsing logic

const { Content } = Layout;

function HomePage() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Layout for Content and Navbar */}
      <Layout style={{ marginLeft: collapsed ? 80 : 250 }}>
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
          {/* Your page content here */}
        </Content>
      </Layout>
    </Layout>
  );
}

export default HomePage;
