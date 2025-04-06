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
} from "../../services/userService";
import { useNavigate } from "react-router-dom";
import AddStudentModal from "./AddStudentModal";
import * as XLSX from "xlsx";

function StudentTable() {
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false); // New state for import loading
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userRole, setUserRole] = useState(null); // State to store user role
  const navigate = useNavigate();

  const loadStudents = async () => {
    setLoading(true);
    try {
      const students = await fetchStudents();
      setData(students);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();

    // Decoding the token to get the role
    const token = localStorage.getItem("token");
    if (token) {
      try {
        console.log("Token found:", token); // Debugging: log the token

        // Decode the token (JWT structure: Header.Payload.Signature)
        const base64Url = token.split(".")[1]; // Get the payload part of the JWT token
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Adjust URL-safe base64 characters
        const decodedPayload = JSON.parse(atob(base64)); // Decode and parse the base64 payload

        console.log("Decoded Payload:", decodedPayload); // Debugging: log the decoded payload

        setUserRole(decodedPayload.role); // Assuming 'role' is stored in the token
      } catch (error) {
        console.error("Error decoding token", error);
      }
    } else {
      console.log("No token found in localStorage."); // Debugging: log if no token is found
    }
  }, []);

  const handleSearch = (value) => setSearchText(value.toLowerCase());

  const filteredData = data.filter((student) =>
    ["nom", "prenom", "cin", "adresseEmail"].some((key) =>
      student[key]?.toString().toLowerCase().includes(searchText)
    )
  );

  const handleEdit = (student) => {
    console.log("Edit student:", student);
    // TODO: Edit modal logic
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
      // You can add any additional logic here if necessary
      await loadStudents(); // Reload the student list to reflect the new addition
      setIsModalVisible(false); // Close the modal after adding the student
    } catch (error) {
      message.error("Failed to update student list.");
    }
  };

  const handleImport = (file) => {
    const reader = new FileReader();
    setImporting(true); // Start loading
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
        setImporting(false); // Stop loading
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
      title: "Birth Date",
      dataIndex: "dateDeNaissance",
      key: "dateDeNaissance",
      width: 120,
      render: (text) => (text ? new Date(text).toLocaleDateString() : "-"),
    },
    {
      title: "University",
      dataIndex: "universite",
      key: "universite",
      width: 150,
      ellipsis: true,
    },
    {
      title: "Speciality",
      dataIndex: "specialite",
      key: "specialite",
      width: 150,
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "archivee",
      key: "archivee",
      width: 90,
      render: (text) => <span>{text ? "Archived" : "Active"}</span>,
    },
    // Conditionally render the 'Actions' column based on user role
    userRole === "admin" && {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space style={{ justifyContent: "center", width: "100%" }}>
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
  ].filter(Boolean); // Filter out any null or undefined columns

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
            <Input
              placeholder="Search by name, CIN, or email"
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
            />
            {userRole === "admin" && (
              <>
                <Button type="primary" onClick={showModal}>
                  + Add Student
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
              </>
            )}
          </Space>

          <AddStudentModal
            isModalVisible={isModalVisible}
            handleCancel={handleCancel}
            handleAddStudent={handleAddStudent}
            loadStudents={loadStudents}  // Pass loadStudents as a prop
          />

          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
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
