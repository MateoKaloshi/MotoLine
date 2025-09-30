import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Spinner, Carousel, Badge, Button, Alert } from "react-bootstrap";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const PLACEHOLDER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360">
     <rect width="100%" height="100%" fill="#f3f3f3"/>
     <text x="50%" y="50%" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#999" text-anchor="middle" dominant-baseline="middle">No images available</text>
   </svg>`
)}`;

export default function BikeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bike, setBike] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      try {
        setLoading(true);
        // fetch bike and images in parallel
        const bikeReq = axios.get(`${API_BASE}/api/bikes/${id}`);
        const imagesReq = axios.get(`${API_BASE}/api/bikes/${id}/images`);

        const [bikeRes, imagesRes] = await Promise.all([bikeReq, imagesReq]);
        if (cancelled) return;

        setBike(bikeRes.data || null);
        setImages(Array.isArray(imagesRes.data?.images) ? imagesRes.data.images : []);
      } catch (err) {
        if (!cancelled) {
          console.error("BikeDetails fetch error:", err);
          setError(err?.response?.data?.message || err.message || "Failed to load bike");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="danger" />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">Error: {error}</Alert>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </Container>
    );
  }

  if (!bike) {
    return (
      <Container className="my-5">
        <div className="text-center">Bike not found.</div>
        <div className="text-center mt-3">
          <Button onClick={() => navigate(-1)}>Back</Button>
        </div>
      </Container>
    );
  }

  const slides = (images && images.length > 0) ? images : [{ url: PLACEHOLDER_SVG }];

  return (
    <Container className="my-5">
      <Button variant="link" onClick={() => navigate(-1)}>&larr; Back to list</Button>
      <Row>
        <Col md={6}>
          <Carousel variant="dark">
            {slides.map((img, idx) => (
              <Carousel.Item key={img._id || img.filename || idx}>
                <img
                  className="d-block w-100 rounded"
                  src={img.url || img}
                  alt={`${bike.brand} ${bike.model} ${idx + 1}`}
                  style={{ maxHeight: 420, objectFit: "contain", background: "#fafafa" }}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER_SVG; }}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </Col>

        <Col md={6}>
          <h2>
            {bike.brand} {bike.model} {bike.is_sold && <Badge bg="secondary">Sold</Badge>}
          </h2>
          <p className="text-muted">{bike.location || "N/A"}</p>
          <h4 className="text-danger fw-bold">{bike.price ? `${bike.price.toLocaleString()} €` : "N/A"}</h4>

          <p><strong>Engine:</strong> {bike.engine || "N/A"}</p>
          <p><strong>Production Year:</strong> {bike.production_year ? new Date(bike.production_year).getFullYear() : "N/A"}</p>
          {bike.description && <p>{bike.description}</p>}

          <hr />
          <h5>Seller Information</h5>
          <p><strong>Name:</strong> {bike.user_id?.first_name || ""} {bike.user_id?.last_name || ""}</p>
          <p><strong>Email:</strong> {bike.user_id?.email || "N/A"}</p>
          <p><strong>Phone:</strong> {bike.user_id?.phone_number || "N/A"}</p>
          <p><strong>Address:</strong> {bike.user_id?.adress || "N/A"}</p>
        </Col>
      </Row>
    </Container>
  );
}
 