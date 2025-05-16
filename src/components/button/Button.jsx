import { Button } from "antd";

import "./Buton.css";
function ButtonModel({ text, icon, onClick }) {
  return (
    <div className="button-container">
      <Button
        type="primary"
        className="button-button"
        icon={icon}
        onClick={onClick}
      >
        {text}
      </Button>
    </div>
  );
}

export default ButtonModel;
