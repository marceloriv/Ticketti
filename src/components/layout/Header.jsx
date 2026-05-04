import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import '@styles/brand.css';

const Header = () => {
  const navLinks = [
    { name: 'Inicio', href: '#/home' },
    { name: 'Eventos', href: '#/events' },
    { name: 'Sobre Nosotros', href: '#/about' },
    { name: 'Contacto', href: '#/contact' },
    { name: 'Login', href: '#/login' }
  ];

  return (
    <Navbar
      bg="light"
      expand="md"
      sticky="top"
      className="border-bottom shadow-sm"
    >
      <Container>
        <Navbar.Brand href="#/home" className="d-flex align-items-center gap-2">
          <Ticket className="me-2" />
          <span className="fw-bold fs-4">Ticketti</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar" className="mt-1">
          <Nav className="m-auto">
            {navLinks.map((link) => (
              <Nav.Link key={link.name} href={link.href}>
                {link.name}
              </Nav.Link>
            ))}
          </Nav>

          <div className="header-login">
            <Link to="/login" className="btn btn-ticketti shadow">Acceso</Link>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
