// src/Components/CreateBikeComp.jsx
import React, { useState, useEffect } from "react";
import { Form, Button, Card, Spinner, Row, Col, InputGroup } from "react-bootstrap";
import axios from "axios";
import { useNavigate, Navigate } from "react-router-dom";
import "../CSS/createBikeStyle.css"; // <- using register CSS so the UI matches register page
import helmet from "../Images/Login/helmeticon.png";
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

  const [models, setModels] = useState([]);


  const navigate = useNavigate();

  const [engineOptions, setEngineOptions] = useState([]);

// Fetch engines when brand & model change
useEffect(() => {
  if (form.brand && form.model) {
    axios
      .get(`http://localhost:5000/api/bikes/engines`, {
        params: { brand: form.brand, model: form.model }
      })
      .then(res => {
        setEngineOptions(res.data.engines || []);
      })
      .catch(err => {
        console.error("Error fetching engines", err);
        setEngineOptions([]);
      });
  } else {
    setEngineOptions([]); // reset if brand/model not chosen
  }
}, [form.brand, form.model]);


  // preserve auth change logic exactly as before
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
  if (form.brand) {
    axios.get("http://localhost:5000/api/bikes/models", {
      params: { brand: form.brand }
    })
    .then(res => setModels(res.data.models || []))
    .catch(err => {
      console.error("Error fetching models:", err);
      setModels([]);
    });
  } else {
    setModels([]);
  }
}, [form.brand]);


  useEffect(() => {
    if (authToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [authToken]);

  // add the same page background body class as register page (UI only)
  useEffect(() => {
    document.body.classList.add("bg-createbike-hero");
    return () => document.body.classList.remove("bg-createbike-hero");
  }, []);

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
    <main className="createbike-form-page d-flex align-items-center justify-content-center">
      <Card className="createbike-form-card shadow-lg">
        <Card.Body className="p-4 p-lg-5">
          <div className="d-flex justify-content-center mb-3">
            <div className="avatar">
              <img src={helmet} alt="Helmet Icon" width="36" height="36" />
            </div>
          </div>

          <h3 className="text-center mb-4">SELL YOUR MOTORCYCLE</h3>

          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <Form onSubmit={handleSubmit} noValidate>
            <Row>
              <Col md={6}>
               <Form.Group className="mb-3" controlId="brand">
  <Form.Label>Brand</Form.Label>
  <InputGroup className="createbike-input-group input-group-lg">
    <InputGroup.Text className="bg-white border-end-0" id="brand-addon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M3 6h18v2H3zM3 10h18v2H3zM3 14h18v2H3z"
        />
      </svg>
    </InputGroup.Text>

    <Form.Select
      name="brand"
      value={form.brand}
      onChange={handleChange}
      className="border-start-0"
      aria-describedby="brand-addon"
      isInvalid={!!fieldErrors.brand}
    >
      <option value="">Select a brand</option>
      <option value="Honda">Honda</option>
      <option value="Yamaha">Yamaha</option>
      <option value="Suzuki">Suzuki</option>
      <option value="Kawasaki">Kawasaki</option>
      <option value="Ducati">Ducati</option>
      <option value="BMW">BMW</option>
      <option value="KTM">KTM</option>
      <option value="Harley-Davidson">Harley-Davidson</option>
      <option value="Triumph">Triumph</option>
      <option value="Aprilia">Aprilia</option>
      <option value="Indian Motorcycle">Indian Motorcycle</option>
      <option value="Royal Enfield">Royal Enfield</option>
    </Form.Select>

    <Form.Control.Feedback type="invalid">
      {fieldErrors.brand}
    </Form.Control.Feedback>
  </InputGroup>
</Form.Group>
              </Col>

              <Col md={6}>
              <Form.Group className="mb-3" controlId="model">
  <Form.Label>Model</Form.Label>
  <InputGroup className="createbike-input-group input-group-lg">
    <InputGroup.Text className="bg-white border-end-0" id="model-addon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M12 2l4 7h-8l4-7zm0 9a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"
        />
      </svg>
    </InputGroup.Text>

    <Form.Select
      name="model"
      value={form.model}
      onChange={handleChange}
      className="border-start-0"
      aria-describedby="model-addon"
      isInvalid={!!fieldErrors.model}
      disabled={!form.brand} // disable until a brand is chosen
    >
      <option value="">Select a model</option>
      {models.map((m, idx) => (
        <option key={idx} value={m}>
          {m}
        </option>
      ))}
    </Form.Select>

    <Form.Control.Feedback type="invalid">
      {fieldErrors.model}
    </Form.Control.Feedback>
  </InputGroup>
</Form.Group>

              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="production_year">
              <Form.Label>Production Year</Form.Label>
              <InputGroup className="createbike-input-group input-group-lg">
                <InputGroup.Text className="bg-white border-end-0" id="year-addon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M7 10h2v2H7zM11 10h2v2h-2zM15 10h2v2h-2zM5 4h14v2H5zM5 20h14v-2H5z" />
                  </svg>
                </InputGroup.Text>
                <Form.Control
                  type="number"
                  className="border-start-0"
                  name="production_year"
                  value={form.production_year}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder="e.g. 2022"
                  aria-describedby="year-addon"
                  isInvalid={!!fieldErrors.production_year}
                />
                <Form.Control.Feedback type="invalid">{fieldErrors.production_year}</Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

           <Form.Group className="mb-3" controlId="engine">
  <Form.Label>Engine</Form.Label>
  <InputGroup className="createbike-input-group input-group-lg">
    <InputGroup.Text className="bg-white border-end-0" id="engine-addon">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
        <path fill="currentColor" d="M3 12h18v2H3zM3 6h18v2H3zM3 18h18v2H3z" />
      </svg>
    </InputGroup.Text>

    <Form.Select
      name="engine"
      value={form.engine}
      onChange={handleChange}
      aria-describedby="engine-addon"
      className="border-start-0"
      isInvalid={!!fieldErrors.engine}
    >
      <option value="">Select engine type</option>
      {engineOptions.map((eng, idx) => (
        <option key={idx} value={eng}>
          {eng}
        </option>
      ))}
    </Form.Select>

    <Form.Control.Feedback type="invalid">
      {fieldErrors.engine}
    </Form.Control.Feedback>
  </InputGroup>
</Form.Group>


            <Form.Group className="mb-3" controlId="price">
              <Form.Label>Price (€)</Form.Label>
              <InputGroup className="createbike-input-group input-group-lg">
                <InputGroup.Text className="bg-white border-end-0" id="price-addon">€</InputGroup.Text>
                <Form.Control
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Enter price"
                  aria-describedby="price-addon"
                  className="border-start-0"
                  isInvalid={!!fieldErrors.price}
                />
                <Form.Control.Feedback type="invalid">{fieldErrors.price}</Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3" controlId="location">
              <Form.Label>Location</Form.Label>
              <InputGroup className="createbike-input-group input-group-lg">
                <InputGroup.Text className="bg-white border-end-0" id="loc-addon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 2C8.1 2 5 5.1 5 9c0 5.3 6.1 11.4 6.4 11.7.2.2.5.3.8.3s.6-.1.8-.3C12.9 20.4 19 14.3 19 9c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5 2.5 2.5 0 0 1 12 11.5z" />
                  </svg>
                </InputGroup.Text>
                <Form.Control
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Enter location"
                  aria-describedby="loc-addon"
                  className="border-start-0"
                  isInvalid={!!fieldErrors.location}
                />
                <Form.Control.Feedback type="invalid">{fieldErrors.location}</Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3" controlId="description">
              <Form.Label>Description</Form.Label>
              <InputGroup className="createbike-input-group input-group-lg">
                <InputGroup.Text className="bg-white border-end-0" id="desc-addon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M4 4h16v2H4zM4 8h10v2H4zM4 12h16v2H4zM4 16h8v2H4z" />
                  </svg>
                </InputGroup.Text>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Bike description"
                  aria-describedby="desc-addon"
                  className="border-start-0"
                />
              </InputGroup>
            </Form.Group>

            <div className="d-grid mb-3">
              <Button
                variant="primary"
                size="lg"
                className="createbike-buttonStyle"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Saving...
                  </>
                ) : (
                  "Next section"
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </main>
  );
}
