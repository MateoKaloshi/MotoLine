import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Container,
  Row,
  Col,
  Pagination,
  Spinner,
  Badge,
} from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

export default function HomeComp() {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isServerPaged, setIsServerPaged] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const bikesPerPage = 20;

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const fetchBikes = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/api/bikes`, {
          params: { page: currentPage, limit: bikesPerPage },
        });
        if (cancelled) return;

        if (
          res.data &&
          typeof res.data === "object" &&
          !Array.isArray(res.data) &&
          Array.isArray(res.data.bikes)
        ) {
          setIsServerPaged(true);
          setBikes(res.data.bikes || []);
          const pages =
            res.data.pages ||
            Math.max(
              1,
              Math.ceil(
                (res.data.total || (res.data.bikes || []).length) / bikesPerPage
              )
            );
          setTotalPages(Math.max(1, pages));
        } else if (Array.isArray(res.data)) {
          setIsServerPaged(false);
          setBikes(res.data);
          setTotalPages(Math.max(1, Math.ceil(res.data.length / bikesPerPage)));
        } else {
          const maybeBikes = res.data && res.data.bikes ? res.data.bikes : [];
          setIsServerPaged(
            Array.isArray(maybeBikes) && (res.data.pages || res.data.total)
          );
          setBikes(Array.isArray(maybeBikes) ? maybeBikes : []);
          setTotalPages(res.data && res.data.pages ? res.data.pages : 1);
        }
      } catch (err) {
        console.error("Error fetching bikes:", err);
        setBikes([]);
        setTotalPages(1);
        setIsServerPaged(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchBikes();
    return () => {
      cancelled = true;
    };
  }, [currentPage]);

  const currentBikes = isServerPaged
    ? bikes
    : Array.isArray(bikes)
    ? bikes.slice((currentPage - 1) * bikesPerPage, currentPage * bikesPerPage)
    : [];

  useEffect(() => {
    if (!isServerPaged) {
      const pages = Math.max(
        1,
        Math.ceil((Array.isArray(bikes) ? bikes.length : 0) / bikesPerPage)
      );
      setTotalPages(pages);
      if (currentPage > pages) setCurrentPage(1);
    }
  }, [bikes, isServerPaged, currentPage]);

  const resolveImageSrc = (bike) => {
    if (bike?.firstImageUrl) {
      if (bike.firstImageUrl.startsWith("http")) return bike.firstImageUrl;
      return `${API_BASE}${bike.firstImageUrl.startsWith("/") ? "" : "/"}${
        bike.firstImageUrl
      }`;
    }
    if (Array.isArray(bike?.images) && bike.images.length > 0) {
      const first = bike.images[0];
      if (first?.url) {
        if (first.url.startsWith("http")) return first.url;
        return `${API_BASE}${first.url.startsWith("/") ? "" : "/"}${first.url}`;
      }
      if (first?.path) {
        const filename = first.path.split(/[\\/]/).pop();
        if (filename) return `${API_BASE}/uploads/${filename}`;
      }
    }
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        {/* SELL YOU BIKE (button) */}
        <Button variant="danger" onClick={() => navigate("/addbike")}>
          Sell your bike
        </Button>
      </div>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="danger" />
        </div>
      ) : (
        <>
          <Row>
            {currentBikes.length === 0 ? (
              <div className="text-center w-100">No bikes found.</div>
            ) : (
              currentBikes.map((bike) => {
                const imgSrc = resolveImageSrc(bike);
                return (
                  <Col
                    key={bike._id || `${bike.brand}-${bike.model}`}
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    className="mb-4 d-flex"
                  >
                    <div
                      style={{
                        ...cardStyle,
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                      }}
                      className="homecard"
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "translateY(-6px)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "none")
                      }
                    >
                      <Card
                        style={{ border: "none", borderRadius: 12, flex: 1 }}
                      >
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
                            src={resolveImageSrc(bike)}
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

                        <Card.Body
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            flex: 1,
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <Card.Title
                                style={{ fontSize: 16, marginBottom: 4 }}
                              >
                                {bike.brand}{" "}
                                <span
                                  style={{ color: "#666", fontWeight: 500 }}
                                >
                                  {bike.model}
                                </span>
                              </Card.Title>
                              <div style={{ fontSize: 13, color: "#777" }}>
                                {bike.location || "Unknown location"}
                                {bike.published && (
                                  <span style={{ marginLeft: 6 }}>
                                    • {formatDate(bike.published)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* PRICE + SOLD BADGE (added) */}
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
                          <div style={{ flex: 1 }} />{" "}
                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="view-details-btn"
                              onClick={() => navigate(`/bikes/${bike._id}`)}
                            >
                              View Details
                            </Button>
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
