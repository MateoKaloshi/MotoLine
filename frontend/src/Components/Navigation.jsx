import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import motolinelogo from "../Images/Navigation/MotoLineLogo.png";
import menulogo from "../Images/Navigation/menu.png";
import searchIcon from "../Images/Navigation/searchicon.png";
import "../CSS/navigationStyle.css";
import { Navbar, Nav, NavDropdown, Container, Form, FormControl, InputGroup } from "react-bootstrap";
import { getAuthToken, clearAuthToken } from "../utils/auth";

export default function Navigation() {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => getAuthToken());

  useEffect(() => {
    const onAuthChanged = (e) => {
      const newToken = (e && e.detail && e.detail.token) ?? getAuthToken();
      setToken(newToken);
    };

    const onStorage = (e) => {
      if (e.key === "authToken") {
        setToken(e.newValue);
      }
    };

    window.addEventListener("authChanged", onAuthChanged);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("authChanged", onAuthChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const handleLogout = () => {
    clearAuthToken();
    setToken(null);
    navigate("/login");
  };

  const popperConfig = {
    strategy: "fixed",
    modifiers: [
      { name: "offset", options: { offset: [0, 6] } },
      { name: "preventOverflow", options: { boundary: "viewport", padding: 8 } },
    ],
  };

  // Brand + brands dropdown
  const BrandAndLinks = (
    <>
      <Navbar.Brand as={Link} to="/" className="brandStyle no-scale">
        <img src={motolinelogo} alt="MotoLine Logo" className="brandImg" style={{ width: 200, height: 40 }} />
      </Navbar.Brand>

      <Nav className="me-auto">
        <Nav.Link as={Link} to="/" className="hoverStyle">Home</Nav.Link>

        <NavDropdown
          title="Select Brand"
          id="basic-nav-dropdown"
          className="brand-dropdown no-scale"
          align="start"
          flip={true}
          popperConfig={popperConfig}
        >
          <NavDropdown.Item href="#topbrands">Top Brands</NavDropdown.Item>
          <NavDropdown.Divider />
          <NavDropdown.Item href="#honda">Honda</NavDropdown.Item>
          <NavDropdown.Item href="#yamaha">Yamaha</NavDropdown.Item>
          <NavDropdown.Item href="#suzuki">Suzuki</NavDropdown.Item>
          <NavDropdown.Item href="#kawasaki">Kawasaki</NavDropdown.Item>
          <NavDropdown.Item href="#ducati">Ducati</NavDropdown.Item>
          <NavDropdown.Item href="#bmw">BMW</NavDropdown.Item>
          <NavDropdown.Item href="#ktm">KTM</NavDropdown.Item>
          <NavDropdown.Item href="#harley">Harley-Davidson</NavDropdown.Item>
          <NavDropdown.Item href="#triumph">Triumph</NavDropdown.Item>
          <NavDropdown.Item href="#aprilia">Aprilia</NavDropdown.Item>
          <NavDropdown.Item href="#indian">Indian Motorcycle</NavDropdown.Item>
          <NavDropdown.Item href="#royalenfield">Royal Enfield</NavDropdown.Item>
        </NavDropdown>
      </Nav>
    </>
  );

  const SearchBar = (
    <Form className="searchWidth d-flex align-items-center me-2">
      <InputGroup className="custom-search" style={{ maxWidth: "300px" }}>
        <FormControl placeholder="Search" aria-label="Search" />
        <InputGroup.Text>
          <img src={searchIcon} alt="search" style={{ width: "16px", height: "16px" }} />
        </InputGroup.Text>
      </InputGroup>
    </Form>
  );

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container fluid>
        {/** Brand (left) */}
        {BrandAndLinks}

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          {/** Search */}
          {SearchBar}

          {/** Right-side items change depending on token */}
          {token ? (
            // Logged-in layout
            <div className="d-flex align-items-center">
              <NavDropdown
                title={<img src={menulogo} alt="Menu" style={{ width: 30, height: 30 }} />}
                id="loggedin-menu"
                className="menuStyle hoverStyle no-scale"
                align="end"
                popperConfig={popperConfig}
              >
                <NavDropdown.Item onClick={handleLogout}>Log Out</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/settings">Settings</NavDropdown.Item>
              </NavDropdown>
            </div>
          ) : (
            // Logged-out layout
            <div className="d-flex align-items-center">
              <Nav.Link as={Link} to="/login" className="loginStyle hoverStyle">Log In</Nav.Link>

              <NavDropdown
                title={<img src={menulogo} alt="Menu" style={{ width: 25, height: 25 }} />}
                id="loggedout-menu"
                className="menuStyle hoverStyle no-scale"
                align="end"
                popperConfig={popperConfig}
              >
                <NavDropdown.Item as={Link} to="/about">About Us</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/contact">Contact Us</NavDropdown.Item>
              </NavDropdown>
            </div>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
