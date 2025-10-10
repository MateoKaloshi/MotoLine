import React from "react";
import { Card, Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getAuthToken } from "../utils/auth";


const SettingsPageComp = () => {
  const navigate = useNavigate();

  return (
    <Container className="mt-5 settingsPagePadding">
      <h2>Settings</h2>
      <Row className="mt-4">
        <Col md={4}>
          <Card className="mb-3 settingsCardStyle">
            <Card.Body>
              <Card.Title>Update Profile</Card.Title>
              <Card.Text>Change your personal information.</Card.Text>
              <Button
                style={{ display: "flex", justifyContent: "flex-end" }}
                variant="primary"
                onClick={() => navigate("/settings/update-profile")}
              >
                Go
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Change Email</Card.Title>
              <Card.Text>Update your email address.</Card.Text>
              <Button
                variant="primary"
                onClick={() => navigate("/settings/change-email")}
              >
                Go
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Change Password</Card.Title>
              <Card.Text>Update your account password.</Card.Text>
              <Button
                variant="primary"
                onClick={() => navigate("/settings/change-password")}
              >
                Go
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SettingsPageComp;
