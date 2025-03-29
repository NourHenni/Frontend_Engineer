import { Button } from "antd";

import "./Buton.css";
function ButtonModel({ text, icon }) {
  return (
    <div className="button-container">
      <Button type="primary" className="button-button" icon={icon}>
        {text}
      </Button>
    </div>
  );
}

export default ButtonModel;
