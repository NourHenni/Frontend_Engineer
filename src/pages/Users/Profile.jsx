import React, { useEffect, useState } from "react";
import { 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Card, 
  Spin, 
  Row, 
  Col, 
  Typography, 
  Avatar, 
  Button,
  Tabs,
  message,
  Tag,
  Input as AntInput,
  Space,
  Divider,
  Descriptions,
  Table
} from "antd";
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  CalendarOutlined, 
  HomeOutlined,
  EditOutlined,
  SaveOutlined,
  SolutionOutlined,
  BookOutlined,
  PlusOutlined,
  CloseOutlined,
  ExperimentOutlined,
  FileTextOutlined 
} from '@ant-design/icons';
import Navbar from "../../components/navbar/Navbar";
import SidebarLayout from "../../components/sidebar/Sidebar";
import { fetchStudentById, fetchStudentCV, updateStudent } from "../../services/userService";
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const Profile = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('personal');
  const [updating, setUpdating] = useState(false);
    const [cvLoading, setCvLoading] = useState(false);
      const [pfas, setPfas] = useState([]);
  const [stageEte, setStageEte] = useState(null);
  const [inputVisible, setInputVisible] = useState({
    diplomes: false,
    certifications: false,
    langues: false,
    experiences: false
  });
  const [inputValue, setInputValue] = useState({
    diplomes: '',
    certifications: '',
    langues: '',
    experiences: ''
  });

 useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Decode token to get user info
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const decodedPayload = JSON.parse(atob(base64));

        const { userId, role } = decodedPayload;
        if (!userId) {
          setLoading(false);
          return;
        }

        setUserId(userId);
        setUserRole(role);

        // Fetch user data
        const response = await fetchStudentById(userId);
        if (!response?.model) {
          throw new Error("No user data received");
        }

        const userData = response.model;
        setUser(userData);

        // Prepare form initial values
        const initialValues = {
          ...userData,
          dateDeNaissance: userData.dateDeNaissance 
            ? dayjs(userData.dateDeNaissance) 
            : null,
          cvinfos: {
            diplomes: userData.cvinfos?.diplomes || [],
            certifications: userData.cvinfos?.certifications || [],
            langues: userData.cvinfos?.langues || [],
            experiences: userData.cvinfos?.experiences || []
          }
        };

        form.setFieldsValue(initialValues);
        
        // Load CV data including PFAs and Stage Ete
        loadCVData(userId);

      } catch (error) {
        console.error("Error in user data initialization:", error);
        message.error(error.message || "Failed to initialize user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [form]);



  const handleEdit = () => {
    setEditing(true);
  };

const handleSave = async () => {
  try {
    setUpdating(true);
    await form.validateFields();
    
    // Get ALL form values including nested cvinfos
    const values = form.getFieldsValue(true); // Note the true parameter for nested values
    
    // Prepare the update data
    const updateData = {
      ...values,
      dateDeNaissance: values.dateDeNaissance ? values.dateDeNaissance.format('YYYY-MM-DD') : null,
      cvinfos: {
        diplomes: values.cvinfos?.diplomes || [],
        certifications: values.cvinfos?.certifications || [],
        langues: values.cvinfos?.langues || [],
        experiences: values.cvinfos?.experiences || []
      }
    };

    console.log('Final data being sent:', JSON.stringify(updateData, null, 2));

    const response = await updateStudent(userId, updateData);
    
    if (response?.model) {
      setUser(response.model);
      message.success("Profile updated successfully");
      setEditing(false);
    }
  } catch (error) {
    console.error("Update error:", error);
    message.error(error.response?.data?.message || "Failed to update profile");
  } finally {
    setUpdating(false);
  }
};

  const cardStyle = {
    backgroundColor: "white",
    marginBottom: 16,
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    border: "1px solid #f0f0f0",
  };

  const headerStyle = {
    fontSize: 16,
    fontWeight: 600,
    borderBottom: "1px solid #f0f0f0",
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
  };

  const tabContentStyle = {
    padding: '16px 0',
  };

  const disabledFieldStyle = {
    backgroundColor: '#fafafa',
    color: 'rgba(0, 0, 0, 0.85)',
    cursor: 'not-allowed'
  };

  const showInput = (field) => {
    setInputVisible({
      ...inputVisible,
      [field]: true
    });
  };

  const handleInputChange = (field, e) => {
    setInputValue({
      ...inputValue,
      [field]: e.target.value
    });
  };

const handleInputConfirm = (field) => {
  const currentValues = form.getFieldValue(['cvinfos', field]) || [];
  if (inputValue[field] && inputValue[field].trim() !== '') {
    const newValues = [...currentValues, inputValue[field].trim()];
    form.setFieldsValue({
      cvinfos: {
        ...form.getFieldValue('cvinfos') || {},
        [field]: newValues
      }
    });
  }
  setInputVisible({...inputVisible, [field]: false});
  setInputValue({...inputValue, [field]: ''});
};

  const handleRemove = (field, removedItem) => {
    const currentValues = form.getFieldValue(['cvinfos', field]) || [];
    form.setFieldsValue({
      cvinfos: {
        ...form.getFieldValue('cvinfos'),
        [field]: currentValues.filter(item => item !== removedItem)
      }
    });
  };
 const loadCVData = async (studentId) => {
  setCvLoading(true);
  try {
    const response = await fetchStudentCV(studentId);
    const cvData = response.cv; // Access the cv object from response
    
    console.log("CV data:", cvData);
    
    // Handle PFAs - in your data, it's a single pfa object, not an array
    const pfaData = cvData.pfa ? [cvData.pfa] : [];
    setPfas(pfaData);
    
    // Handle Stage Ete
    setStageEte(cvData.stageEte || null);
    
    console.log("PFA data:", pfaData);
    console.log("Stage Ete data:", cvData.stageEte);
  } catch (err) {
    console.error("Error loading CV data:", err);
    message.error("Failed to load academic projects");
  } finally {
    setCvLoading(false);
  }
};
  const renderPFAs = () => {
    return (
      <Card 
        title={
          <span>
            <FileTextOutlined /> Projets de Fin d'Études (PFAs)
          </span>
        } 
        style={cardStyle} 
        headStyle={headerStyle}
        loading={cvLoading}
      >
        {pfas.length > 0 ? (
          <Table
            columns={[
              {
                title: 'Titre',
                dataIndex: 'titreSujet',
                key: 'title',
              },
               {
                title: 'code_pfa',
                dataIndex: 'code_pfa',
                key: 'code_pfa',
              },
              {
                title: 'Description',
                dataIndex: 'description',
                key: 'description',
                render: (text) => text || 'Non spécifiée',
              },
              {
                title: 'Année',
                dataIndex: 'annee',
                key: 'year',
              },
              {
                title: 'Statut',
                dataIndex: 'status',
                key: 'status',
                render: (status) => {
                  let color = 'blue';
                  if (status === 'approved') color = 'green';
                  if (status === 'rejected') color = 'red';
                  return <Tag color={color}>{status?.toUpperCase() || 'EN ATTENTE'}</Tag>;
                },
              },
            ]}
            dataSource={pfas}
            rowKey="_id"
            pagination={false}
            size="small"
          />
        ) : (
          <Text type="secondary">Aucun PFA enregistré</Text>
        )}
      </Card>
    );
  };

  const renderStageEte = () => {
    return (
      <Card 
        title={
          <span>
            <ExperimentOutlined /> Stage d'Été
          </span>
        } 
        style={cardStyle} 
        headStyle={headerStyle}
        loading={cvLoading}
      >
        {stageEte ? (
          <Descriptions column={1}>
            <Descriptions.Item label="nomEntreprise">
              {stageEte.nomEntreprise || 'Non spécifié'}
            </Descriptions.Item>


            <Descriptions.Item label="titreSujet">
              {stageEte.titreSujet || 'Non spécifiée'}
            </Descriptions.Item>

 <Descriptions.Item label="description">
              {stageEte.description || 'Non spécifiée'}
            </Descriptions.Item>

            <Descriptions.Item label="niveau">
              {stageEte.niveau || 'Non spécifiée'}
            </Descriptions.Item>


            <Descriptions.Item label="statutSujet">
              {stageEte.statutSujet || 'Non spécifié'}
            </Descriptions.Item>
          
          </Descriptions>
        ) : (
          <Text type="secondary">Aucun stage d'été enregistré</Text>
        )}
      </Card>
    );
  };
const renderCompetenceTags = (field, title) => {
  const values = form.getFieldValue(['cvinfos', field]) || [];
  
  return (
    <Card title={title} style={cardStyle} headStyle={headerStyle}>
      <div style={{ marginBottom: 16 }}>
        {values.map((item, index) => (
          <Tag
            key={`${field}-${index}`}
            closable={editing}
            onClose={() => {
              const newValues = values.filter((_, i) => i !== index);
              form.setFieldsValue({
                cvinfos: {
                  ...form.getFieldValue('cvinfos'),
                  [field]: newValues
                }
              });
            }}
            style={{ marginBottom: 8 }}
          >
            {item}
          </Tag>
        ))}
      </div>
      
      {editing && (
        <div>
          {inputVisible[field] ? (
            <Space style={{ width: '100%' }} direction="vertical">
              <AntInput
                value={inputValue[field]}
                onChange={(e) => setInputValue({...inputValue, [field]: e.target.value})}
                onPressEnter={() => handleInputConfirm(field)}
                autoFocus
              />
              <Space>
                <Button type="primary" onClick={() => handleInputConfirm(field)}>
                  Add
                </Button>
                <Button onClick={() => setInputVisible({...inputVisible, [field]: false})}>
                  Cancel
                </Button>
              </Space>
            </Space>
          ) : (
            <Button 
              type="dashed" 
              onClick={() => showInput(field)}
              icon={<PlusOutlined />}
              block
            >
              Add {title.toLowerCase()}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};
const renderAcademicStatuses = () => {
  const { academic_statuses } = user || {}; // Use the user state instead of userData
  
  return (
    <Card title="Statuts Académiques" style={cardStyle} headStyle={headerStyle}>
      {academic_statuses && academic_statuses.length > 0 ? (
        <div>
          {academic_statuses.map((status, index) => (
            <div key={status._id} style={{ marginBottom: 16 }}>
              <div><strong>Année académique:</strong> {status.academic_year}</div>
              <div><strong>Statut:</strong> {status.status}</div>
              {status.details && <div><strong>Détails:</strong> {status.details}</div>}
              {index < academic_statuses.length - 1 && <Divider />}
            </div>
          ))}
        </div>
      ) : (
        <div>Aucun statut académique enregistré</div>
      )}
    </Card>
  );
};
 const renderExperiences = () => {
  const experiences = form.getFieldValue(['cvinfos', 'experiences']) || [];
  
  return (
    <Card title="Experiences" style={cardStyle} headStyle={headerStyle}>
      {experiences.map((exp, index) => (
        <div key={index} style={{ marginBottom: 8, padding: 8, border: '1px solid #f0f0f0', borderRadius: 4 }}>
          {editing && (
            <CloseOutlined 
              style={{ float: 'right', cursor: 'pointer' }}
              onClick={() => {
                const newExps = experiences.filter((_, i) => i !== index);
                form.setFieldsValue({
                  cvinfos: {
                    ...form.getFieldValue('cvinfos'),
                    experiences: newExps
                  }
                });
              }}
            />
          )}
          <Text>{exp}</Text>
        </div>
      ))}
      
      {editing && (
        <div>
          {inputVisible.experiences ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              <TextArea
                rows={3}
                value={inputValue.experiences}
                onChange={(e) => setInputValue({...inputValue, experiences: e.target.value})}
                placeholder="Describe your experience"
              />
              <Space>
                <Button 
                  type="primary" 
                  onClick={() => handleInputConfirm('experiences')}
                >
                  Add Experience
                </Button>
                <Button onClick={() => setInputVisible({...inputVisible, experiences: false})}>
                  Cancel
                </Button>
              </Space>
            </Space>
          ) : (
            <Button 
              type="dashed" 
              onClick={() => showInput('experiences')}
              icon={<PlusOutlined />}
              block
            >
              Add Experience
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

  return (
    <div>
      <Navbar />
      <SidebarLayout collapsed={collapsed} setCollapsed={setCollapsed} />
     
      <div style={{ padding: 24, backgroundColor: "#f5f5f5", minHeight: "100vh", paddingTop: "80px", minWidth: "120vh" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <Spin size="large" />
          </div>
        ) : (
          <Form form={form} layout="vertical">
            <Card 
              style={{ 
                maxWidth: 1200, 
                margin: "0 auto",
                ...cardStyle,
                borderTop: "3px solid #1890ff",
              }}
              headStyle={headerStyle}
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: "#1890ff", marginRight: 12 }} />
                  <div>
                    <Title level={4} style={{ margin: 0 }}>{user?.prenom} {user?.nom}</Title>
                    <Text type="secondary" style={{ textTransform: 'uppercase', fontSize: 12 }}>
                      {user?.role || userRole || "N/A"}
                    </Text>
                  </div>
                </div>
              }
              extra={
                !editing ? (
                  <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
                    Modifier
                  </Button>
                ) : (
                  <Button 
                    type="primary" 
                    icon={<SaveOutlined />} 
                    onClick={handleSave}
                    loading={updating}
                  >
                    Enregistrer
                  </Button>
                )
              }
            >
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                {/* Personal Information Tab */}
                <TabPane 
                  tab={
                    <span>
                      <UserOutlined />
                      Informations Personnelles
                    </span>
                  } 
                  key="personal"
                >
                  <div style={tabContentStyle}>
                    <Row gutter={24}>
                      {/* Left Column */}
                      <Col xs={24} md={12}>
                        <Card title="Identité" style={cardStyle} headStyle={headerStyle}>
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item name="prenom" label="Prénom">
                                <Input 
                                  prefix={<UserOutlined />} 
                                  disabled={true}
                                  style={disabledFieldStyle}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item name="nom" label="Nom">
                                <Input 
                                  prefix={<UserOutlined />} 
                                  disabled={true}
                                  style={disabledFieldStyle}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item name="dateDeNaissance" label="Date de naissance">
                                <DatePicker 
                                  style={{ width: '100%', ...disabledFieldStyle }} 
                                  disabled={true}
                                  suffixIcon={<CalendarOutlined />}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item name="genre" label="Genre">
                                <Select 
                                  disabled={true}
                                  style={disabledFieldStyle}
                                >
                                  <Option value="male">Masculin</Option>
                                  <Option value="female">Féminin</Option>
                                  <Option value="other">Autre</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                          </Row>
                          <Form.Item name="cin" label="CIN">
                            <Input 
                              disabled={true}
                              style={disabledFieldStyle}
                            />
                          </Form.Item>
                        </Card>

                        <Card title="Coordonnées" style={cardStyle} headStyle={headerStyle}>
                          <Form.Item 
                            name="adresseEmail" 
                            label="Email"
                            rules={[
                              { required: true, message: 'Please input your email!' },
                              { type: 'email', message: 'Please enter a valid email!' }
                            ]}
                          >
                            <Input prefix={<MailOutlined />} disabled={!editing} />
                          </Form.Item>
                          <Form.Item name="telephone" label="Téléphone">
                            <Input prefix={<PhoneOutlined />} disabled={!editing} />
                          </Form.Item>
                        </Card>
                      </Col>

                      {/* Right Column */}
                      <Col xs={24} md={12}>
                        <Card title="Adresse" style={cardStyle} headStyle={headerStyle}>
                          <Form.Item name="addresse" label="Adresse complète">
                            <TextArea rows={2} disabled={!editing} />
                          </Form.Item>
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item name="ville" label="Ville">
                                <Input disabled={!editing} />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item name="code_postal" label="Code postal">
                                <Input disabled={!editing} />
                              </Form.Item>
                            </Col>
                          </Row>
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item name="gouvernorat" label="Gouvernorat">
                                <Input prefix={<HomeOutlined />} disabled={!editing} />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </TabPane>

                {/* Education Tab */}
                <TabPane 
                  tab={
                    <span>
                      <BookOutlined />
                      Formation
                    </span>
                  } 
                  key="education"
                >
                  <div style={tabContentStyle}>
                    <Row gutter={24}>
                      <Col xs={24} md={12}>
                        <Card title="Études Supérieures" style={cardStyle} headStyle={headerStyle}>
                          <Form.Item name="universite" label="Ancienne Université">
                            <Input 
                              disabled={true}
                              style={disabledFieldStyle}
                            />
                          </Form.Item>
                          <Form.Item name="specialite" label="Spécialité">
                            <Input 
                              disabled={true}
                              style={disabledFieldStyle}
                            />
                          </Form.Item>
                          <Form.Item name="annee_entree_isamm" label="Année d'entrée à ISAMM">
                            <Input 
                              disabled={true}
                              style={disabledFieldStyle}
                            />
                          </Form.Item>
                        </Card>
                      </Col>
                      <Col xs={24} md={12}>
                        <Card title="Baccalauréat" style={cardStyle} headStyle={headerStyle}>
                          <Form.Item name="baccalaureat" label="Type">
                            <Input 
                              disabled={true}
                              style={disabledFieldStyle}
                            />
                          </Form.Item>
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item name="annee_bac" label="Année">
                                <Input 
                                  disabled={true}
                                  style={disabledFieldStyle}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item name="moyenne_bac" label="Moyenne">
                                <Input 
                                  disabled={true}
                                  style={disabledFieldStyle}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                          <Form.Item name="mention" label="Mention">
                            <Input 
                              disabled={true}
                              style={disabledFieldStyle}
                            />
                          </Form.Item>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </TabPane>

                {/* Professional Tab */}
                <TabPane 
                  tab={
                    <span>
                      <SolutionOutlined />
                      Compétences
                    </span>
                  } 
                  key="professional"
                >
                  <div style={tabContentStyle}>
                    <Row gutter={24}>
                      <Col xs={24} md={12}>
                        {renderCompetenceTags('diplomes', 'Diplômes')}
                        {renderCompetenceTags('langues', 'Langues')} 
                        {renderPFAs()} {/* Add PFAs here */}
                         {renderStageEte()} {/* Add Stage Ete here */}
                      </Col>
                      <Col xs={24} md={12}>
                        {renderCompetenceTags('certifications', 'Certifications')}
                          {renderAcademicStatuses()}
                          
                          
                        {renderExperiences()}
                      </Col>
                    </Row>
                  </div>
                </TabPane>
              </Tabs>

              {/* System Information (always visible) */}
              <Card title="Informations Système" style={cardStyle} headStyle={headerStyle}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Text strong>Créé le:</Text> {user?.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A"}
                  </Col>
                  <Col span={12}>
                    <Text strong>Dernière mise à jour:</Text> {user?.updatedAt ? new Date(user.updatedAt).toLocaleString() : "N/A"}
                  </Col>
                </Row>
              </Card>
            </Card>
          </Form>
        )}
      </div>
    </div>
  );
};

export default Profile;