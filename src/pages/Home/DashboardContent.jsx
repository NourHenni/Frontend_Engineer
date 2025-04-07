import React from "react";
import { Card, Col, Row, Typography } from "antd";
import { UserOutlined, TeamOutlined, LaptopOutlined, CheckCircleOutlined } from "@ant-design/icons";
import isammImage from "../../assets/images/isamm.jpg"; // ajustez le chemin si nécessaire

const { Title, Text } = Typography;

const DashboardContent = () => {
    return (
        <div
            style={{
                position: "absolute", // Assure qu'il couvre tout l'écran
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${isammImage})`, 
                backgroundSize: "cover", // Fait en sorte que l'image couvre tout l'écran
                backgroundPosition: "center", // Centre l'image
                backgroundAttachment: "fixed", // Garde l'image fixe pendant le défilement
                zIndex: 1, // Met l'image de fond derrière le contenu
            }}
        >
            <div
                style={{
                    display: "flex", // Utilise flexbox pour centrer le contenu
                    justifyContent: "center", // Centre horizontalement
                    alignItems: "center", // Centre verticalement
                    minHeight: "100vh", // Assure que le contenu prend toute la hauteur
                    padding: "40px",
                    color: "#fff", // Texte blanc pour contraste
                    position: "relative", // Garde le contenu au-dessus de l'image de fond
                }}
            >
                <div style={{ width: "100%", maxWidth: "1200px" }}>
                    <Title
                        level={1}
                        style={{
                            color: "#fff",
                            textAlign: "center",
                            marginBottom: "30px",
                            fontSize: "60px", // Taille de police plus grande
                            fontWeight: "bold", // Texte en gras pour l'accentuation
                            letterSpacing: "4px", // Ajoute de l'espacement entre les lettres
                            background: "linear-gradient(90deg, #4A90E2, #0066CC)", // Effet dégradé bleu
                            WebkitBackgroundClip: "text", // Applique le dégradé au texte
                            backgroundClip: "text", // Applique le dégradé au texte
                            textStroke: "1px #fff", // Bordure blanche du texte
                            WebkitTextStroke: "2px #004080", // Bordure bleue plus foncée pour plus de contraste
                            padding: "20px", // Espace autour du texte
                            textTransform: "uppercase", // Met le texte en majuscules
                            lineHeight: "1.2", // Hauteur de ligne pour une meilleure lisibilité
                            textShadow: "2px 2px 5px rgba(0, 0, 0, 0.3)", // Ombre subtile pour de la profondeur
                        }}
                    >
                        BIENVENUE SUR LA PLATEFORME ISAMM
                    </Title>

                    <Row gutter={[16, 16]} justify="center" align="middle">
                        <Col xs={24} sm={12} md={6}>
                            <Card
                                style={{
                                    borderRadius: "10px",
                                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                                    backgroundColor: "#fff",
                                    textAlign: "center",
                                    padding: "20px",
                                }}
                                title={<UserOutlined style={{ fontSize: "30px", color: "#1890ff" }} />}
                            >
                                <Title level={4}>Étudiants</Title>
                                <Text>Gérez et consultez les données des étudiants efficacement.</Text>
                            </Card>
                        </Col>

                        <Col xs={24} sm={12} md={6}>
                            <Card
                                style={{
                                    borderRadius: "10px",
                                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                                    backgroundColor: "#fff",
                                    textAlign: "center",
                                    padding: "20px",
                                }}
                                title={<TeamOutlined style={{ fontSize: "30px", color: "#1890ff" }} />}
                            >
                                <Title level={4}>Faculté</Title>
                                <Text>Accédez aux profils et ressources de la faculté.</Text>
                            </Card>
                        </Col>

                        <Col xs={24} sm={12} md={6}>
                            <Card
                                style={{
                                    borderRadius: "10px",
                                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                                    backgroundColor: "#fff",
                                    textAlign: "center",
                                    padding: "20px",
                                }}
                                title={<LaptopOutlined style={{ fontSize: "30px", color: "#1890ff" }} />}
                            >
                                <Title level={4}>Cours</Title>
                                <Text>Explorez les cours et le matériel disponibles.</Text>
                            </Card>
                        </Col>

                        <Col xs={24} sm={12} md={6}>
                            <Card
                                style={{
                                    borderRadius: "10px",
                                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                                    backgroundColor: "#fff",
                                    textAlign: "center",
                                    padding: "20px",
                                }}
                                title={<CheckCircleOutlined style={{ fontSize: "30px", color: "#1890ff" }} />}
                            >
                                <Title level={4}>Stages</Title>
                                <Text>Restez informé des derniers stages disponibles.</Text>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
    );
};

export default DashboardContent;
