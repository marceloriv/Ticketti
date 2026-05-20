import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useCarrito } from '@hooks/useCarrito';
import { LogOut, Ticket, User, ShoppingCart } from 'lucide-react';
import { Badge, Button, Container, Nav, Navbar, Stack } from 'react-bootstrap';
import { useEffect, useCallback, useState } from 'react';

const Header = () => {
  const { usuario, logout, carritoId, establecerCarritoId } = useAuth();
  const navigate = useNavigate();
  const { obtenerResumen, resumen, inicializarCarrito } = useCarrito(carritoId);

  // Cantidad total de entradas en el carrito
  const cantidadCarrito = (resumen?.items || []).reduce(
    (sum, item) => sum + (item.cantidad || 0),
    0
  );

  // Obtener resumen al montar y cuando cambie el carritoId
  useEffect(() => {
    console.log('[Carrito] useEffect disparado', { carritoId });
    if (carritoId) {
      obtenerResumen().catch((e) => {
        console.error('[Carrito] Error al obtener resumen:', e);
      });
    }
  }, [carritoId, obtenerResumen]);

  console.log('[Header] Render', { usuario: usuario?.nombre, rol: usuario?.rol, carritoId, cantidadCarrito });

  const handleIrCarrito = useCallback(async () => {
    console.log('[Carrito] Click en icono carrito', { carritoId, usuarioRol: usuario?.rol });
    let id = carritoId;

    // Si no hay carritoId, intentar inicializar uno nuevo
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
  }, [carritoId, inicializarCarrito, establecerCarritoId, navigate, usuario?.rol]);

  const navLinksPublicos = [
    { name: 'Inicio', to: '/home' },
    { name: 'Eventos', to: '/events' },
    { name: 'Sobre Ticketti', to: '/nosotros' },
    { name: 'Contacto', to: '/contact' },
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
                    onClick={handleIrCarrito}
                    className="position-relative"
                    style={{ cursor: 'pointer' }}
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
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          backgroundColor: 'red',
                          color: 'white',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          zIndex: 1000,
                          border: '2px solid white',
                        }}
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
                  <LogOut size={16} /> Salir
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
