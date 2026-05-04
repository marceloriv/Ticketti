import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Ticket } from 'lucide-react';

const Header = () => {
  const navLinks = [
    { name: 'Inicio', href: '#home' },
    { name: 'Eventos', href: '#events' },
    { name: 'Sobre Nosotros', href: '#about' },
    { name: 'Contacto', href: '#contact' },
  ];

  return (
    <Navbar
      bg="light"
      expand="md"
      sticky="top"
      className="border-bottom shadow-sm"
    >
      <Container>
        <Navbar.Brand href="#home" className="d-flex gap-2">
          <Ticket className="icon-ticketti me-2 " />
          <span className="fw-bold fs-4">Ticketti</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="m-auto">
            {navLinks.map((link) => (
              <Nav.Link key={link.name} href={link.href}>
                {link.name}
              </Nav.Link>
            ))}
          </Nav>
        </Navbar.Collapse>
        <div className="d-none d-md-block">
          <Button as="a" variant="primary">
            Acceso
          </Button>
        </div>
      </Container>
    </Navbar>
  );
};

export default Header;
