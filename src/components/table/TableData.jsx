import React from "react";
import { Space, Table, Tag } from "antd";

const TableData = ({ columns, data }) => (
  <Table columns={columns} dataSource={data} />
);
export default TableData;
