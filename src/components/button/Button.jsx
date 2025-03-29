import { Button } from "antd";

import "./Buton.css";
function ButtonModel({ icon }) {
  return (
    <div className="button-container">
      <Button type="primary" className="button-button" icon={icon}>
        Ajouter
      </Button>
    </div>
  );
}

export default ButtonModel;
