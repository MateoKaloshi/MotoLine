// src/Components/RegisterComp.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Form,
  Button,
  Card,
  InputGroup,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../CSS/registerStyle.css";
import helmet from "../Images/Login/helmeticon.png";

export default function RegisterComp() {
  const navigate = useNavigate();
  const phoneRef = useRef(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    address: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // general alert
  const [success, setSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({}); // { phone_number: "..." }

  useEffect(() => {
    document.body.classList.add("bg-register-hero");
    return () => document.body.classList.remove("bg-register-hero");
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFieldErrors((prev) => ({ ...prev, [name]: null }));
    setError(null);
    setForm((p) => ({ ...p, [name]: value }));
  };

  const parseDuplicateKeyError = (serverMsg) => {
    if (!serverMsg) return null;
    const msg = typeof serverMsg === "string" ? serverMsg : JSON.stringify(serverMsg);

    if (!/E11000|duplicate key/i.test(msg)) return null;

    if (/phone_number/i.test(msg)) return "phone_number";
    if (/email/i.test(msg)) return "email";

    const idxMatch = msg.match(/index:\s*([^\s]+)/i);
    if (idxMatch && idxMatch[1]) {
      const idx = idxMatch[1].replace(/_[0-9]+$/, "");
      if (/phone/i.test(idx)) return "phone_number";
      if (/email/i.test(idx)) return "email";
      return idx;
    }

    const dupMatch = msg.match(/dup key:\s*\{\s*("?)([a-zA-Z0-9_]+)\1\s*:/i);
    if (dupMatch && dupMatch[2]) {
      return dupMatch[2];
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    const { first_name, last_name, phone_number, email, password } = form;
    if (!first_name || !last_name || !phone_number || !email || !password) {
      return setError("Please fill all required fields.");
    }

    setIsLoading(true);
    try {
      const base = process.env.REACT_APP_API_URL || "http://localhost:5000";
      await axios.post(`${base}/api/register`, form);

      setSuccess("Account created — redirecting to login...");
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.errmsg ||
        err?.response?.data ||
        err?.message;

      const dupField = parseDuplicateKeyError(serverMsg);

      if (dupField) {
        const friendly =
          dupField === "phone_number" ? "Phone number" : dupField === "email" ? "Email" : dupField;
        const message = `${friendly} is already in use.`;

        setFieldErrors({ [dupField]: message });
        setError(null);

        // focus phone field when phone duplicate occurs
        if (dupField === "phone_number" && phoneRef.current) {
          phoneRef.current.focus();
        }
      } else {
        const fallback =
          (err?.response?.data?.message && String(err.response.data.message)) ||
          (err?.response?.data && JSON.stringify(err.response.data)) ||
          err.message ||
          "Registration failed";
        setError(fallback);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="register-form-page d-flex align-items-center justify-content-center">
      <Card className="register-form-card shadow-lg">
        <Card.Body className="p-4 p-lg-5">
          <div className="d-flex justify-content-center mb-3">
            <div className="avatar">
              <img src={helmet} alt="Helmet Icon" width="36" height="36" />
            </div>
          </div>

          <h3 className="text-center mb-4">Create an account</h3>

          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <Form onSubmit={handleSubmit} noValidate>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="first_name">
                  <Form.Label>First name</Form.Label>
                  <InputGroup className="register-input-group input-group-lg">
                    <InputGroup.Text className="bg-white border-end-0" id="first-addon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="currentColor" d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                      </svg>
                    </InputGroup.Text>
                    <Form.Control
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      className="border-start-0"
                      placeholder="First name"
                      aria-describedby="first-addon"
                      required
                      isInvalid={!!fieldErrors.first_name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.first_name}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3" controlId="last_name">
                  <Form.Label>Last name</Form.Label>
                  <InputGroup className="register-input-group input-group-lg">
                    <InputGroup.Text className="bg-white border-end-0" id="last-addon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="currentColor" d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zM4 20.4v-1.6c0-2.2 4.4-3.6 8-3.6s8 1.4 8 3.6v1.6H4z" />
                      </svg>
                    </InputGroup.Text>
                    <Form.Control
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      className="border-start-0"
                      placeholder="Last name"
                      aria-describedby="last-addon"
                      required
                      isInvalid={!!fieldErrors.last_name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.last_name}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="phone_number">
              <Form.Label>Phone number</Form.Label>
              <InputGroup className="register-input-group input-group-lg">
                <InputGroup.Text className="bg-white border-end-0" id="phone-addon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M6.6 10.2a15.1 15.1 0 0 0 7.2 7.2l2.1-2.1a1.2 1.2 0 0 1 1.2-.3c1.3.4 2.7.6 4.1.6a1.2 1.2 0 0 1 1.2 1.2V20c0 .7-.5 1.2-1.2 1.2C10.1 21.2 2.8 13.9 2.8 4.2 2.8 3.5 3.3 3 4 3h2.6c.7 0 1.2.5 1.2 1.2 0 1.4.2 2.8.6 4.1.1.4 0 .9-.3 1.2L6.6 10.2z" />
                  </svg>
                </InputGroup.Text>
                <Form.Control
                  ref={phoneRef}
                  name="phone_number"
                  value={form.phone_number}
                  onChange={handleChange}
                  type="tel"
                  className="border-start-0"
                  placeholder="e.g. +355 69 000 0000"
                  aria-describedby="phone-addon"
                  required
                  isInvalid={!!fieldErrors.phone_number}
                />
                <Form.Control.Feedback type="invalid">
                  {fieldErrors.phone_number}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3" controlId="address">
              <Form.Label>Address</Form.Label>
              <InputGroup className="register-input-group input-group-lg">
                <InputGroup.Text className="bg-white border-end-0" id="addr-addon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M12 2C8.1 2 5 5.1 5 9c0 5.3 6.1 11.4 6.4 11.7.2.2.5.3.8.3s.6-.1.8-.3C12.9 20.4 19 14.3 19 9c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5 2.5 2.5 0 0 1 12 11.5z" />
                  </svg>
                </InputGroup.Text>
                <Form.Control
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="border-start-0"
                  placeholder="Street, City"
                  aria-describedby="addr-addon"
                  isInvalid={!!fieldErrors.address}
                />
                <Form.Control.Feedback type="invalid">
                  {fieldErrors.address}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <InputGroup className="register-input-group input-group-lg">
                <InputGroup.Text className="bg-white border-end-0" id="email-addon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </InputGroup.Text>
                <Form.Control
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  className="border-start-0"
                  placeholder="name@example.com"
                  aria-describedby="email-addon"
                  required
                  isInvalid={!!fieldErrors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {fieldErrors.email}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-4" controlId="password">
              <Form.Label>Password</Form.Label>
              <InputGroup className="register-input-group input-group-lg">
                <InputGroup.Text className="bg-white border-end-0" id="pwd-addon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M17 8V7a5 5 0 0 0-10 0v1H5v12h14V8h-2zM9 7a3 3 0 0 1 6 0v1H9V7z" />
                  </svg>
                </InputGroup.Text>
                <Form.Control
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type="password"
                  className="border-start-0"
                  placeholder="Enter password"
                  aria-describedby="pwd-addon"
                  minLength={8}
                  required
                  isInvalid={!!fieldErrors.password}
                />
                <Form.Control.Feedback type="invalid">
                  {fieldErrors.password}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <div className="d-grid mb-3">
              <Button
                variant="primary"
                size="lg"
                className="register-buttonStyle"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Creating...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </div>

            <div className="text-center mt-2">
              <p className="mb-0">
                Already have an account?{" "}
                <Link to="/login" className="register-createStyle">
                  Sign in
                </Link>
              </p>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </main>
  );
}
