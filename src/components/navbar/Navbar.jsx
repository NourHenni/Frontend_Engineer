import React from 'react';
import { Avatar, Col, Layout, Row, Dropdown, Menu } from 'antd';
import LogoIsamm from '../../assets/images/isamm.png'; // Assure-toi que le chemin est correct
import { UserOutlined } from '@ant-design/icons';
import './Navbar.css';

function Navbar() {
  // Handle logout action
  const handleLogout = () => {
    // Remove token from localStorage or any other logout logic
    localStorage.removeItem('token');
    // Redirect to login page (you can use navigate if using react-router)
    window.location.href = '/';  // Redirecting to login page after logout
  };

  // Menu for dropdown
  const menu = (
    <Menu>
      <Menu.Item key="logout" onClick={handleLogout}>
        Logout
      </Menu.Item>
     
    </Menu>
  );

  return (
    <Layout.Header className="navbar">
      <Row align="middle" className="navbar__logo">
        <Col>
          <img src={LogoIsamm} alt="isamm-logo" className="isamm-logo" />
        </Col>
        <Col className="navbar__text-logo">
          <span className="cl-1">Isamm</span>
          <span className="cl-wh">Engineers Platform</span>
        </Col>
      </Row>
      <div className="navbar__user">
        <Dropdown overlay={menu} trigger={['click']}>
          <Avatar className="navbar__avatar" icon={<UserOutlined />} />
        </Dropdown>
      </div>
    </Layout.Header>
  );
}
export default Navbar;
