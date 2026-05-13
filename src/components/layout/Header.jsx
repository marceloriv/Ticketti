import { Navbar, Nav, Container, Button, Badge, Stack } from 'react-bootstrap';
import { Ticket, LogOut, User } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

const BRAND_COLOR = '#5ad4e6';

const Header = () => {
  // CORRECCIÓN: agregar esOrganizador al destructuring
  const { usuario, logout, esAdmin, esCliente, esOrganizador } = useAuth();

  const navLinksPublicos = [
    { name: 'Inicio', to: '/home' },
    { name: 'Eventos', to: '/events' },
    { name: 'Sobre Nosotros', to: '/about' },
    { name: 'Contacto', to: '/contact' },
    { name: 'Login', to: '/login' }
  ];

  return (
    <Navbar bg="light" expand="md" sticky="top" className="border-bottom shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/home" className="d-flex align-items-center gap-2">
          <Ticket size={28} style={{ color: BRAND_COLOR }} />
          <span className="fw-bold fs-4">Ticketti</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" />

        <Navbar.Collapse id="main-navbar" className="mt-1">
          <Nav className="m-auto">
            {navLinksPublicos.map((link) => (
              <Nav.Link key={link.name} as={NavLink} to={link.to}>
                {link.name}
              </Nav.Link>
            ))}
          </Nav>

          <Stack direction="horizontal" gap={3}>
            {usuario ? (
              <>
                <span className="text-muted small d-flex align-items-center gap-1">
                  <User size={16} />
                  {usuario.nombre || 'Usuario'}
                </span>

                {esCliente() && (
                  <Button variant="outline-secondary" size="sm" as={Link} to="/carrito">
                    Carrito <Badge bg="info">0</Badge>
                  </Button>
                )}

                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={logout}
                  className="d-flex align-items-center gap-1"
                >
                  <LogOut size={16} /> Salir
                </Button>
              </>
            ) : (
              <Button
                as={Link}
                to="/login"
                style={{ backgroundColor: BRAND_COLOR, borderColor: BRAND_COLOR, color: '#000' }}
              >
                Acceso
              </Button>
            )}
          </Stack>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
