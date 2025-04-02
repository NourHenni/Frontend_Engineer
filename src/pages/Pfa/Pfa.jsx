import React from "react";
import Navbar from "../../components/navbar/Navbar";
import SidebarLayout from "../../components/sidebar/Sidebar";
import TableData from "../../components/table/TableData";
import { Space } from "antd";
import moment from "moment";
import ButtonModel from "../../components/button/Button";
import { PlusOutlined } from "@ant-design/icons";
import "./Pfa.css"; // On garde le CSS

function Pfa() {
  const columns = [
    {
      title: "Nom de la période",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Période de pfa",
      dataIndex: "Period",
      key: "Period",
      render: (_, record) => {
        let startDate = moment(record.start_date).format("DD/MM/YYYY");
        let endDate = moment(record.end_date).format("DD/MM/YYYY");

        return (
          <span>
            du {startDate} à {endDate}
          </span>
        );
      },
    },
    {
      title: "Type",
      dataIndex: "Type",
      key: "type",
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a>Modifier la période {record.name}</a>
          <a>Consulter les sujets PFAs</a>
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: "1",
      name: "Apple",
      category: "Fruit",
      price: "$1.00",
      stock: "In Stock",
    },
    {
      key: "2",
      name: "Laptop",
      category: "Electronics",
      price: "$1000.00",
      stock: "Out of Stock",
    },
    {
      key: "3",
      name: "Shirt",
      category: "Clothing",
      price: "$20.00",
      stock: "In Stock",
    },
  ];

  return (
    <div>
      <Navbar />
      <SidebarLayout />

      {/* Conteneur général de la table */}
      <div className="table-container">
        {/* Conteneur du titre et du bouton */}
        <div className="table-header">
          <h2>Liste des périodes</h2>
          <ButtonModel text="Ajouter une session" icon={<PlusOutlined />} />
        </div>

        {/* Tableau */}
        <TableData columns={columns} data={data} />
      </div>
    </div>
  );
}

export default Pfa;
