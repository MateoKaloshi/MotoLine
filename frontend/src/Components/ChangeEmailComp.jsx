import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { getAuthToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

const ChangeEmailComp = () => {
  const [form, setForm] = useState({ email: "", newEmail: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) navigate("/login", { replace: true });
  }, [navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const token = getAuthToken();
    if (!token) {
      setError("You must be logged in");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.put(`${API_BASE}/api/change-email`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(res.data.message);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Error updating email");
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "500px" }}>
      <h2>Change Email</h2>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Current Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter current email"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>New Email</Form.Label>
          <Form.Control
            type="email"
            name="newEmail"
            value={form.newEmail}
            onChange={handleChange}
            placeholder="Enter new email"
            required
          />
        </Form.Group>

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : "Update Email"}
        </Button>
      </Form>
    </Container>
  );
};

export default ChangeEmailComp;
