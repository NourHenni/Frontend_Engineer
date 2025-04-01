import React, { useState } from 'react';
import FormModal from '../../components/modals/FormModal'; // Ajuste le chemin en fonction de ta structure
import './Matieres.css';

function Matieres() {
  const [isModalVisible, setIsModalVisible] = useState(false); // Gère l'état de la visibilité du modal

  const showModal = () => {
    setIsModalVisible(true); // Affiche le modal
  };

  const handleFormSubmit = (data) => {
    console.log('Données du formulaire :', data);
    setIsModalVisible(false); // Ferme le modal après soumission
  };

  return (
    <div className="matieres-container">
      <h1>Liste des Matières</h1>
      
      <button onClick={showModal}>Ajouter une Matière</button>

      {isModalVisible && (
        <FormModal
          isVisible={isModalVisible} // Passe une prop pour gérer la visibilité du modal
          onClose={() => setIsModalVisible(false)} // Fonction pour fermer le modal
          onSubmit={handleFormSubmit} // Fonction pour traiter les données après soumission
        />
      )}

      {/* Autres contenus de ta page des matières */}
    </div>
  );
}

export default Matieres;
