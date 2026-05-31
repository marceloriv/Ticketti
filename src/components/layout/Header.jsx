import { useAuth } from '@hooks/useAuth';
import { useCarrito } from '@hooks/useCarrito';
import { LogOut, ShoppingCart, Ticket, User } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { Button, Container, Nav, Navbar, Stack } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { usuario, logout, carritoId, establecerCarritoId } = useAuth();
  const navigate = useNavigate();
  const { obtenerResumen, resumen, inicializarCarrito } = useCarrito(carritoId);

  const cantidadCarrito = (resumen?.items || []).reduce(
    (sum, item) => sum + (item.cantidad || 0),
    0
  );

  useEffect(() => {
    console.log('[Carrito] useEffect disparado', { carritoId });

    if (carritoId) {
      obtenerResumen().catch((e) => {
        console.error('[Carrito] Error al obtener resumen:', e);
      });
    }
  }, [carritoId, obtenerResumen]);

  const obtenerPayloadDesdeToken = () => {
    const token = localStorage.getItem('token');

    if (!token) return null;

    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  };

  const obtenerRolDesdeToken = () => {
    const payload = obtenerPayloadDesdeToken();
    return payload?.rol || null;
  };

  const obtenerNombreUsuario = () => {
    const payload = obtenerPayloadDesdeToken();

    return (
      usuario?.nombre ||
      payload?.nombre ||
      payload?.sub ||
      'Usuario'
    );
  };

  const handleIrPerfilUsuario = () => {
    const rol = obtenerRolDesdeToken() || usuario?.rol;

    console.log('[Header] Rol detectado:', rol);

    if (rol === 'ADMINPLATAFORMA') {
      navigate('/admin/dashboard');
      return;
    }

    if (rol === 'ORGANIZADOR') {
      navigate('/organizador/dashboard');
      return;
    }

    navigate('/perfil');
  };

  const handleIrCarrito = useCallback(async () => {
    console.log('[Carrito] Click en icono carrito', {
      carritoId,
      usuarioRol: usuario?.rol,
    });

    let id = carritoId;

    if (!id) {
      try {
        console.log('[Carrito] Sin carritoId, inicializando...');
        const resultado = await inicializarCarrito();

        console.log('[Carrito] Carrito inicializado:', resultado);

        if (resultado?.carritoId) {
          establecerCarritoId(resultado.carritoId);
          id = resultado.carritoId;
        }
      } catch (e) {
        console.error('[Carrito] Error al inicializar carrito:', e);
        return;
      }
    }

    if (id) {
      console.log('[Carrito] Navegando a:', `/carrito/${id}`);
      navigate(`/carrito/${id}`);
    } else {
      console.warn('[Carrito] No hay carritoId después de inicializar');
    }
  }, [
    carritoId,
    inicializarCarrito,
    establecerCarritoId,
    navigate,
    usuario?.rol,
  ]);

  const navLinksPublicos = [
    { name: 'Inicio', to: '/home' },
    { name: 'Eventos', to: '/events' },
    { name: 'Sobre Ticketti', to: '/nosotros' },
    { name: 'Contacto', to: '/contact' },
  ];

  const rolActual = obtenerRolDesdeToken() || usuario?.rol;
  const nombreUsuario = obtenerNombreUsuario();

  return (
    <Navbar
      bg="light"
      expand="md"
      sticky="top"
      className="border-bottom shadow-sm"
    >
      <Container>
        <Navbar.Brand
          as="a"
          href="/home"
          className="d-flex align-items-center gap-2"
        >
          <Ticket size={28} />
          <span className="fw-bold fs-4">Ticketti</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" />

        <Navbar.Collapse id="main-navbar" className="mt-1">
          <Nav className="m-auto">
            {navLinksPublicos.map((link, idx) => (
              <Nav.Link key={link.name || idx} as="a" href={link.to}>
                {link.name}
              </Nav.Link>
            ))}
          </Nav>

          <Stack direction="horizontal" gap={3}>
            {usuario || localStorage.getItem('token') ? (
              <>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleIrPerfilUsuario}
                  className="d-flex align-items-center gap-1"
                >
                  <User size={16} />
                  {nombreUsuario}
                </Button>

                {rolActual === 'CLIENTE' && (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleIrCarrito}
                    className="position-relative"
                  >
                    <ShoppingCart size={14} className="me-1" />
                    Carrito

                    {cantidadCarrito > 0 && (
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleIrCarrito();
                        }}
                        className="carrito-badge-ticketti"
                      >
                        {cantidadCarrito}
                      </span>
                    )}
                  </Button>
                )}

                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={logout}
                  className="d-flex align-items-center gap-1"
                >
                  <LogOut size={16} />
                  Salir
                </Button>
              </>
            ) : (
              <Button as="a" href="/login" className="btn-primary">
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
