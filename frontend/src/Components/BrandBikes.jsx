import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Pagination,
  Badge,
} from "react-bootstrap";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

const PLACEHOLDER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360">
     <rect width="100%" height="100%" fill="#f3f3f3"/>
     <text x="50%" y="50%" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#999" text-anchor="middle" dominant-baseline="middle">No image available</text>
   </svg>`
)}`;

const formatDate = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

export default function BrandBikes() {
  const { brand } = useParams();
  const navigate = useNavigate();

  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const bikesPerPage = 20;

  useEffect(() => {
    let cancelled = false;

    const fetchBikes = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/api/bikes/brand/${brand}`, {
          params: { page: currentPage, limit: bikesPerPage },
        });

        if (cancelled) return;

        setBikes(res.data?.bikes || []);
        const pages = res.data?.pages || 1;
        setTotalPages(Math.max(1, pages));
      } catch (err) {
        console.error("Error fetching bikes by brand:", err);
        setBikes([]);
        setTotalPages(1);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBikes();
    return () => {
      cancelled = true;
    };
  }, [brand, currentPage]);

  const resolveImageSrc = (bike) => {
    if (bike?.firstImageUrl) return bike.firstImageUrl;
    if (Array.isArray(bike?.images) && bike.images.length > 0)
      return bike.images[0].url;
    return PLACEHOLDER_SVG;
  };

  const cardStyle = {
    border: "none",
    boxShadow: "0 6px 18px rgba(17,17,17,0.06)",
    borderRadius: 12,
    transition: "transform 160ms ease, box-shadow 160ms ease",
    overflow: "hidden",
  };

  const priceStyle = { fontSize: "1rem" };

  return (
    <Container className="my-5">
      <div
        className="d-flex justify-content-center mb-5"
        style={{
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #ff416c, #ff4b2b)",
            color: "#fff",
            borderRadius: "12px",
            padding: "14px 28px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
            minWidth: "220px",
            maxWidth: "450px",
            transition: "transform 0.3s, box-shadow 0.3s",
            cursor: "default",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)";
          }}
        >
          <h2
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: "1.7rem",
              letterSpacing: "1px",
              textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
            }}
          >
            {brand} Bikes
          </h2>
        </div>
      </div>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="danger" />
        </div>
      ) : (
        <>
          <Row>
            {bikes.length === 0 ? (
              <div className="text-center w-100">
                No bikes found for this brand.
              </div>
            ) : (
              bikes.map((bike) => {
                const imgSrc = resolveImageSrc(bike);
                return (
                  <Col key={bike._id} md={3} className="mb-4">
                    <div
                      style={cardStyle}
                      className="homecard"
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
                              <Card.Title
                                style={{ marginBottom: 4, fontSize: 16 }}
                              >
                                {bike.brand}{" "}
                                <span
                                  style={{ color: "#666", fontWeight: 500 }}
                                >
                                  {bike.model}
                                </span>
                              </Card.Title>
                              <div style={{ fontSize: 13, color: "#777" }}>
                                {bike.location || "Unknown location"}{" "}
                                {bike.published && (
                                  <span style={{ marginLeft: 6 }}>
                                    • {formatDate(bike.published)}
                                  </span>
                                )}
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
                                {typeof bike.price === "number"
                                  ? `${bike.price.toLocaleString()} €`
                                  : bike.price}
                              </div>
                              {bike.is_sold && (
                                <Badge bg="secondary" className="mt-1">
                                  Sold
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="d-flex justify-content-between align-items-center">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => navigate(`/bikes/${bike._id}`)}
                            >
                              View Details
                            </Button>
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
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      )}
    </Container>
  );
}
