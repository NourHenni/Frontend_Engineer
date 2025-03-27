import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import './Buton.css'
function ButtonModel() {
    return ( 
        <div className="button-container">
             <Button
        type="primary"
        className="button-button"
        icon={<PlusOutlined />}
      >
        Ajouter un Pays
      </Button>
        </div>
       
     );
}

export default ButtonModel;