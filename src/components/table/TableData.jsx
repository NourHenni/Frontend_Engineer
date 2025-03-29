import React from "react";
import { Space, Table, Tag } from "antd";
import "./TableData.css";

const TableData = ({ columns, data }) => (
  <Table columns={columns} dataSource={data} />
);
export default TableData;
