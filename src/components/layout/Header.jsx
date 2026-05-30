import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@utils/routes';
import { LogOut, Ticket, User } from 'lucide-react';
import { Badge, Button, Container, Nav, Navbar, Stack } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';

const Header = () => {
  const { usuario, logout } = useAuth();

  const navLinksPublicos = [
    { name: 'Inicio', to: '/home' },
    { name: 'Eventos', to: '/events' },
    { name: 'Sobre Ticketti', to: '/nosotros' },
    { name: 'Contacto', to: '/Contacto' },
  ];

  return (
    <Navbar
      bg="light"
      expand="md"
      sticky="top"
      className="border-bottom shadow-sm"
    >
      <Container>
        <Navbar.Brand
          as={Link}
          to="/home"
          className="d-flex align-items-center gap-2"
        >
          <Ticket size={28} />
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

                {usuario?.rol === 'CLIENTE' && (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    as={Link}
                    to="/carrito"
                  >
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
              <Button as={Link} to="/login" className='btn-primary'>
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
