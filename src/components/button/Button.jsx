import { Button } from "antd";
import PropTypes from "prop-types";
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

// Validation des props
ButtonModel.propTypes = {
  text: PropTypes.string.isRequired,
  icon: PropTypes.node,
  onClick: PropTypes.func,
};

// Valeurs par défaut optionnelles (si besoin)
ButtonModel.defaultProps = {
  icon: null,
  onClick: () => {},
};

export default ButtonModel;
