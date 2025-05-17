import React, { useEffect, useState } from "react";
import { Card, Space, Typography, Descriptions, List, Tag, Spin, Alert } from "antd";
import { 
  UnorderedListOutlined, 
  FileTextOutlined,
  CodeOutlined,
  BookOutlined,
  GlobalOutlined,
  ExperimentOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  UserOutlined,
  TeamOutlined
} from "@ant-design/icons";
import { fetchStudentCV } from "../../services/userService";

const { Text, Title } = Typography;

const StudentCV = ({ student, editMode, form, studentId }) => {
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCVData = async () => {
      try {
        const data = await fetchStudentCV(studentId);
        setCvData(data.cv);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadCVData();
  }, [studentId]);

  const renderField = (field) =>
    !field && field !== 0 ? (
      <Text type="secondary">Unavailable</Text>
    ) : (
      <Text>{field}</Text>
    );

  const renderListItems = (items) => {
    if (!items || items.length === 0) {
      return <Text type="secondary">No items available</Text>;
    }
    return (
      <List
        size="small"
        dataSource={items}
        renderItem={(item) => <List.Item>{item}</List.Item>}
      />
    );
  };

  if (loading) return <Spin tip="Loading CV data..." />;
  if (error) return <Alert message={error} type="error" showIcon />;

  return (
    <Card
      title="Student CV"
      bordered={false}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "10px",
        padding: "20px",
        boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.1)",
        marginTop: "20px",
      }}
    >
      {/* Basic Information */}
      <Descriptions title="Basic Information" column={1}>
        <Descriptions.Item label={<><UserOutlined /> Situation</>}>
          {renderField(student.situation)}
        </Descriptions.Item>
        <Descriptions.Item label={<><FileTextOutlined /> PFA Status</>}>
          {renderField(student.isFirstSendPfa ? "PFA Sent" : "PFA Not Sent")}
        </Descriptions.Item>
      </Descriptions>

      {/* PFA Information */}
      {cvData?.pfa && (
        <div style={{ marginTop: 20 }}>
          <Title level={4}><CodeOutlined /> PFA Details</Title>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="PFA Code">{cvData.pfa.code_pfa}</Descriptions.Item>
            <Descriptions.Item label="Title">{cvData.pfa.titreSujet}</Descriptions.Item>
            <Descriptions.Item label="Technologies">
              {cvData.pfa.technologies?.join(", ") || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Description">{cvData.pfa.description}</Descriptions.Item>
            <Descriptions.Item label="Team">
              {cvData.pfa.estBinome ? (
                <Tag color="blue"><TeamOutlined /> Binome</Tag>
              ) : (
                <Tag color="green"><UserOutlined /> Individual</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={
                cvData.pfa.etatDepot === "masked" ? "orange" : 
                cvData.pfa.etatDepot === "validated" ? "green" : "red"
              }>
                {cvData.pfa.etatDepot}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Year">{cvData.pfa.annee}</Descriptions.Item>
          </Descriptions>
        </div>
      )}

      {/* Summer Internship */}
      {cvData?.stageEte && (
        <div style={{ marginTop: 20 }}>
          <Title level={4}><CalendarOutlined /> Summer Internship</Title>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="titreSujet">{cvData.stageEte.titreSujet}</Descriptions.Item>
            <Descriptions.Item label="niveau">{cvData.stageEte.niveau}</Descriptions.Item>
            <Descriptions.Item label="statutSujet">{cvData.stageEte.statutSujet}</Descriptions.Item>
          </Descriptions>
        </div>
      )}

      {/* CV Information Sections */}
      {cvData?.cvinfos && (
        <div style={{ marginTop: 20 }}>
          <Title level={4}><BookOutlined /> CV Information</Title>
          
          {/* Diplomas */}
          <Title level={5}><SafetyCertificateOutlined /> Diplomas</Title>
          {renderListItems(cvData.cvinfos.diplomes)}

          {/* Certifications */}
          <Title level={5}><SafetyCertificateOutlined /> Certifications</Title>
          {renderListItems(cvData.cvinfos.certifications)}

          {/* Languages */}
          <Title level={5}><GlobalOutlined /> Languages</Title>
          {renderListItems(cvData.cvinfos.langues)}

          {/* Experiences */}
          <Title level={5}><ExperimentOutlined /> Experiences</Title>
          {renderListItems(cvData.cvinfos.experiences)}
        </div>
      )}

      {!cvData?.pfa && !cvData?.stageEte && (!cvData?.cvinfos || 
        (cvData.cvinfos.diplomes.length === 0 && 
         cvData.cvinfos.certifications.length === 0 && 
         cvData.cvinfos.langues.length === 0 && 
         cvData.cvinfos.experiences.length === 0)) && (
        <Alert message="No CV data available" type="info" showIcon />
      )}
    </Card>
  );
};

export default StudentCV;