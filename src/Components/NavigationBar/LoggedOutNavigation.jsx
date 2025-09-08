import React from 'react'
import motolinelogo from '../../Images/NavigationIcons/MotoLineLogo.png'
import menulogo from '../../Images/NavigationIcons/menu.png'
import searchlogo from '../../Images/NavigationIcons/searchicon.png'
import '../../Style.css'
import { Navbar, Nav, NavDropdown, Container, Form, FormControl, Button } from 'react-bootstrap'

const LoggedOutNavigation = () => {
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container fluid>
        <Navbar.Brand href="#home" className='brandStyle hoverStyle'><img src={motolinelogo} alt="MotoLine Logo" style={{width:200, height:40,}}></img></Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home" className='hoverStyle'>Home</Nav.Link>
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
            <Form className="d-flex me-3 searchBar">
            <FormControl type="search" placeholder="Search" className="me-2 searchStyle" aria-label="Search"/>
            <Button className='searchLogo hoverStyle'><img src={searchlogo}></img></Button>
            </Form>
            <Nav.Link href="#home" className='loginStyle hoverStyle'>Log In</Nav.Link>
            <NavDropdown title={<img src={menulogo} alt="Menu" style={{width: 30, height: 30}} />} id="basic-nav-dropdown" className='menuStyle hoverStyle no-arrow' align={'end'}>
            <NavDropdown.Item href="#aboutus">About Us</NavDropdown.Item>
            <NavDropdown.Item href="#contactus">Contact Us</NavDropdown.Item>
            </NavDropdown>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default LoggedOutNavigation