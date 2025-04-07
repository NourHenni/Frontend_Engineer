import React , { useEffect } from 'react';
import { Result, Button } from 'antd';
import { CheckCircleFilled, FilePdfOutlined } from '@ant-design/icons';
import './SuccessAlert.css';

 
  const SuccessAlert = ({ onClose, stageDetails }) => {
    useEffect(() => {
        // Crée des confettis
        if (stageDetails) {
          for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
            document.body.appendChild(confetti);
            
            // Supprime après l'animation
            setTimeout(() => {
              confetti.remove();
            }, 5000);
          }
        }
      }, [stageDetails]);
  return (
    <div className="success-alert-overlay">
      <div className="success-alert-container">
        <Result
          icon={<CheckCircleFilled className="success-icon" />}
          title="Dépôt réussi !"
          subTitle={
            <>
              Votre sujet "{stageDetails.titreSujet}" pour {stageDetails.nomEntreprise} a bien été enregistré.
              <p>Niveau : <strong>{stageDetails.niveau}</strong> <br />
              Année : <strong>{stageDetails.anneeStage}</strong>
</p>
              <div className="success-details">
                <p><FilePdfOutlined /> Référence: {stageDetails.reference}</p>
              </div>
            </>
          }
          extra={[
            <Button 
              type="primary" 
              key="close" 
              onClick={onClose}
              className="success-button"
            >
              Retour à l'accueil
            </Button>,
            <Button 
              key="print" 
              onClick={() => window.print()}
              className="success-button secondary"
            >
              Imprimer la confirmation
            </Button>,
          ]}
        />
      </div>
    </div>
  );
};

export default SuccessAlert;