import React from 'react'
import motolinelogo from '../../Images/NavigationIcons/MotoLineLogo.png'
import menulogo from '../../Images/NavigationIcons/menu.png'
import searchIcon from '../../Images/NavigationIcons/searchicon.png'
import '../../CSS/NavigationStyle.css'
import { Navbar, Nav, NavDropdown, Container, Form, FormControl, InputGroup, Button } from 'react-bootstrap'

const LoggedOutNavigation = () => {
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container fluid>
        <Navbar.Brand href="#home" className='brandStyle hoverStyle'><img src={motolinelogo} alt="MotoLine Logo" style={{width:200, height:40,}}></img></Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">

            {/* Home Link */}

            <Nav.Link href="#home" className='hoverStyle'>Home</Nav.Link>
            
            {/* Brand Dropdown */}
            
            <NavDropdown title="Select Brand" id="basic-nav-dropdown" className="brand-dropdown hoverStyle">
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

            {/* Search Bar */}

            <Form className='searchWidth'>
            <InputGroup className="custom-search" style={{ maxWidth: "300px" }}>
              <FormControl placeholder="Search" aria-label="Search" />
              <InputGroup.Text>
                <img src={searchIcon} alt="search" style={{ width: "16px", height: "16px" }} />
              </InputGroup.Text>
            </InputGroup>
            </Form>

            <div className="d-flex align-items-center">
              {/* Log In */}
              <Nav.Link href="#home" className='loginStyle hoverStyle'>Log In</Nav.Link>

              {/* Menu */}
              <NavDropdown 
                title={<img src={menulogo} alt="Menu" style={{width: 25, height: 25}} />} 
                id="basic-nav-dropdown" 
                className='menuStyle hoverStyle no-arrow' 
                align={'end'}
              >
                <NavDropdown.Item href="#aboutus">About Us</NavDropdown.Item>
                <NavDropdown.Item href="#contactus">Contact Us</NavDropdown.Item>
              </NavDropdown>
            </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default LoggedOutNavigation