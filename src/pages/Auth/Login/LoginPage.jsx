import React, { useState } from "react";
import { Form, Input, Button, Checkbox, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import LogoIsamm from "../../../assets/images/isamm.png";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle form submission
  const onFinish = async (values) => {
    try {
      const response = await axios.post("http://localhost:5000/auth/login", {
        cin: values.email,
        password: values.password,
      });

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        // Forcez un re-render de l'application
        window.location.href = "/home"; // Solution temporaire
      }
    } catch (error) {
      console.error("Error during login:", error);
      message.error("CIN ou Password incorrecte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <div className="logo-container">
          <img src={LogoIsamm} alt="isamm-logo" className="login-logo" />
        </div>
        <h2>Login</h2>
        <Form
          name="login"
          onFinish={onFinish}
          initialValues={{ remember: true }}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Please input your CIN!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="CIN" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <a href="#" style={{ float: "right" }}>
              Forgot password
            </a>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Log in
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
