import React, { useState, useEffect } from "react";
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
import { useNavigate, Navigate } from "react-router-dom";
import "../CSS/createBikeStyle.css";
import { getAuthToken } from "../utils/auth";
import saleicon from "../Images/CreateBike/saleicon.png";
import yearicon from "../Images/CreateBike/yearicon.png";
import engineicon from "../Images/CreateBike/engineicon.png";
import moneyicon from "../Images/CreateBike/moneyicon.png";
import locationicon from "../Images/CreateBike/locationicon.png";
import motorcycleicon from "../Images/CreateBike/motorcycleicon.png";
import modelicon from "../Images/CreateBike/modelicon.png"

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

  // ENGINE OPTIONS CHANGE WHEN BRAND & MODEL CHANGE
  useEffect(() => {
    if (form.brand && form.model) {
      axios
        .get(`http://localhost:5000/api/bikes/engines`, {
          params: { brand: form.brand, model: form.model },
        })
        .then((res) => {
          setEngineOptions(res.data.engines || []);
        })
        .catch((err) => {
          console.error("Error fetching engines", err);
          setEngineOptions([]);
        });
    } else {
      setEngineOptions([]);
    }
  }, [form.brand, form.model]);

  useEffect(() => {
    if (Array.isArray(engineOptions) && engineOptions.length === 1) {
      const single = engineOptions[0];
      setForm((prev) => {
        if (!prev.engine || prev.engine !== single) {
          return { ...prev, engine: single };
        }
        return prev;
      });
    }
  }, [engineOptions]);

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
      axios
        .get("http://localhost:5000/api/bikes/models", {
          params: { brand: form.brand },
        })
        .then((res) => setModels(res.data.models || []))
        .catch((err) => {
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

  useEffect(() => {
    document.body.classList.add("bg-createbike-hero");
    return () => document.body.classList.remove("bg-createbike-hero");
  }, []);

  if (!authToken) {
    return <Navigate to="/login" replace />;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: null }));
    setError(null);
    setSuccess(null);
  };

  const validateFields = () => {
    const required = [
      "brand",
      "model",
      "production_year",
      "engine",
      "price",
      "location",
    ];
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

      const createdBike = res?.data?.bike || res?.data || null;

      const bikeId =
        createdBike?._id ||
        createdBike?.id ||
        (res?.data?.savedBike && res.data.savedBike._id);

      if (!bikeId) {
        setSuccess(
          "Bike created (server didn't return id). You can now go to the upload page."
        );
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
              <img src={saleicon} alt="Sale Icon" width="37" height="39" />
            </div>
          </div>

          <h3 className="text-center mb-4">SELL YOUR MOTORCYCLE</h3>

          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <Form onSubmit={handleSubmit} noValidate>
            <Row>
              <Form.Group className="mb-3" controlId="brand">
                <Form.Label>Brand</Form.Label>
                <InputGroup className="createbike-input-group input-group-lg bike-dropdown">
                  <InputGroup.Text
                    className="bg-white border-end-0"
                    id="brand-addon"
                  >
                    <img
                      src={motorcycleicon}
                      alt="Motorcycle Icon"
                      width="28"
                      height="28"
                    />
                  </InputGroup.Text>

                  <Form.Select
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    className="border-start-0"
                    aria-describedby="brand-addon"
                    isInvalid={!!fieldErrors.brand}
                  >
                    <option value="">Brand</option>
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
              <Form.Group className="mb-3" controlId="model">
                <Form.Label>Model</Form.Label>
                <InputGroup className="createbike-input-group input-group-lg">
                  <InputGroup.Text
                    className="bg-white border-end-0"
                    id="brand-addon"
                  >
                    <img
                      src={modelicon}
                      alt="Model Icon"
                      width="24"
                      height="28"
                    />
                  </InputGroup.Text>

                  <Form.Select
                    name="model"
                    value={form.model}
                    onChange={handleChange}
                    className="border-start-0"
                    aria-describedby="model-addon"
                    isInvalid={!!fieldErrors.model}
                    disabled={!form.brand}
                  >
                    <option value="">Model</option>
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
            </Row>

            <Form.Group className="mb-3" controlId="production_year">
              <Form.Label>Production Year</Form.Label>
              <InputGroup className="createbike-input-group input-group-lg">
                <InputGroup.Text
                  className="bg-white border-end-0"
                  id="year-addon"
                >
                  <img src={yearicon} alt="Year Icon" width="24" height="24" />
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
                <Form.Control.Feedback type="invalid">
                  {fieldErrors.production_year}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3" controlId="engine">
              <Form.Label>Engine</Form.Label>
              <InputGroup className="createbike-input-group input-group-lg">
                <InputGroup.Text
                  className="bg-white border-end-0"
                  id="engine-addon"
                >
                  <img
                    src={engineicon}
                    alt="Engine Icon"
                    width="24"
                    height="24"
                  />
                </InputGroup.Text>

                {engineOptions && engineOptions.length === 1 ? (
                  <Form.Control
                    type="text"
                    name="engine"
                    value={engineOptions[0] || form.engine}
                    readOnly
                    aria-describedby="engine-addon"
                    className="border-start-0"
                    isInvalid={!!fieldErrors.engine}
                  />
                ) : (
                  <Form.Control
                    name="engine"
                    value={form.engine}
                    onChange={handleChange}
                    aria-describedby="engine-addon"
                    className="border-start-0"
                    isInvalid={!!fieldErrors.engine}
                    disabled={engineOptions.length === 0}
                    placeholder="Engine"
                  ></Form.Control>
                )}

                <Form.Control.Feedback type="invalid">
                  {fieldErrors.engine}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3" controlId="price">
              <Form.Label>Price (€)</Form.Label>
              <InputGroup className="createbike-input-group input-group-lg">
                <InputGroup.Text
                  className="bg-white border-end-0"
                  id="price-addon"
                >
                  <img
                    src={moneyicon}
                    alt="Money Icon"
                    width="24"
                    height="24"
                  />
                </InputGroup.Text>
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
                <Form.Control.Feedback type="invalid">
                  {fieldErrors.price}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3" controlId="location">
              <Form.Label>Location</Form.Label>
              <InputGroup className="createbike-input-group input-group-lg">
                <InputGroup.Text
                  className="bg-white border-end-0"
                  id="loc-addon"
                >
                  <img
                    src={locationicon}
                    alt="Location Icon"
                    width="24"
                    height="24"
                  />
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
                <Form.Control.Feedback type="invalid">
                  {fieldErrors.location}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3" controlId="description">
              <Form.Label>Description</Form.Label>
              <InputGroup className="createbike-input-group input-group-lg">
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
                    <Spinner
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
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
