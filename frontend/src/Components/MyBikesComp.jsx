import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  Button,
  Spinner,
  Row,
  Col,
  Image,
  Container,
  Offcanvas,
  Form,
  Pagination,
  Badge,
} from "react-bootstrap";
import { getAuthToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

const PLACEHOLDER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360">
     <rect width="100%" height="100%" fill="#f3f3f3"/>
     <text x="50%" y="50%" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#999" text-anchor="middle" dominant-baseline="middle">No image available</text>
   </svg>`
)}`;

export default function MyBikesComp() {
  const [postedBikes, setPostedBikes] = useState([]);
  const [postedTotal, setPostedTotal] = useState(0);

  const [boughtBikes, setBoughtBikes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBike, setSelectedBike] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const bikesPerPage = 20;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBikes = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();
        if (!token) {
          navigate("/login", { replace: true });
          return;
        }
        const res = await axios.get(`${API_BASE}/api/my-bikes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data && (res.data.posted || res.data.bought)) {
          const posted = res.data.posted || { bikes: [], total: 0 };
          const bought = res.data.bought || { bikes: [] };
          setPostedBikes(posted.bikes || []);
          setPostedTotal(posted.total || (posted.bikes || []).length);
          setBoughtBikes(bought.bikes || []);
        } else {
          const all = res.data.bikes || res.data || [];
          setPostedBikes(all);
          setPostedTotal(all.length);
          setBoughtBikes([]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load bikes");
      } finally {
        setLoading(false);
      }
    };
    fetchBikes();
  }, [navigate]);

  const handleDelete = async (id) => {
    const ok = window.confirm(
      "Delete this bike? This action cannot be undone."
    );
    if (!ok) return;
    try {
      const token = getAuthToken();
      await axios.delete(`${API_BASE}/api/bikes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPostedBikes((prev) =>
        prev.filter((b) => String(b._id) !== String(id))
      );
      const newTotal = Math.max(0, postedTotal - 1);
      setPostedTotal(newTotal);
      const totalPages = Math.max(1, Math.ceil(newTotal / bikesPerPage));
      if (currentPage > totalPages) setCurrentPage(totalPages);
    } catch (err) {
      console.error("delete error", err);
      alert("Failed to delete bike");
    }
  };

  const handleEdit = (bike) => {
    setSelectedBike(JSON.parse(JSON.stringify(bike)));
    setShowDrawer(true);
  };

  const handleUpdate = async () => {
    if (!selectedBike) return;
    try {
      setUpdating(true);
      const token = getAuthToken();
      await axios.put(
        `${API_BASE}/api/bikes/${selectedBike._id}`,
        {
          description: selectedBike.description,
          price: selectedBike.price,
          location: selectedBike.location,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPostedBikes((prev) =>
        prev.map((b) =>
          String(b._id) === String(selectedBike._id) ? selectedBike : b
        )
      );
      setShowDrawer(false);
    } catch (err) {
      alert("Failed to update bike");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleImageUpload = async (e) => {
    if (!selectedBike) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const token = getAuthToken();
    const formData = new FormData();
    for (let file of files) formData.append("images", file);
    formData.append("bike_id", selectedBike._id);

    try {
      const res = await axios.post(`${API_BASE}/api/bikes/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const returned = res.data.images || [];
      const newImages = returned.map((img) =>
        typeof img === "string" ? img : img.url || img.path || img
      );
      setSelectedBike((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...newImages],
      }));
      setPostedBikes((prev) =>
        prev.map((b) =>
          String(b._id) === String(selectedBike._id)
            ? { ...b, images: [...(b.images || []), ...newImages] }
            : b
        )
      );
    } catch (err) {
      alert("Upload failed");
      console.error(err);
    }
  };

  const handleImageDelete = (url) => {
    if (!window.confirm("Delete this image?")) return;
    setSelectedBike((prev) => ({
      ...prev,
      images: (prev.images || []).filter(
        (img) => (img.url || img) !== url && img !== url
      ),
    }));
    setPostedBikes((prev) =>
      prev.map((b) =>
        String(b._id) === String(selectedBike._id)
          ? {
              ...b,
              images: (b.images || []).filter(
                (img) => (img.url || img) !== url && img !== url
              ),
            }
          : b
      )
    );
  };

  const resolveImageSrc = (bike) => {
    if (bike?.images && bike.images.length > 0) {
      const first = bike.images[0];
      const url =
        typeof first === "string" ? first : first.url || first.path || first;
      if (!url) return PLACEHOLDER_SVG;
      if (url.startsWith("http")) return url;
      return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
    }
    return PLACEHOLDER_SVG;
  };

  const totalPages = Math.max(
    1,
    Math.ceil((postedBikes.length || postedTotal) / bikesPerPage)
  );
  const currentBikes = postedBikes.slice(
    (currentPage - 1) * bikesPerPage,
    currentPage * bikesPerPage
  );

  const cardStyle = {
    border: "none",
    boxShadow: "0 6px 18px rgba(17,17,17,0.06)",
    borderRadius: 12,
    transition: "transform 160ms ease, box-shadow 160ms ease",
    overflow: "hidden",
  };
  const priceStyle = { fontSize: "1rem" };

  if (loading)
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="danger" />
      </div>
    );

  if (error)
    return (
      <div className="text-center text-danger py-4">
        <p>{error}</p>
      </div>
    );

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">My Bikes</h2>
        <Button variant="danger" onClick={() => navigate("/addbike")}>
          Add New Bike
        </Button>
      </div>

      {/* SHOW MY POSTED BIKES */}
      <h5 className="mb-3">My Posted Bikes</h5>
      <Row>
        {currentBikes.length === 0 ? (
          <div className="text-center w-100">You have no posted bikes yet.</div>
        ) : (
          currentBikes.map((bike) => {
            const imgSrc = resolveImageSrc(bike);
            return (
              <Col key={bike._id} md={3} className="mb-4">
                <div
                  style={cardStyle}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-6px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "none")
                  }
                >
                  <Card style={{ border: "none", borderRadius: 12 }}>
                    <div
                      style={{
                        height: 180,
                        overflow: "hidden",
                        background: "#fafafa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={imgSrc}
                        alt={`${bike.brand} ${bike.model}`}
                        style={{
                          width: "100%",
                          height: "180px",
                          objectFit: "contain",
                        }}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = PLACEHOLDER_SVG;
                        }}
                      />
                    </div>

                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <Card.Title style={{ marginBottom: 4, fontSize: 16 }}>
                            {bike.brand}{" "}
                            <span style={{ color: "#666", fontWeight: 500 }}>
                              {bike.model}
                            </span>
                          </Card.Title>
                          <div style={{ fontSize: 13, color: "#777" }}>
                            {bike.location || "Unknown location"}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              ...priceStyle,
                              color: "#d6333f",
                              fontWeight: 700,
                            }}
                          >
                            {bike.price
                              ? `${Number(bike.price).toLocaleString()} €`
                              : "—"}
                          </div>
                          {bike.is_sold && (
                            <Badge bg="secondary" className="mt-1">
                              Sold
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => handleEdit(bike)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(bike._id)}
                          >
                            Delete
                          </Button>
                        </div>
                        <small style={{ color: "#999" }}>
                          {bike.engine || ""}
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </Col>
            );
          })
        )}
      </Row>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            />
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <Pagination.Item
                  key={pageNum}
                  active={pageNum === currentPage}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Pagination.Item>
              );
            })}
            <Pagination.Next
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}

      {/* SHOW THE BIKES I BOUGHT */}
      <hr className="my-4" />
      <h5 className="mb-3">Bikes I Bought</h5>
      <Row>
        {boughtBikes.length === 0 ? (
          <div className="text-center w-100">
            You have not bought any bikes yet.
          </div>
        ) : (
          boughtBikes.map((bike) => {
            const imgSrc = resolveImageSrc(bike);
            const sold =
              (bike.soldRecords && bike.soldRecords[0]) || bike.sold || null;
            const soldPrice = sold ? sold.price : null;
            const soldDate =
              sold && sold.sold_date
                ? new Date(sold.sold_date).toLocaleDateString()
                : null;
            const seller =
              sold && sold.seller_id
                ? typeof sold.seller_id === "string"
                  ? sold.seller_id
                  : sold.seller_id.name || sold.seller_id._id
                : null;

            return (
              <Col key={`bought-${bike._id}`} md={3} className="mb-4">
                <Card style={{ ...cardStyle, borderRadius: 12 }}>
                  <div
                    style={{
                      height: 180,
                      overflow: "hidden",
                      background: "#fafafa",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={imgSrc}
                      alt={`${bike.brand} ${bike.model}`}
                      style={{
                        width: "100%",
                        height: "180px",
                        objectFit: "contain",
                      }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = PLACEHOLDER_SVG;
                      }}
                    />
                  </div>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <Card.Title style={{ marginBottom: 4, fontSize: 16 }}>
                          {bike.brand}{" "}
                          <span style={{ color: "#666", fontWeight: 500 }}>
                            {bike.model}
                          </span>
                        </Card.Title>
                        <div style={{ fontSize: 13, color: "#777" }}>
                          {bike.location || "Unknown location"}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            ...priceStyle,
                            color: "#198754",
                            fontWeight: 700,
                          }}
                        >
                          {soldPrice
                            ? `${Number(soldPrice).toLocaleString()} €`
                            : bike.price
                            ? `${Number(bike.price).toLocaleString()} €`
                            : "—"}
                        </div>
                        <Badge bg="success" className="mt-1">
                          Bought
                        </Badge>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small style={{ color: "#999" }}>
                          {bike.engine || ""}
                        </small>
                        <div style={{ fontSize: 12, color: "#666" }}>
                          {soldDate && <span>On: {soldDate}</span>}
                          {seller && <div>Seller: {seller}</div>}
                        </div>
                      </div>
                      <div>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => navigate(`/bikes/${bike._id}`)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })
        )}
      </Row>

      <Offcanvas
        show={showDrawer}
        onHide={() => setShowDrawer(false)}
        placement="end"
        backdrop={true}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Edit Bike</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {selectedBike && (
            <>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Brand</Form.Label>
                  <Form.Control value={selectedBike.brand} readOnly disabled />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Model</Form.Label>
                  <Form.Control value={selectedBike.model} readOnly disabled />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Engine</Form.Label>
                  <Form.Control value={selectedBike.engine} readOnly disabled />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Price (€)</Form.Label>
                  <Form.Control
                    type="number"
                    value={selectedBike.price || ""}
                    onChange={(e) =>
                      setSelectedBike({
                        ...selectedBike,
                        price: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    value={selectedBike.location || ""}
                    onChange={(e) =>
                      setSelectedBike({
                        ...selectedBike,
                        location: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={selectedBike.description || ""}
                    onChange={(e) =>
                      setSelectedBike({
                        ...selectedBike,
                        description: e.target.value,
                      })
                    }
                  />
                </Form.Group>

                <h6>Images</h6>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {selectedBike.images &&
                    selectedBike.images.map((img, i) => {
                      const imgUrl =
                        typeof img === "string"
                          ? img
                          : img.url || img.path || img;
                      return (
                        <div
                          key={i}
                          className="position-relative border rounded"
                          style={{
                            width: 100,
                            height: 100,
                            overflow: "hidden",
                          }}
                        >
                          <Image
                            src={imgUrl}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <Button
                            size="sm"
                            variant="danger"
                            className="position-absolute top-0 end-0 p-1"
                            onClick={() => handleImageDelete(imgUrl)}
                          >
                            ×
                          </Button>
                        </div>
                      );
                    })}
                </div>
                <Form.Control
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />

                <div className="d-flex justify-content-end mt-4">
                  <Button
                    variant="danger"
                    onClick={handleUpdate}
                    disabled={updating}
                  >
                    {updating ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </Form>
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </Container>
  );
}
