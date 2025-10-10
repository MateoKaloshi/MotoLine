import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import motolinelogo from "../Images/Navigation/MotoLineLogo.png";
import menulogo from "../Images/Navigation/menu.png";
import searchIcon from "../Images/Navigation/searchicon.png";
import "../CSS/navigationStyle.css";
import {
  Navbar,
  Nav,
  NavDropdown,
  Container,
  Form,
  FormControl,
  InputGroup,
} from "react-bootstrap";
import { getAuthToken, clearAuthToken } from "../utils/auth";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function Navigation() {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => getAuthToken());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hasFocused, setHasFocused] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  /** Auth listener */
  useEffect(() => {
    const onAuthChanged = (e) => {
      const newToken = e?.detail?.token ?? getAuthToken();
      setToken(newToken);
    };
    const onStorage = (e) => e.key === "authToken" && setToken(e.newValue);

    window.addEventListener("authChanged", onAuthChanged);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("authChanged", onAuthChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  /** Logout */
  const handleLogout = () => {
    clearAuthToken();
    setToken(null);
    navigate("/login");
  };

  const cancelPreviousRequest = () => {
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (err) {}
      abortControllerRef.current = null;
    }
  };

  const handleSearch = async (queryArg) => {
    cancelPreviousRequest();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setLoading(true);

      const params = { page: 1, limit: 10 };
      if (queryArg && String(queryArg).trim().length > 0) {
        params.query = String(queryArg).trim();
      }

      const res = await axios.get(`${API_BASE}/api/bikes/search`, {
        params,
        signal: controller.signal,
      });

      const bikes =
        res?.data && Array.isArray(res.data.bikes) ? res.data.bikes : [];
      setSearchResults(bikes);
      setShowDropdown(bikes.length > 0);
      setHighlightedIndex(-1);
    } catch (err) {
      const isAbort =
        err?.name === "CanceledError" ||
        err?.message === "canceled" ||
        err?.code === "ERR_CANCELED";
      if (!isAbort) {
        console.error("Search error:", err);
        setSearchResults([]);
        setShowDropdown(false);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  useEffect(() => {
    if (!hasFocused) return;

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery, hasFocused]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onInputKeyDown = (e) => {
    if (!showDropdown || searchResults.length === 0) {
      if (e.key === "Enter" && searchQuery && searchQuery.trim() !== "") {
        navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
        setShowDropdown(false);
        setSearchResults([]);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev + 1;
        return next >= searchResults.length ? 0 : next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev - 1;
        return next < 0 ? searchResults.length - 1 : next;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      const idx = highlightedIndex >= 0 ? highlightedIndex : 0;
      const bike = searchResults[idx];
      if (bike) {
        navigateToBike(bike._id);
      } else if (searchQuery && searchQuery.trim() !== "") {
        navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
        setShowDropdown(false);
        setSearchResults([]);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }
  };

  const navigateToBike = (id) => {
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    setHighlightedIndex(-1);
    navigate(`/bikes/${id}`);
  };

  const popperConfig = {
    strategy: "fixed",
    modifiers: [
      { name: "offset", options: { offset: [0, 6] } },
      {
        name: "preventOverflow",
        options: { boundary: "viewport", padding: 8 },
      },
    ],
  };

  /** Brand and links */
  const BrandAndLinks = (
    <>
      <Navbar.Brand as={Link} to="/" className="brandStyle no-scale">
        <img src={motolinelogo} alt="MotoLine Logo" className="brandImg" />
      </Navbar.Brand>

      <Nav className="me-auto">
        <Nav.Link as={Link} to="/" className="hoverStyle">
          Home
        </Nav.Link>
        <NavDropdown
          title="Select Brand"
          id="brand-dropdown"
          className="brand-dropdown no-scale"
          align="start"
          popperConfig={popperConfig}
        >
          {[
            "Honda",
            "Yamaha",
            "Suzuki",
            "Kawasaki",
            "Ducati",
            "BMW",
            "KTM",
            "Harley-Davidson",
            "Triumph",
            "Aprilia",
            "Indian",
            "Royal Enfield",
          ].map((brand) => (
            <NavDropdown.Item
              key={brand}
              onClick={() => navigate(`/bikes/brand/${brand}`)}
            >
              {brand}
            </NavDropdown.Item>
          ))}
        </NavDropdown>
      </Nav>
    </>
  );

  const SearchBar = (
    <div className="position-relative searchWidth" ref={containerRef}>
      <Form
        className="d-flex align-items-center w-100"
        onSubmit={(e) => {
          e.preventDefault();
          if (searchQuery && searchQuery.trim() !== "") {
            navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
            setShowDropdown(false);
            setSearchResults([]);
          } else {
            handleSearch();
          }
        }}
      >
        <InputGroup className="custom-search w-100">
          <FormControl
            ref={inputRef}
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              setHasFocused(true);
              handleSearch();
            }}
            onKeyDown={onInputKeyDown}
            autoComplete="off"
          />
          <InputGroup.Text>
            <img src={searchIcon} alt="search" />
          </InputGroup.Text>
        </InputGroup>
      </Form>

      {showDropdown && searchResults.length > 0 && (
        <div
          className="live-search-dropdown"
          role="listbox"
          aria-label="Search suggestions"
        >
          {searchResults.map((bike, idx) => {
            const isHighlighted = idx === highlightedIndex;
            return (
              <div
                key={bike._id}
                role="option"
                aria-selected={isHighlighted}
                className={`live-search-item ${
                  isHighlighted ? "highlighted" : ""
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  navigateToBike(bike._id);
                }}
                onMouseEnter={() => setHighlightedIndex(idx)}
              >
                <div className="d-flex align-items-center">
                  {bike.firstImageUrl ? (
                    <img
                      src={bike.firstImageUrl}
                      alt={`${bike.brand} ${bike.model}`}
                      style={{
                        width: 48,
                        height: 36,
                        objectFit: "cover",
                        marginRight: 8,
                      }}
                    />
                  ) : (
                    <div style={{ width: 48, height: 36, marginRight: 8 }} />
                  )}
                  <div>
                    <div>
                      <strong>
                        {bike.brand} {bike.model}
                      </strong>
                    </div>
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      {bike.engine ? `${bike.engine} • ` : ""}
                      {bike.production_year
                        ? new Date(bike.production_year).getFullYear()
                        : ""}
                      {bike.price ? ` • ${bike.price}` : ""}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && showDropdown && searchResults.length === 0 && (
        <div className="live-search-dropdown">
          <div className="live-search-item">No suggestions</div>
        </div>
      )}
    </div>
  );

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container fluid>
        {BrandAndLinks}
        <Navbar.Toggle aria-controls="nav-collapse" />
        <Navbar.Collapse
          id="nav-collapse"
          className="justify-content-end flex-column flex-lg-row"
        >
          {SearchBar}

          {token ? (
            <div className="d-flex align-items-center flex-column flex-lg-row mt-2 mt-lg-0">
              <NavDropdown
                title={
                  <img
                    src={menulogo}
                    alt="Menu"
                    style={{ width: 30, height: 30 }}
                  />
                }
                id="loggedin-menu"
                className="menuStyle hoverStyle no-scale"
                align="end"
                popperConfig={popperConfig}
              >
                <NavDropdown.Item as={Link} to="/my-bikes">
                  My Bikes
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/user/profile">
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/settings">
                  Settings
                </NavDropdown.Item>
                <NavDropdown.Item onClick={handleLogout}>
                  Log Out
                </NavDropdown.Item>
              </NavDropdown>
            </div>
          ) : (
            <div className="d-flex align-items-center flex-column flex-lg-row mt-2 mt-lg-0">
              <Nav.Link as={Link} to="/login" className="loginStyle hoverStyle">
                Log In
              </Nav.Link>
              <NavDropdown
                title={
                  <img
                    src={menulogo}
                    alt="Menu"
                    style={{ width: 25, height: 25 }}
                  />
                }
                id="loggedout-menu"
                className="menuStyle hoverStyle no-scale"
                align="end"
                popperConfig={popperConfig}
              >
                <NavDropdown.Item as={Link} to="/about-us">
                  About Us
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/contact">
                  Contact Us
                </NavDropdown.Item>
              </NavDropdown>
            </div>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
