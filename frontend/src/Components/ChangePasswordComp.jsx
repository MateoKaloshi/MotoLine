import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { getAuthToken } from "../utils/auth";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });
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
    setMessage("");
    setError("");

    if (form.newPassword !== form.confirmPassword) {
      return setError("New passwords do not match");
    }

    if (!form.currentPassword || !form.newPassword) {
      return setError("Please fill all fields");
    }

    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        setError("You must be logged in");
        navigate("/login", { replace: true });
        return;
      }

      const res = await axios.put(
        `${API_BASE}/api/change-password`,
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(res.data.message || "Password changed successfully");
      setError("");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Change password error:", err?.response || err);
      setError(err.response?.data?.message || "Error changing password");
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login", { replace: true }), 800);
      }
    } finally {
      setLoading(false);
    }
  };

  const EyeToggleButton = ({ field }) => (
    <button
      type="button"
      className="input-group-text bg-white border-start-0"
      onClick={() => setShow((p) => ({ ...p, [field]: !p[field] }))}
      style={{ cursor: "pointer" }}
      aria-label={show[field] ? "Hide password" : "Show password"}
    >
      {show[field] ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 
            11-7-4-7-11-7zm0 12c-2.8 
            0-5-2.2-5-5s2.2-5 5-5 
            5 2.2 5 5-2.2 5-5 5zm0-8a3 
            3 0 1 0 0 6 3 3 0 0 0 0-6z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M12 5c-7 0-11 7-11 7s1.7 
            3 4.8 5.2l-2.1 2.1 
            1.4 1.4 16.9-16.9-1.4-1.4-2.4 
            2.4C16.5 5.3 14.3 5 12 5zM4.7 
            12c.7-.9 2.9-3.7 7.3-3.7 
            1.4 0 2.6.3 3.6.8L13.5 
            11a3 3 0 0 0-4.2 4.2l-2.1 
            2.1C5.7 15.4 4.9 13.4 4.7 12zm7.3 
            7c-1.8 0-3.4-.3-4.8-.9l2.5-2.5a5 
            5 0 0 0 6.9-6.9l2.4-2.4C21.1 
            9.3 23 12 23 12s-4 7-11 7z"
          />
        </svg>
      )}
    </button>
  );

  return (
    <Container className="mt-5" style={{ maxWidth: 560 }}>
      <h2 className="mb-4">Change Password</h2>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        {/* Current Password */}
        <Form.Group className="mb-3" controlId="currentPassword">
          <Form.Label>Current Password</Form.Label>
          <div className="input-group input-group-lg">
            <input
              type={show.current ? "text" : "password"}
              name="currentPassword"
              className="form-control form-control-lg border-end-0"
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="Enter current password"
              required
            />
            <EyeToggleButton field="current" />
          </div>
        </Form.Group>

        {/* New Password */}
        <Form.Group className="mb-3" controlId="newPassword">
          <Form.Label>New Password</Form.Label>
          <div className="input-group input-group-lg">
            <input
              type={show.new ? "text" : "password"}
              name="newPassword"
              className="form-control form-control-lg border-end-0"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              minLength={6}
              required
            />
            <EyeToggleButton field="new" />
          </div>
        </Form.Group>

        {/* Confirm Password */}
        <Form.Group className="mb-3" controlId="confirmPassword">
          <Form.Label>Confirm New Password</Form.Label>
          <div className="input-group input-group-lg">
            <input
              type={show.confirm ? "text" : "password"}
              name="confirmPassword"
              className="form-control form-control-lg border-end-0"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              minLength={6}
              required
            />
            <EyeToggleButton field="confirm" />
          </div>
        </Form.Group>

        <Button type="submit" variant="primary" size="lg" disabled={loading}>
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />{" "}
              Changing...
            </>
          ) : (
            "Change Password"
          )}
        </Button>
      </Form>
    </Container>
  );
}
