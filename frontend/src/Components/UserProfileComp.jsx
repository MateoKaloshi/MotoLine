import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";
import axios from "axios";
import { getAuthToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import "../CSS/settingsStyle.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000/api";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const token = getAuthToken();
        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const res = await axios.get(`${API_BASE}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data.user || res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading)
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" />
      </div>
    );

  if (error)
    return (
      <div className="text-center text-danger py-4">
        <p>{error}</p>
      </div>
    );

  if (!user)
    return (
      <div className="text-center py-4">
        <p>No user data available</p>
      </div>
    );

  return (
    <Container className="my-5 profilePadding" style={{ maxWidth: 600 }}>
      <h2 className="mb-4">User Profile</h2>
      <Card>
        <Card.Body>
          <Row className="mb-2">
            <Col sm={4}>
              <strong>First Name:</strong>
            </Col>
            <Col sm={8}>{user.first_name || "-"}</Col>
          </Row>
          <Row className="mb-2">
            <Col sm={4}>
              <strong>Last Name:</strong>
            </Col>
            <Col sm={8}>{user.last_name || "-"}</Col>
          </Row>
          <Row className="mb-2">
            <Col sm={4}>
              <strong>Email:</strong>
            </Col>
            <Col sm={8}>{user.email || "-"}</Col>
          </Row>
          <Row className="mb-2">
            <Col sm={4}>
              <strong>Address:</strong>
            </Col>
            <Col sm={8}>{user.adress || "-"}</Col>
          </Row>
          <Row className="mb-2">
            <Col sm={4}>
              <strong>Phone Number:</strong>
            </Col>
            <Col sm={8}>{user.phone_number || "-"}</Col>
          </Row>
          <div className="d-flex justify-content-end mt-3 profileButtonStyle">
            <Button variant="danger" onClick={() => navigate("/settings")}>
              Edit
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
