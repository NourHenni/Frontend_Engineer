import React, { useEffect, useState } from "react";
import {
  Table,
  Spin,
  Alert,
  Input,
  Space,
  Button,
  Tooltip,
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
import { fetchTeachers, createTeacher } from "../../services/userService";
import { useNavigate } from "react-router-dom";
import AddTeacherModal from "./AddTeacherModal";
import * as XLSX from "xlsx";

function TeacherTable() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [importing, setImporting] = useState(false);  // State for import button spinner
  const navigate = useNavigate();

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const teachers = await fetchTeachers();
      setData(teachers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleSearch = (value) => setSearchText(value.toLowerCase());

  const filteredData = data.filter((teacher) =>
    ["nom", "prenom", "cin", "adresseEmail"].some((key) =>
      teacher[key]?.toString().toLowerCase().includes(searchText)
    )
  );

  const handleEdit = (teacher) => console.log("Edit teacher:", teacher);
  const handleDelete = (id) => console.log("Delete teacher with ID:", id);
  const handleDetails = (id) => navigate(`/teacher/${id}`);

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);
  
   const handleAddTeacher = async (newTeacher) => {
      try {
        // You can add any additional logic here if necessary
        await loadTeachers();
        setIsModalVisible(false);
        setData((prev) => [...prev, newTeacher]); // Reload the student list to reflect the new addition
        
         // Close the modal after adding the student
      } catch (error) {
        message.error("Failed to update student list.");
      }
    };

  const handleImport = (file) => {
    setImporting(true); // Start spinner during import
    const reader = new FileReader();
    reader.onload = async (e) => {
      const binaryStr = e.target.result;
      const wb = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(ws);

      try {
        for (let teacherData of jsonData) {
          await createTeacher(teacherData);
        }
        message.success("Teachers imported successfully");
        const teachers = await fetchTeachers(); // Refresh table data
        setData(teachers);
      } catch (err) {
        message.error("Failed to import teachers: " + err.message);
      } finally {
        setImporting(false); // Always stop spinner
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
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
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
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space style={{ justifyContent: "center", width: "100%" }}>
          
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          />
          <Button
            size="small"
            icon={<InfoCircleOutlined />}
            onClick={() => handleDetails(record._id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ height: "calc(100vh - 140px)", overflowY: "auto", padding: "16px" }}>
      {error && <Alert message={error} type="error" showIcon />}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20vh" }}>
          <Spin tip="Loading..." size="large" />
        </div>
      ) : (
        <>
          <Space style={{ marginBottom: 16, width: "100%", justifyContent: "space-between" }}>
            <Input
              placeholder="Search by name, CIN, or email"
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
            />
            <Button type="primary" onClick={showModal}>
              + Add Teacher
            </Button>
            <Upload
              accept=".xlsx, .xls, .csv"
              customRequest={({ file, onSuccess }) => {
                handleImport(file);
                onSuccess();
              }}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />} loading={importing}>
                {importing ? "Importing..." : "Import Teachers"}
              </Button>
            </Upload>
          </Space>

          <AddTeacherModal
            isModalVisible={isModalVisible}
            handleCancel={handleCancel}
            handleAddTeacher={handleAddTeacher}
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

export default TeacherTable;
