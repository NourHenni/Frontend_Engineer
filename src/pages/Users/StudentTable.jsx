import React, { useEffect, useState } from "react";
import {
  Table,
  Spin,
  Alert,
  Input,
  Space,
  Button,
  Tooltip,
  Modal,
  Upload,
  message,
  Select,
  Form,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  updateStudentSituation,
  batchUpdateStudentSituation,
  notifyDiplomeStudents,
} from "../../services/userService";
import { useNavigate } from "react-router-dom";
import AddStudentModal from "./AddStudentModal";
import * as XLSX from "xlsx";
import { getLastAcademicYear } from "../../services/appServices";

const { Option } = Select;

function StudentTable() {
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSituationModalVisible, setIsSituationModalVisible] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("all");
  const [selectedNiveau, setSelectedNiveau] = useState("all");
  const [availableYears, setAvailableYears] = useState([]);
  const [availableNiveaux, setAvailableNiveaux] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
const [lastAcademicYear, setLastAcademicYear] = useState(null);
  // Get current academic year (e.g., 2024-2025)
  const getCurrentAcademicYear = () => {
    const currentYear = new Date().getFullYear();
    return `${currentYear}-${currentYear + 1}`;
  };
  const handleNotifyDiplomeStudents = async () => {
  try {
    setLoading(true);
    const result = await notifyDiplomeStudents();
    message.success(result.message || "Students notified successfully");
  } catch (error) {
    message.error(error.message || "Failed to notify students");
  } finally {
    setLoading(false);
  }
};
const fetchLastAcademicYear = async () => {
  try {
    const response = await getLastAcademicYear();
    if (response.success && response.data?.year) {
      setLastAcademicYear(response.data.year);
      setSelectedAcademicYear(response.data.year); // Set as default filter
    }
  } catch (error) {
    console.error("Failed to fetch last academic year:", error);
  }
};
  const loadStudents = async () => {
    setLoading(true);
    try {
      const students = await fetchStudents();
      setData(students);
      
      // Extract available academic years and niveaux from all students
      const years = new Set();
      const niveaux = new Set();
      
      students.forEach(student => {
        // Add student's base niveau
        if (student.niveau) {
          niveaux.add(student.niveau.toString());
        }
        
        // Add status years and niveaux
        if (student.academic_statuses && student.academic_statuses.length > 0) {
          student.academic_statuses.forEach(status => {
            years.add(status.academic_year);
            if (status.niveau) {
              niveaux.add(status.niveau.toString());
            }
          });
        }
      });
      
      setAvailableYears(Array.from(years).sort().reverse());
      setAvailableNiveaux(Array.from(niveaux).sort());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
fetchLastAcademicYear(); // Add this line
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
    } else {
      console.log("No token found in localStorage.");
    }
  }, []);

  const handleSearch = (value) => setSearchText(value.toLowerCase());

  const getStatusForYear = (student, year) => {
    if (!student.academic_statuses || year === "all") return null;
    const status = student.academic_statuses.find(s => s.academic_year === year);
    return status || null;
  };

  const filteredData = data
    .filter(student => {
      // If "All" is selected for year, show all students
      if (selectedAcademicYear !== "all") {
        // Otherwise only show students with status for selected year
        const hasYearStatus = student.academic_statuses?.some(
          s => s.academic_year === selectedAcademicYear
        );
        if (!hasYearStatus) return false;
      }
      
      // Filter by niveau if not "all"
      if (selectedNiveau !== "all") {
        // Check both student's base niveau and status niveaux
        const status = getStatusForYear(student, selectedAcademicYear);
        const studentNiveau = status?.niveau || student.niveau;
        if (studentNiveau?.toString() !== selectedNiveau) return false;
      }
      
      return true;
    })
    .filter((student) =>
      ["nom", "prenom", "cin", "adresseEmail"].some((key) =>
        student[key]?.toString().toLowerCase().includes(searchText)
      )
    )
    .map(student => {
      const status = getStatusForYear(student, selectedAcademicYear);
      return {
        ...student,
        currentStatus: status,
        displayNiveau: status?.niveau || student.niveau || "-",
        displaySituation: status?.status || "-"
      };
    });

  const handleEditSituation = (student) => {
    setSelectedStudents([student]);
    setIsSituationModalVisible(true);
    const status = getStatusForYear(student, selectedAcademicYear);
    form.setFieldsValue({
      nouvelleSituation: status?.status || "passe",
      anneeAcademique: selectedAcademicYear === "all" ? getCurrentAcademicYear() : selectedAcademicYear,
      niveau: status?.niveau || student.niveau
    });
  };

  const handleBatchUpdateClick = () => {
    if (selectedStudents.length === 0) {
      message.warning("Please select at least one student");
      return;
    }
    setIsSituationModalVisible(true);
    form.setFieldsValue({
      nouvelleSituation: "passe",
      anneeAcademique: selectedAcademicYear === "all" ? getCurrentAcademicYear() : selectedAcademicYear,
      niveau: selectedNiveau === "all" ? "" : selectedNiveau
    });
  };

  const handleUpdateSituation = async () => {
    try {
      const values = await form.validateFields();
      const studentIds = selectedStudents.map(student => student._id);
      
      if (studentIds.length === 1) {
        await updateStudentSituation(studentIds[0], values);
      } else {
        await batchUpdateStudentSituation(studentIds, values);
      }
      
      message.success(
        studentIds.length === 1
          ? "Student situation updated successfully"
          : `${studentIds.length} student situations updated successfully`
      );
      
      setIsSituationModalVisible(false);
      setSelectedStudents([]);
      setSelectedRowKeys([]);
      loadStudents();
    } catch (err) {
      message.error("Failed to update situation: " + err.message);
    }
  };

  const onSelectChange = (selectedRowKeys, selectedRows) => {
    setSelectedRowKeys(selectedRowKeys);
    setSelectedStudents(selectedRows);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const handleDelete = async (student) => {
    const confirm = window.confirm(
      student.archivee
        ? "This student is already archived. Are you sure you want to permanently delete them?"
        : "Do you want to archive this student?"
    );

    if (!confirm) return;

    try {
      if (!student.archivee) {
        await updateStudent(student._id, { archivee: true });
        message.success("Student archived successfully");
      } else {
        await deleteStudent(student._id);
        message.success("Student permanently deleted");
      }
      loadStudents();
    } catch (err) {
      message.error("Operation failed: " + err.message);
    }
  };

  const handleDetails = (id) => {
    navigate(`/student/${id}`);
  };

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);

  const handleAddStudent = async (newStudent) => {
    try {
      await loadStudents();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Failed to update student list.");
    }
  };

  const handleImport = (file) => {
    const reader = new FileReader();
    setImporting(true);
    reader.onload = async (e) => {
      const binaryStr = e.target.result;
      const wb = XLSX.read(binaryStr, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(ws);

      try {
        for (const studentData of jsonData) {
          await createStudent(studentData);
        }
        message.success("Students imported successfully");
        await loadStudents();
      } catch (err) {
        message.error("Failed to import students: " + err.message);
      } finally {
        setImporting(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const columns = [
    {
      title: "Full Name",
      key: "nom",
      width: 150,
      ellipsis: true,
      render: (_, record) => (
        <Tooltip title={`${record.nom} ${record.prenom}`}>
          {record.nom} {record.prenom}
        </Tooltip>
      ),
    },
    { title: "CIN", dataIndex: "cin", key: "cin", width: 100, ellipsis: true },
    {
      title: "Email",
      dataIndex: "adresseEmail",
      key: "adresseEmail",
      width: 180,
      ellipsis: true,
    },
    {
      title: "Level",
      dataIndex: "displayNiveau",
      key: "niveau",
      width: 80,
      render: (text) => text || "-",
    },
    {
      title: "Situation",
      dataIndex: "displaySituation",
      key: "situation",
      width: 100,
      render: (text) => (
        <span style={{ textTransform: "capitalize" }}>{text || "-"}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "archivee",
      key: "archivee",
      width: 90,
      render: (text) => <span>{text ? "Archived" : "Active"}</span>,
    },
    userRole === "admin" && {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space style={{ justifyContent: "center", width: "100%" }}>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditSituation(record)}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
          <Button
            size="small"
            icon={<InfoCircleOutlined />}
            onClick={() => handleDetails(record._id)}
          />
        </Space>
      ),
    },
  ].filter(Boolean);

  return (
    <div
      style={{
        height: "calc(100vh - 140px)",
        overflowY: "auto",
        padding: "16px",
      }}
    >
      {error && <Alert message={error} type="error" showIcon />}
      {loading ? (
        <Spin tip="Loading..." size="large" />
      ) : (
        <>
          <Space
            style={{
              marginBottom: 16,
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Space>
              <Input
                placeholder="Search by name, CIN, or email"
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                prefix={<SearchOutlined />}
                style={{ width: 250 }}
              />
             <Select
  style={{ width: 180 }}
  placeholder="Academic year"
  value={selectedAcademicYear}
  onChange={setSelectedAcademicYear}
>
  <Option value="all">All Years</Option>
  {availableYears.map(year => (
    <Option key={year} value={year}>{year}</Option>
  ))}
</Select>
              <Select
                style={{ width: 120 }}
                placeholder="Level"
                value={selectedNiveau}
                onChange={setSelectedNiveau}
              >
                <Option value="all">All Levels</Option>
                {availableNiveaux.map(niveau => (
                  <Option key={niveau} value={niveau}>Level {niveau}</Option>
                ))}
              </Select>
            </Space>
            {userRole === "admin" && (
              <>
                <Space>
                  {selectedStudents.length > 0 && (
                    <Button
                      type="primary"
                      onClick={handleBatchUpdateClick}
                      disabled={selectedStudents.length === 0}
                    >
                      Update Selected ({selectedStudents.length})
                    </Button>
                  )}
                  <Button type="primary" onClick={showModal}>
                    + Add Student
                  </Button>
                  <Button 
  type="primary" 
  onClick={handleNotifyDiplomeStudents}
  loading={loading}
>
  Notify Old Students
</Button>
                  <Upload
                    accept=".xlsx, .xls, .csv"
                    disabled={importing}
                    customRequest={({ file, onSuccess }) => {
                      handleImport(file);
                      onSuccess();
                    }}
                    showUploadList={false}
                  >
                    <Button icon={<UploadOutlined />} loading={importing}>
                      {importing ? "Importing..." : "Import Students"}
                    </Button>
                  </Upload>
                </Space>
              </>
            )}
          </Space>

          <AddStudentModal
            isModalVisible={isModalVisible}
            handleCancel={handleCancel}
            handleAddStudent={handleAddStudent}
            loadStudents={loadStudents}
          />

          <Modal
            title={
              selectedStudents.length === 1
                ? "Update Student Situation"
                : `Update ${selectedStudents.length} Students' Situations`
            }
            visible={isSituationModalVisible}
            onOk={handleUpdateSituation}
            onCancel={() => {
              setIsSituationModalVisible(false);
              setSelectedStudents([]);
              setSelectedRowKeys([]);
            }}
            okText="Update"
            cancelText="Cancel"
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="anneeAcademique"
                label="Academic Year"
                rules={[
                  {
                    required: true,
                    message: "Please input the academic year (e.g., 2024-2025)",
                  },
                  {
                    pattern: /^\d{4}-\d{4}$/,
                    message: "Please use format YYYY-YYYY (e.g., 2024-2025)",
                  },
                ]}
              >
                <Input placeholder="e.g., 2024-2025" />
              </Form.Item>
              <Form.Item
                name="niveau"
                label="Level"
                rules={[
                  {
                    required: true,
                    message: "Please input the level",
                  },
                ]}
              >
                <Input placeholder="e.g., 1, 2, 3..." />
              </Form.Item>
              <Form.Item
                name="nouvelleSituation"
                label="New Situation"
                rules={[
                  {
                    required: true,
                    message: "Please select a situation",
                  },
                ]}
              >
                <Select placeholder="Select situation">
                  <Option value="passe">Passe</Option>
                  <Option value="redouble">Redouble</Option>
                  <Option value="diplome">Diplomé</Option>
                </Select>
              </Form.Item>
            </Form>
          </Modal>

          <Table
            rowSelection={userRole === "admin" ? rowSelection : undefined}
            columns={columns}
            dataSource={filteredData}
            rowKey="_id"
            pagination={{ pageSize: 20 }}
            bordered
            scroll={{ y: "calc(100vh - 250px)" }}
            size="small"
          />
        </>
      )}
    </div>
  );
}

export default StudentTable;