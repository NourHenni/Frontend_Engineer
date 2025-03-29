import { Avatar, Col, Layout, Row } from "antd";
import LogoIsamm from "../../assets/images/isamm.png"; // Assure-toi que le chemin est correct
import { UserOutlined } from "@ant-design/icons";
import "./Navbar.css";

function Navbar() {
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
        <Avatar className="navbar__avatar" icon={<UserOutlined />} />
      </div>
    </Layout.Header>
  );
}
export default Navbar;
