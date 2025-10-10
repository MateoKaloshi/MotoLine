import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Spinner,
  Carousel,
  Badge,
  Button,
  Alert,
  Modal,
  Table,
  Card,
} from "react-bootstrap";
import axios from "axios";
import { getAuthToken } from "../utils/auth";

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
  const [buying, setBuying] = useState(false);
  const [bill, setBill] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);

  const token = getAuthToken();

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      try {
        setLoading(true);
        const [bikeRes, imagesRes] = await Promise.all([
          axios.get(`${API_BASE}/api/bikes/${id}`),
          axios.get(`${API_BASE}/api/bikes/${id}/images`),
        ]);
        if (cancelled) return;
        setBike(bikeRes.data || null);
        setImages(
          Array.isArray(imagesRes.data?.images) ? imagesRes.data.images : []
        );
      } catch (err) {
        if (!cancelled) {
          console.error("BikeDetails fetch error:", err);
          setError(
            err?.response?.data?.message || err.message || "Failed to load bike"
          );
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

  useEffect(() => {
    if (!token) {
      setUser(null);
      setUserLoaded(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled) setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user info:", err);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setUserLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Determine if the logged-in user is the owner of this bike.
  const isOwner = (() => {
    if (!user || !bike || !bike.user_id) return false;
    const userId = String(user._id || user.id || "");
    const ownerId =
      typeof bike.user_id === "string"
        ? String(bike.user_id)
        : String(bike.user_id._id || bike.user_id.id || bike.user_id);
    return userId && ownerId && userId === ownerId;
  })();

  const handleShare = async () => {
    const link = `${window.location.origin}/bikes/${id}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
        alert("Listing link copied to clipboard!");
      } else {
        const el = document.createElement("textarea");
        el.value = link;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        alert("Listing link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share failed", err);
      alert("Could not copy link — please copy it manually:\n" + link);
    }
  };

  // BUY BUTTON HANDLE (prevents owner from buying this bike)
  const handleBuy = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    // ENSURE WE HAVE THE CURRENT USER INFO (in case userLoaded false)
    let currentUser = user;
    if (!userLoaded) {
      try {
        const res = await axios.get(`${API_BASE}/api/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        currentUser = res.data;
        setUser(currentUser);
      } catch (err) {
        console.error("Failed to fetch user before buying:", err);
        alert("Cannot confirm your identity. Please log in again.");
        return;
      } finally {
        setUserLoaded(true);
      }
    }

    const ownerId =
      typeof bike.user_id === "string"
        ? String(bike.user_id)
        : String(bike.user_id?._id || bike.user_id?.id || bike.user_id);

    const buyerId = String(currentUser._id || currentUser.id || "");

    // FINAL CHECK (do not allow owner to buy)
    if (buyerId && ownerId && buyerId === ownerId) {
      alert("You cannot buy your own bike.");
      return;
    }

    // ALSO GUARD IF ALREADY SOLD
    if (bike.is_sold) {
      alert("This bike is already sold.");
      return;
    }

    // PROCEED WITH BUY
    try {
      setBuying(true);
      const res = await axios.post(
        `${API_BASE}/api/bikes/${id}/sold`,
        { notes: "Bike purchased via system" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBike({ ...bike, is_sold: true });
      setShowModal(true);
    } catch (err) {
      console.error("Buy bike error:", err);
      alert(err?.response?.data?.message || "Failed to buy bike");
    } finally {
      setBuying(false);
    }
  };

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
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
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

  const slides =
    images && images.length > 0 ? images : [{ url: PLACEHOLDER_SVG }];

  return (
    <Container className="my-5">
      <Button variant="link" onClick={() => navigate(-1)}>
        &larr; Back to list
      </Button>
      <Row>
        <Col md={6}>
          <Carousel variant="dark">
            {slides.map((img, idx) => (
              <Carousel.Item key={img._id || img.filename || idx}>
                <img
                  className="d-block w-100 rounded"
                  src={img.url || img}
                  alt={`${bike.brand} ${bike.model} ${idx + 1}`}
                  style={{
                    maxHeight: 420,
                    objectFit: "contain",
                    background: "#fafafa",
                  }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = PLACEHOLDER_SVG;
                  }}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </Col>

        <Col md={6}>
          <h2>
            {bike.brand} {bike.model}{" "}
            {bike.is_sold && <Badge bg="secondary">Sold</Badge>}
            {isOwner && !bike.is_sold && (
              <Badge bg="info" className="ms-2">
                Your listing
              </Badge>
            )}
          </h2>

          <p className="text-muted mb-1">
            <strong>Location:</strong> {bike.location || "N/A"}
          </p>
          <p className="text-muted mb-3">
            <strong>Published on:</strong>{" "}
            {bike.published
              ? new Date(bike.published).toLocaleDateString()
              : "N/A"}
          </p>

          <h4 className="text-danger fw-bold">
            {bike.price ? `${bike.price.toLocaleString()} €` : "N/A"}
          </h4>

          <p>
            <strong>Engine:</strong> {bike.engine || "N/A"}
          </p>
          <p>
            <strong>Production Year:</strong>{" "}
            {bike.production_year
              ? new Date(bike.production_year).getFullYear()
              : "N/A"}
          </p>
          {bike.description && <p>{bike.description}</p>}

          <hr />
          <h5>Seller Information</h5>
          <p>
            <strong>Name:</strong> {bike.user_id?.first_name || ""}{" "}
            {bike.user_id?.last_name || ""}
          </p>
          <p>
            <strong>Email:</strong> {bike.user_id?.email || "N/A"}
          </p>
          <p>
            <strong>Phone:</strong> {bike.user_id?.phone_number || "N/A"}
          </p>
          <p>
            <strong>Address:</strong> {bike.user_id?.adress || "N/A"}
          </p>

          {/* OWNER PANEL */}
          {isOwner ? (
            <div className="mt-3">
              <Card className="p-3 shadow-sm">
                <div className="d-flex align-items-start justify-content-between">
                  <div>
                    <h5 className="mb-1">This is your listing</h5>
                    <p className="text-muted small mb-2">
                      Manage your listing and keep it up to date.
                    </p>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <Button
                    variant="outline-primary"
                    onClick={() => navigate(`/edit-bike/${id}`)}
                  >
                    Edit listing
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate("/my-bikes")}
                  >
                    View my listings
                  </Button>
                  <Button variant="outline-success" onClick={handleShare}>
                    Share listing
                  </Button>
                  <Button
                    variant="outline-warning"
                    onClick={() => navigate(`/edit-bike/${id}#images`)}
                  >
                    Manage images
                  </Button>
                </div>

                <div className="mt-3">
                  {!bike.is_sold ? (
                    <small className="text-muted">
                      When you sell the bike offline, update the listing or mark
                      it as sold from your dashboard to keep things accurate.
                    </small>
                  ) : (
                    <div>
                      <Badge bg="secondary">Sold</Badge>
                      <div className="text-muted small mt-1">
                        This listing is marked as sold.
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ) : (
            !bike.is_sold &&
            (!token ? (
              <Button variant="danger" className="mt-3" onClick={handleBuy}>
                Buy it
              </Button>
            ) : (
              userLoaded &&
              !isOwner && (
                <Button
                  variant="danger"
                  className="mt-3"
                  onClick={handleBuy}
                  disabled={buying}
                >
                  {buying ? "Processing..." : "Buy it"}
                </Button>
              )
            ))
          )}
        </Col>
      </Row>

      {/* RECEIPT */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Purchase Receipt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {bill ? (
            <>
              <p>
                Thank you for your purchase! Below is your transaction
                information:
              </p>
              <Table bordered>
                <tbody>
                  <tr>
                    <td>
                      <strong>Bike</strong>
                    </td>
                    <td>
                      {bill.bike.brand} {bill.bike.model}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Price</strong>
                    </td>
                    <td>{bill.price} €</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Sold Date</strong>
                    </td>
                    <td>{bill.sold_date}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Seller</strong>
                    </td>
                    <td>
                      {bill.seller?.first_name} {bill.seller?.last_name}
                      <br />
                      {bill.seller?.email}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Buyer</strong>
                    </td>
                    <td>{bill.buyer}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Notes</strong>
                    </td>
                    <td>{bill.notes}</td>
                  </tr>
                </tbody>
              </Table>
            </>
          ) : (
            <Spinner animation="border" />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
