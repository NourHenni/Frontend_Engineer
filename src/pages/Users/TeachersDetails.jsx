import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Spin,
  Alert,
  Row,
  Col,
  Descriptions,
  Tag,
  Space,
  Typography,
  Form,
  Input,
  Select,
  DatePicker,
  Modal,
  message,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  UnorderedListOutlined,
  LockOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import Navbar from "../../components/Navbar/Navbar";
import SidebarLayout from "../../components/Sidebar/Sidebar";
import {
  fetchTeacherById,
  updateTeacherById,
  updateTeacherPassword,
} from "../../services/userService";

const { Title, Text } = Typography;
const { Option } = Select;

function TeacherDetails() {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadTeacherDetails = async () => {
      try {
        const data = await fetchTeacherById(id);
        setTeacher(data.model);
        form.setFieldsValue({
          ...data.model,
          dateDeNaissance: dayjs(data.model.dateDeNaissance),
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadTeacherDetails();
  }, [id, form]);

  const handleBack = () => navigate("/home/Users");

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const updated = {
        ...values,
        dateDeNaissance: values.dateDeNaissance.format("YYYY-MM-DD"),
      };
      await updateTeacherById(id, updated);
      message.success("Teacher updated successfully");
      setTeacher({ ...teacher, ...updated });
      setEditMode(false);
    } catch (err) {
      console.error("Error updating password:", err);
      message.error("Failed to update password");
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (newPassword !== confirmPassword) {
        message.error("Passwords do not match");
        return;
      }
      await updateTeacherPassword(id, { newPassword, confirmPassword });
      message.success("Password updated successfully");
      setIsPasswordModalVisible(false);
    } catch (err) {
      console.log("Failed to update password");
    }
  };

  const renderField = (field) =>
    !field && field !== 0 ? (
      <Text type="secondary">Unavailable</Text>
    ) : (
      <Text>{field}</Text>
    );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#f0f2f5",
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
          padding: "50px 60px",
          paddingTop: "70px",
        }}
      >
        {error && <Alert message={error} type="error" showIcon />}
        {loading ? (
          <Spin tip="Loading..." size="large" />
        ) : (
          teacher && (
            <Form layout="vertical" form={form}>
              <Card
                title="Teacher Details"
                bordered={false}
                style={{
                  marginBottom: "30px",
                  backgroundColor: "white",
                  boxShadow: "0px 12px 24px rgba(0, 0, 0, 0.15)",
                  borderRadius: "10px",
                  padding: "30px",
                }}
              >
                <Row gutter={[30, 30]}>
                  <Col span={12}>
                    <Card bordered={false} style={cardStyle}>
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Title level={3} style={{ color: "#1890ff" }}>
                          <UserOutlined /> {teacher.nom} {teacher.prenom}
                        </Title>
                        {editMode ? (
                          <>
                            <Form.Item
                              label="Nom"
                              name="nom"
                              rules={[{ required: true }]}
                            >
                              <Input />
                            </Form.Item>
                            <Form.Item
                              label="Prenom"
                              name="prenom"
                              rules={[{ required: true }]}
                            >
                              <Input />
                            </Form.Item>
                            <Form.Item
                              label="CIN"
                              name="cin"
                              rules={[{ required: true }]}
                            >
                              <Input />
                            </Form.Item>
                            <Form.Item label="Genre" name="genre">
                              <Select>
                                <Option value="Homme">Homme</Option>
                                <Option value="Femme">Femme</Option>
                              </Select>
                            </Form.Item>
                            <Form.Item
                              label="Date de Naissance"
                              name="dateDeNaissance"
                            >
                              <DatePicker format="YYYY-MM-DD" />
                            </Form.Item>
                          </>
                        ) : (
                          <Descriptions
                            column={1}
                            labelStyle={{ fontWeight: 600, color: "#555" }}
                          >
                            <Descriptions.Item label="CIN">
                              {renderField(teacher.cin)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Gender">
                              {renderField(teacher.genre)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Date of Birth">
                              {renderField(
                                new Date(
                                  teacher.dateDeNaissance
                                ).toLocaleDateString()
                              )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Status">
                              {teacher.archivee ? (
                                <Tag color="red" style={{ fontWeight: "bold" }}>
                                  Archived
                                </Tag>
                              ) : (
                                <Tag
                                  color="green"
                                  style={{ fontWeight: "bold" }}
                                >
                                  Active
                                </Tag>
                              )}
                            </Descriptions.Item>
                          </Descriptions>
                        )}
                      </Space>
                    </Card>

                    <Card
                      title="Contact Information"
                      bordered={false}
                      style={{ ...cardStyle, marginTop: "20px" }}
                    >
                      <Space direction="vertical" style={{ width: "100%" }}>
                        {editMode ? (
                          <>
                            <Form.Item label="Téléphone" name="telephone">
                              <Input />
                            </Form.Item>
                            <Form.Item label="Email" name="adresseEmail">
                              <Input />
                            </Form.Item>
                            <Form.Item label="Adresse" name="addresse">
                              <Input />
                            </Form.Item>
                          </>
                        ) : (
                          <>
                            <Text>
                              <PhoneOutlined style={{ color: "#1890ff" }} />{" "}
                              {renderField(teacher.telephone)}
                            </Text>
                            <Text>
                              <MailOutlined style={{ color: "#1890ff" }} />{" "}
                              {renderField(teacher.adresseEmail)}
                            </Text>
                            <Text>
                              <HomeOutlined style={{ color: "#1890ff" }} />{" "}
                              {renderField(teacher.addresse)}
                            </Text>
                          </>
                        )}
                      </Space>
                    </Card>
                  </Col>

                  <Col span={12}>
                    <Card
                      title="Additional Information"
                      bordered={false}
                      style={{ ...cardStyle, marginTop: "20px" }}
                    >
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Text>
                          <UnorderedListOutlined style={{ color: "#1890ff" }} />{" "}
                          {renderField(teacher.role)}
                        </Text>
                        <Text>
                          <UnorderedListOutlined style={{ color: "#1890ff" }} />{" "}
                          {renderField(teacher.grade)}
                        </Text>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </Card>

              <Space style={{ marginTop: "40px" }}>
                <Button onClick={handleBack}>Back to Users</Button>
                <Button type="primary" onClick={() => setEditMode(!editMode)}>
                  {editMode ? "Cancel Edit" : "Edit"}
                </Button>
                {editMode && (
                  <Button
                    type="primary"
                    style={{
                      backgroundColor: "#52c41a",
                      borderColor: "#52c41a",
                    }}
                    onClick={handleSave}
                  >
                    Save Changes
                  </Button>
                )}
                <Button
                  type="danger"
                  icon={<LockOutlined />}
                  onClick={() => setIsPasswordModalVisible(true)}
                >
                  Change Password
                </Button>
              </Space>
            </Form>
          )
        )}

        {/* Password Change Modal */}
        <Modal
          title="Change Password"
          visible={isPasswordModalVisible}
          onCancel={() => setIsPasswordModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setIsPasswordModalVisible(false)}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={loading}
              onClick={handlePasswordChange}
            >
              Change Password
            </Button>,
          ]}
        >
          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: "Please input the new password!" },
            ]}
          >
            <Input.Password
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            label="Confirm New Password"
            name="confirmPassword"
            rules={[
              { required: true, message: "Please confirm the new password!" },
            ]}
          >
            <Input.Password
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Item>
        </Modal>
      </div>
    </div>
  );
}

const cardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "10px",
  padding: "20px",
  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.1)",
};

export default TeacherDetails;
