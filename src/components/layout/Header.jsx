import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Ticket } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import '@styles/brand.css';

const Header = () => {
  const navLinks = [
    { name: 'Inicio', to: '/home' },
    { name: 'Eventos', to: '/events' },
    { name: 'Sobre Nosotros', to: '/about' },
    { name: 'Contacto', to: '/contact' },
    { name: 'Login', to: '/login' }
  ];

  return (
    <Navbar
      bg="light"
      expand="md"
      sticky="top"
      className="border-bottom shadow-sm"
    >
      <Container>
        <Navbar.Brand as={Link} to="/home" className="d-flex align-items-center gap-2">
          <Ticket className="me-2" />
          <span className="fw-bold fs-4">Ticketti</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" />

        <Navbar.Collapse id="main-navbar" className="mt-1">
          <Nav className="m-auto">
            {navLinks.map((link) => (
              <Nav.Link
                key={link.name}
                as={NavLink}
                to={link.to}
              >
                {link.name}
              </Nav.Link>
            ))}
          </Nav>

          <div className="header-login">
            <Link to="/login" className="btn btn-ticketti shadow">
              Acceso
            </Link>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;