import React, { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Row, Col, Card, Spinner, Pagination } from "react-bootstrap";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function SearchResultsPage() {
  const { query } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bikesData, setBikesData] = useState({
    bikes: [],
    total: 0,
    pages: 0,
    page: 1,
    limit: 20,
  });
  const [loading, setLoading] = useState(true);

  const page = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_BASE}/api/bikes/search`, {
          params: { query, page, limit: 20 },
        });
        setBikesData(data);
      } catch (err) {
        console.error(err);
        setBikesData({ bikes: [], total: 0, pages: 0, page: 1, limit: 20 });
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query, page]);

  if (loading)
    return <Spinner animation="border" className="d-block mx-auto mt-5" />;

  if (!bikesData.bikes.length)
    return <p className="text-center mt-5">No bikes found for "{query}"</p>;

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  return (
    <div className="container mt-4">
      <h2>Search results for "{query}"</h2>
      <Row className="mt-3">
        {bikesData.bikes.map((bike) => (
          <Col key={bike._id} sm={12} md={6} lg={4} className="mb-4">
            <Card>
              {bike.firstImageUrl && (
                <Card.Img variant="top" src={bike.firstImageUrl} />
              )}
              <Card.Body>
                <Card.Title>
                  {bike.brand} {bike.model}
                </Card.Title>
                <Card.Text>
                  <strong>Engine:</strong> {bike.engine}
                  <br />
                  <strong>Year:</strong> {bike.production_year}
                  <br />
                  <strong>Price:</strong> ${bike.price}
                </Card.Text>
                <Link to={`/bike/${bike._id}`} className="btn btn-primary">
                  View Details
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {bikesData.pages > 1 && (
        <Pagination className="justify-content-center">
          {Array.from({ length: bikesData.pages }, (_, i) => i + 1).map((p) => (
            <Pagination.Item
              key={p}
              active={p === bikesData.page}
              onClick={() => handlePageChange(p)}
            >
              {p}
            </Pagination.Item>
          ))}
        </Pagination>
      )}
    </div>
  );
}
