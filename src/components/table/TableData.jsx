import React from "react";
import { Table } from "antd";
import "./TableData.css";

const TableData = ({
  columns,
  data,
  loading,
  pagination,
  onPaginationChange,
}) => (
  <Table
    columns={columns}
    dataSource={data}
    pagination={{
      ...pagination, // Inclure toutes les options de pagination
      onChange: onPaginationChange, // Appeler une fonction de gestion de pagination dans le parent
      showSizeChanger: true, // Afficher l'option pour changer la taille de la page
      //showQuickJumper: true, // Ajouter la possibilité de sauter directement à une page
    }}
    loading={loading}
  />
);

export default TableData;
