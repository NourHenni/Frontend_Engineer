import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Button, Card, Spin, Alert, Row, Col, Descriptions, Tag, Space,
    Typography, Form, Input, Select, DatePicker, Modal, message,
    Table, Divider
} from "antd";
import {
    UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined,
    UnorderedListOutlined, FileTextOutlined, LockOutlined,
    BookOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import Navbar from "../../components/navbar/Navbar";
import SidebarLayout from "../../components/sidebar/Sidebar";
import StudentCV from "./StudentCV";

import { fetchStudentById, updateStudent, updateStudentPassword } from "../../services/userService";

const { Title, Text } = Typography;
const { Option } = Select;

function StudentDetails() {
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [collapsed, setCollapsed] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [form] = Form.useForm();
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();
    const [showCV, setShowCV] = useState(false);
    useEffect(() => {
        const loadStudentDetails = async () => {
            try {
                const data = await fetchStudentById(id);
                setStudent(data.model);
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
        loadStudentDetails();
    }, [id, form]);

    const handleBack = () => navigate("/home/Users");

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const updated = {
                ...values,
                dateDeNaissance: values.dateDeNaissance.format("YYYY-MM-DD"),
            };
            await updateStudent(id, updated);
            message.success("Student updated successfully");
            setStudent({ ...student, ...updated });
            setEditMode(false);
        } catch (err) {
            message.error("Failed to update student");
        }
    };

    const handlePasswordChange = async () => {
        try {
            if (newPassword !== confirmPassword) {
                message.error("Passwords do not match");
                return;
            }
            await updateStudentPassword(id, { newPassword, confirmPassword });
            message.success("Password updated successfully");
            setIsPasswordModalVisible(false);
        } catch (err) {
            message.error("Failed to update password");
        }
    };

    const renderField = (field) => (!field && field !== 0 ? <Text type="secondary">Unavailable</Text> : <Text>{field}</Text>);

    const renderAcademicStatuses = () => {
        if (!student?.academic_statuses || student.academic_statuses.length === 0) {
            return (
             
                <Card title="Academic Statuses" bordered={false} style={cardStyle} >
                    <Text type="secondary">No academic statuses recorded</Text>
                </Card>
               
            );
        }

        const columns = [
            {
                title: 'Academic Year',
                dataIndex: 'academic_year',
                key: 'academic_year',
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status) => {
                    let color = 'blue';
                    if (status === 'diplome') color = 'green';
                    if (status === 'redouble') color = 'orange';
                    return <Tag color={color}>{status.toUpperCase()}</Tag>;
                },
            },
            {
                title: 'Details',
                dataIndex: 'details',
                key: 'details',
                render: (details) => details || '-',
            },
        ];

        return (
            <Card 
                title={
                    <span>
                        <BookOutlined /> Academic Statuses
                    </span>
                } 
                bordered={false} 
                style={cardStyle}
            >
                <Table 
                    columns={columns} 
                    dataSource={student.academic_statuses} 
                    rowKey="_id"
                    pagination={false}
                    size="small"
                />
            </Card>
        );
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#f0f2f5" }}>
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
                    student && (
                        <Form layout="vertical" form={form}>
                            <Card
                                title="Student Details"
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
                                                    <UserOutlined /> {student.nom} {student.prenom}
                                                </Title>
                                                {editMode ? (
                                                    <>
                                                        <Form.Item label="Nom" name="nom" rules={[{ required: true }]}>
                                                            <Input />
                                                        </Form.Item>
                                                        <Form.Item label="Prenom" name="prenom" rules={[{ required: true }]}>
                                                            <Input />
                                                        </Form.Item>
                                                        <Form.Item label="CIN" name="cin" rules={[{ required: true }]}>
                                                            <Input />
                                                        </Form.Item>
                                                        <Form.Item label="Genre" name="genre">
                                                            <Select>
                                                                <Option value="Homme">Homme</Option>
                                                                <Option value="Femme">Femme</Option>
                                                            </Select>
                                                        </Form.Item>
                                                        <Form.Item label="Date de Naissance" name="dateDeNaissance">
                                                            <DatePicker format="YYYY-MM-DD" />
                                                        </Form.Item>
                                                    </>
                                                ) : (
                                                    <Descriptions column={1} labelStyle={{ fontWeight: 600, color: "#555" }}>
                                                        <Descriptions.Item label="CIN">{renderField(student.cin)}</Descriptions.Item>
                                                        <Descriptions.Item label="Gender">{renderField(student.genre)}</Descriptions.Item>
                                                        <Descriptions.Item label="Date of Birth">
                                                            {renderField(new Date(student.dateDeNaissance).toLocaleDateString())}
                                                        </Descriptions.Item>
                                                        <Descriptions.Item label="Status">
                                                            {student.archivee ? (
                                                                <Tag color="red" style={{ fontWeight: "bold" }}>Archived</Tag>
                                                            ) : (
                                                                <Tag color="green" style={{ fontWeight: "bold" }}>Active</Tag>
                                                            )}
                                                        </Descriptions.Item>
                                                    </Descriptions>
                                                )}
                                            </Space>
                                        </Card>

                                        <Card title="Contact Information" bordered={false} style={{ ...cardStyle, marginTop: "20px" }}>
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
                                                        <Text><PhoneOutlined style={{ color: "#1890ff" }} /> {renderField(student.telephone)}</Text>
                                                        <Text><MailOutlined style={{ color: "#1890ff" }} /> {renderField(student.adresseEmail)}</Text>
                                                        <Text><HomeOutlined style={{ color: "#1890ff" }} /> {renderField(student.addresse)}</Text>
                                                    </>
                                                )}
                                            </Space>
                                        </Card>
                                    </Col>

                                    <Col span={12}>
                                        <Card title="Academic Information" bordered={false} style={cardStyle}>
                                            {editMode ? (
                                                <>
                                                    <Form.Item label="Université" name="universite"><Input /></Form.Item>
                                                    <Form.Item label="Etablissement" name="etablissement"><Input /></Form.Item>
                                                    <Form.Item label="Type Licence" name="type_licence"><Input /></Form.Item>
                                                    <Form.Item label="Spécialité" name="specialite"><Input /></Form.Item>
                                                    <Form.Item label="Année Licence" name="annee_licence"><Input /></Form.Item>
                                                    <Form.Item label="Année Bac" name="annee_bac"><Input /></Form.Item>
                                                    <Form.Item label="Moyenne Bac" name="moyenne_bac"><Input /></Form.Item>
                                                    <Form.Item label="Mention" name="mention"><Input /></Form.Item>
                                                    <Form.Item label="Baccalauréat" name="baccalaureat"><Input /></Form.Item>
                                                    <Form.Item label="Année entrée ISAMM" name="annee_entree_isamm"><Input /></Form.Item>
                                                </>
                                            ) : (
                                                <Descriptions column={1} labelStyle={{ fontWeight: 600, color: "#555" }}>
                                                    <Descriptions.Item label="University">{renderField(student.universite)}</Descriptions.Item>
                                                    <Descriptions.Item label="Establishment">{renderField(student.etablissement)}</Descriptions.Item>
                                                    <Descriptions.Item label="Degree Type">{renderField(student.type_licence)}</Descriptions.Item>
                                                    <Descriptions.Item label="Specialty">{renderField(student.specialite)}</Descriptions.Item>
                                                    <Descriptions.Item label="Year of Study">{renderField(student.annee_licence)}</Descriptions.Item>
                                                    <Descriptions.Item label="Baccalaureate Year">{renderField(student.annee_bac)}</Descriptions.Item>
                                                    <Descriptions.Item label="Baccalaureate Average">{renderField(student.moyenne_bac)}</Descriptions.Item>
                                                    <Descriptions.Item label="Mention">{renderField(student.mention)}</Descriptions.Item>
                                                    <Descriptions.Item label="Baccalaureate Field">{renderField(student.baccalaureat)}</Descriptions.Item>
                                                    <Descriptions.Item label="Entry Year">{renderField(student.annee_entree_isamm)}</Descriptions.Item>
                                                </Descriptions>
                                            )}
                                            <br />
                                            {renderAcademicStatuses()}
                                        </Card>

                                        {/* Academic Statuses Card */}
                                      
                                    </Col>
                                </Row>
                                
                                <Button onClick={() => setShowCV(!showCV)}>
        {showCV ? 'Hide CV' : 'Show CV'}
    </Button>
                            {showCV && (
    <Row gutter={[30, 30]} style={{ marginTop: 20 }}>
        <Col span={24}>
            <StudentCV
                student={student}
                editMode={editMode}
                form={form}
                studentId={id}
                style={{ display: 'flex', flexDirection: 'row' }}
            />
        </Col>
    </Row>
)}
                            </Card>

                            <Space style={{ marginTop: "40px" }}>
                                <Button onClick={handleBack}>Back to Student List</Button>
                                <Button type="primary" onClick={() => setEditMode(!editMode)}>
                                    {editMode ? "Cancel Edit" : "Edit"}
                                </Button>
                                {editMode && (
                                    <Button type="primary" style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }} onClick={handleSave}>
                                        Save Changes
                                    </Button>
                                )}
                                <Button type="danger" icon={<LockOutlined />} onClick={() => setIsPasswordModalVisible(true)}>
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
                        rules={[{ required: true, message: "Please input the new password!" }]}
                    >
                        <Input.Password value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </Form.Item>
                    <Form.Item
                        label="Confirm New Password"
                        name="confirmPassword"
                        rules={[{ required: true, message: "Please confirm the new password!" }]}
                    >
                        <Input.Password value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
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

export default StudentDetails;