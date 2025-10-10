import React, { useState } from "react";
import {
  Form,
  Button,
  Card,
  Spinner,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import axios from "axios";
import "../CSS/saveContactStyle.css";

const baseURl = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function SaveContactComp() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const validate = () => {
    if (!form.firstName || !form.firstName.trim()) {
      setError("First name is required.");
      return false;
    }
    if (!form.lastName || !form.lastName.trim()) {
      setError("Last name is required.");
      return false;
    }
    if (!form.email || !/.+@.+\..+/.test(form.email.trim())) {
      setError("Please provide a valid email address.");
      return false;
    }
    if (!form.subject) {
      setError("Please enter a subject.");
      return false;
    }
    if (!form.message || form.message.trim().length < 5) {
      setError("Please enter a message (at least 5 characters).");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validate()) return;

    setSending(true);
    try {
      const payload = {
        name: (form.firstName || "").trim(),
        last_name: (form.lastName || "").trim(),
        email: (form.email || "").trim().toLowerCase(),
        phone: form.phone ? form.phone.trim() : undefined,
        subject: form.subject ? form.subject.trim() : undefined,
        message: (form.message || "").trim(),
      };

      await axios.post(`${baseURl}/api/contact`, payload);

      setSuccess("Your report has been sent. We'll get back to you soon.");
      setForm((prev) => ({ ...prev, subject: "", message: "" }));
    } catch (err) {
      console.error("Contact submit error:", err);
      const backendMsg =
        err?.response?.data?.message || err?.response?.data || err?.message;
      setError(backendMsg || "Failed to send. Please try again later.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="contact-form-page d-flex align-items-center justify-content-center">
      <Card className="contact-form-card shadow-lg">
        <Card.Body className="p-4 p-lg-5">
          <div className="d-flex justify-content-center mb-3">
            <div className="avatar" aria-hidden="true" />
          </div>

          <h3 className="text-center mb-4">Report an Issue / Contact Us</h3>

          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <Form onSubmit={handleSubmit} noValidate>
            <Row className="g-2">
              <Col xs={12} sm={6}>
                <Form.Group className="mb-3" controlId="contactFirstName">
                  <Form.Label>First name</Form.Label>
                  <InputGroup className="contact-input-group input-group-lg">
                    <InputGroup.Text
                      className="bg-white border-end-0"
                      id="contact-fname-addon"
                      aria-hidden="true"
                    />
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="First name"
                      className="border-start-0"
                      aria-describedby="contact-fname-addon"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col xs={12} sm={6}>
                <Form.Group className="mb-3" controlId="contactLastName">
                  <Form.Label>Last name</Form.Label>
                  <InputGroup className="contact-input-group input-group-lg">
                    <InputGroup.Text
                      className="bg-white border-end-0"
                      id="contact-lname-addon"
                      aria-hidden="true"
                    />
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Last name"
                      className="border-start-0"
                      aria-describedby="contact-lname-addon"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group className="mb-3" controlId="contactEmail">
                  <Form.Label>Email</Form.Label>
                  <InputGroup className="contact-input-group input-group-lg">
                    <InputGroup.Text
                      className="bg-white border-end-0"
                      id="contact-email-addon"
                      aria-hidden="true"
                    />
                    <Form.Control
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="border-start-0"
                      aria-describedby="contact-email-addon"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group className="mb-3" controlId="contactPhone">
                  <Form.Label>
                    Phone <small className="text-muted">(optional)</small>
                  </Form.Label>
                  <InputGroup className="contact-input-group input-group-lg">
                    <InputGroup.Text
                      className="bg-white border-end-0"
                      id="contact-phone-addon"
                      aria-hidden="true"
                    />
                    <Form.Control
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+355 68 648 6956"
                      className="border-start-0"
                      aria-describedby="contact-phone-addon"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group className="mb-3" controlId="contactSubject">
                  <Form.Label>Subject</Form.Label>
                  <InputGroup className="contact-input-group input-group-lg">
                    <Form.Control
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="Short summary"
                      className="border-start-0"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group className="mb-3" controlId="contactMessage">
                  <Form.Label>Message</Form.Label>
                  <InputGroup className="contact-input-group">
                    <Form.Control
                      as="textarea"
                      rows={6}
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Describe the issue..."
                      className="border-start-0"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-grid mb-3">
              <Button
                variant="primary"
                size="lg"
                className="contact-buttonStyle"
                type="submit"
                disabled={sending}
              >
                {sending ? (
                  <>
                    <Spinner
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Sending...
                  </>
                ) : (
                  "Send Report"
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </main>
  );
}
