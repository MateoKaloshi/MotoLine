import React, { useState, useEffect } from "react";
import { Form, Button, Card, Spinner, Row, Col } from "react-bootstrap";
import axios from "axios";
import { useNavigate, Navigate } from "react-router-dom";
import "../CSS/createBikeStyle.css";
import { getAuthToken } from "../utils/auth";

export default function CreateBikeComp() {
  const [form, setForm] = useState({
    brand: "",
    model: "",
    production_year: "",
    engine: "",
    published: "",
    description: "",
    price: "",
    location: "",
    is_sold: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [authToken, setAuthToken] = useState(() => getAuthToken());

  const navigate = useNavigate();

  useEffect(() => {
    function onAuthChanged() {
      setAuthToken(getAuthToken());
    }
    window.addEventListener("authChanged", onAuthChanged);
    window.addEventListener("storage", onAuthChanged);

    return () => {
      window.removeEventListener("authChanged", onAuthChanged);
      window.removeEventListener("storage", onAuthChanged);
    };
  }, []);

  useEffect(() => {
    if (authToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [authToken]);

  if (!authToken) {
    return <Navigate to="/login" replace />;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setFieldErrors((prev) => ({ ...prev, [name]: null }));
    setError(null);
    setSuccess(null);
  };

  const validateFields = () => {
    const required = ["brand", "model", "production_year", "engine", "price", "location"];
    const errs = {};
    for (const r of required) {
      if (!form[r] && form[r] !== 0) errs[r] = "This field is required";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    if (!validateFields()) return;

    setIsLoading(true);
    try {
      const base = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const url = `${base}/api/bikes`;

      const res = await axios.post(url, form, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      const createdBike =
        res?.data?.bike || 
        res?.data ||      
        null;

      const bikeId = createdBike?._id || createdBike?.id || (res?.data?.savedBike && res.data.savedBike._id);

      if (!bikeId) {
        setSuccess("Bike created (server didn't return id). You can now go to the upload page.");
        setIsLoading(false);
        return;
      }

      navigate(`/upload/${bikeId}`);
    } catch (err) {
      console.error("Create bike error (client):", err);
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to create bike";
      setError(serverMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bike-form-page d-flex align-items-center justify-content-center">
      <div className="bike-form-wrapper bg-bike-hero w-100 d-flex align-items-center justify-content-center py-5">
        <Card className="bike-form-card shadow-lg">
          <Card.Body className="p-4 p-lg-5">
            <h3 className="text-center mb-4">Add a Bike</h3>

            {success && <div className="alert alert-success">{success}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <Form onSubmit={handleSubmit} noValidate>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="brand">
                    <Form.Label>Brand</Form.Label>
                    <Form.Control
                      name="brand"
                      value={form.brand}
                      onChange={handleChange}
                      placeholder="Brand"
                      isInvalid={!!fieldErrors.brand}
                    />
                    <Form.Control.Feedback type="invalid">{fieldErrors.brand}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3" controlId="model">
                    <Form.Label>Model</Form.Label>
                    <Form.Control
                      name="model"
                      value={form.model}
                      onChange={handleChange}
                      placeholder="Model"
                      isInvalid={!!fieldErrors.model}
                    />
                    <Form.Control.Feedback type="invalid">{fieldErrors.model}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3" controlId="production_year">
                <Form.Label>Production Year</Form.Label>
                <Form.Control
                  type="number"
                  name="production_year"
                  value={form.production_year}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder="e.g. 2022"
                  isInvalid={!!fieldErrors.production_year}
                />
                <Form.Control.Feedback type="invalid">{fieldErrors.production_year}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="engine">
                <Form.Label>Engine</Form.Label>
                <Form.Select
                  name="engine"
                  value={form.engine}
                  onChange={handleChange}
                  isInvalid={!!fieldErrors.engine}
                >
                  <option value="">Select engine type</option>
                  <option value="50cc">50cc</option>
                  <option value="125cc">125cc</option>
                  <option value="250cc">250cc</option>
                  <option value="500cc">500cc</option>
                  <option value="600cc">600cc</option>
                  <option value="750cc">750cc</option>
                  <option value="1000cc">1000cc</option>
                  <option value="1200cc">1200cc</option>
                  <option value="1500cc">1500cc</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{fieldErrors.engine}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="price">
                <Form.Label>Price (€)</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Enter price"
                  isInvalid={!!fieldErrors.price}
                />
                <Form.Control.Feedback type="invalid">{fieldErrors.price}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="location">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Enter location"
                  isInvalid={!!fieldErrors.location}
                />
                <Form.Control.Feedback type="invalid">{fieldErrors.location}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="description">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Bike description"
                />
              </Form.Group>

              <div className="d-grid mb-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="bike-buttonStyle"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    "Create Bike"
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </main>
  );
}
