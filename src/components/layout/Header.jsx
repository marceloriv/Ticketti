import { useAuth } from '@hooks/useAuth';
import { useCarrito } from '@hooks/useCarrito';
import { useCarritoGuest } from '@hooks/useCarritoGuest';
import { ROUTES } from '@utils/routes';
import { jwtDecode } from 'jwt-decode';
import { LogOut, ShoppingCart, Ticket, User } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { Button, Container, Nav, Navbar, Stack } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

/**
 * Componente de navegación principal de la aplicación
 * Muestra el logo, enlaces de navegación, botón de carrito y opciones de usuario
 */
const Header = () => {
  const { usuario, logout, carritoId, establecerCarritoId, isAuthenticated } =
    useAuth();
  const navigate = useNavigate();
  const { obtenerResumen, resumen, inicializarCarrito } = useCarrito(carritoId);
  const { totalEntradas: guestTotalEntradas } = useCarritoGuest();
  const obtenerResumenRef = useRef(obtenerResumen);

  /** Cantidad de items en el carrito (backend para autenticados, localStorage para invitados) */
  const cantidadCarrito = isAuthenticated
    ? (resumen?.items || []).reduce(
        (sum, item) => sum + (item.cantidad || 0),
        0
      )
    : guestTotalEntradas;

  useEffect(() => {
    obtenerResumenRef.current = obtenerResumen;
  }, [obtenerResumen]);

  useEffect(() => {
    if (carritoId) {
      obtenerResumenRef
        .current()
        .then((res) => {
          if (res && (res.estadoCarrito || res.estado) === 'PAGADO') {
            console.log(
              '[Carrito] Carrito actual ya está PAGADO. Limpiando ID...'
            );
            establecerCarritoId(null);
          }
        })
        .catch((e) => {
          console.error('[Carrito] Error al obtener resumen:', e);
          const errorStr = (e.message || '').toLowerCase();
          if (
            errorStr.includes('no pertenece') ||
            errorStr.includes('no encontrado') ||
            errorStr.includes('400') ||
            errorStr.includes('404')
          ) {
            console.log(
              '[Carrito] ID de carrito inválido o ajeno detectado. Reinicializando...'
            );
            inicializarCarrito().then((res) => {
              if (res?.carritoId) {
                establecerCarritoId(res.carritoId);
              }
            });
          }
        });
    }
  }, [carritoId, establecerCarritoId, inicializarCarrito]);

  /**
   * Obtiene el payload del token JWT del localStorage
   *
   * @returns {Object|null} Payload del token o null si no existe
   */
  const obtenerPayloadDesdeToken = () => {
    const token = localStorage.getItem('token');

    if (!token) return null;

    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  };

  /**
   * Obtiene el rol del usuario desde el token JWT
   *
   * @returns {string|null} Rol del usuario o null si no existe
   */
  const obtenerRolDesdeToken = () => {
    const payload = obtenerPayloadDesdeToken();
    return payload?.rol || null;
  };

  /**
   * Obtiene el nombre del usuario desde el token JWT o del contexto
   *
   * @returns {string} Nombre del usuario
   */
  const obtenerNombreUsuario = () => {
    const payload = obtenerPayloadDesdeToken();

    return usuario?.nombre || payload?.nombre || payload?.sub || 'Usuario';
  };

  /**
   * Maneja la navegación al perfil del usuario según su rol
   */
  const handleIrPerfilUsuario = () => {
    const rol = obtenerRolDesdeToken() || usuario?.rol;

    console.log('[Header] Rol detectado:', rol);
    // Redirigir según el rol del usuario.
    if (rol === 'ADMINPLATAFORMA') {
      navigate('/admin/dashboard');
      return;
    }
    // Si el rol es ORGANIZADOR, redirigir a su dashboard específico.
    if (rol === 'ORGANIZADOR') {
      navigate('/organizador/dashboard');
      return;
    }

    navigate('/perfil');
  };

  /**
   * Maneja la navegación al carrito de compras
   * Para usuarios autenticados, navega a /carrito/{id}
   * Para usuarios invitados, navega a /carrito
   */
  const handleIrCarrito = useCallback(async () => {
    if (isAuthenticated) {
      let id = carritoId;

      if (!id) {
        try {
          const resultado = await inicializarCarrito();

          if (resultado?.carritoId) {
            establecerCarritoId(resultado.carritoId);
            id = resultado.carritoId;
          }
        } catch (e) {
          // Fallback: navegar a /carrito (carrito de invitado) si el backend falla
          navigate('/carrito');
          return;
        }
      }

      if (id) {
        navigate(`/carrito/${id}`);
      } else {
        navigate('/carrito');
      }
    } else {
      // Usuario invitado: navegar a /carrito (sin ID)
      navigate('/carrito');
    }
  }, [
    carritoId,
    inicializarCarrito,
    establecerCarritoId,
    navigate,
    usuario?.rol,
    isAuthenticated,
  ]);

  const navLinksPublicos = [
    /** Enlaces de navegación públicos */
    { name: 'Inicio', to: ROUTES.INICIO },
    { name: 'Eventos', to: ROUTES.EVENTOS },
    { name: 'Sobre Ticketti', to: ROUTES.NOSOTROS },
    { name: 'Contacto', to: ROUTES.CONTACTO },
  ];

  /** Rol actual del usuario (desde token o contexto) */
  const rolActual = obtenerRolDesdeToken() || usuario?.rol;
  /** Nombre del usuario actual */
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
          href={ROUTES.HOME}
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

                {(rolActual === 'CLIENTE' ||
                  rolActual === 'ORGANIZADOR' ||
                  rolActual === 'ADMINPLATAFORMA' ||
                  !isAuthenticated) && (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleIrCarrito}
                    className="position-relative"
                    aria-label={`Ver carrito, ${cantidadCarrito} entradas añadidas`}
                  >
                    <ShoppingCart
                      size={14}
                      className="me-1"
                      aria-hidden="true"
                    />
                    Carrito
                    {cantidadCarrito > 0 && (
                      <span
                        className="carrito-badge-ticketti"
                        aria-hidden="true"
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
                  aria-label="Cerrar sesión de la cuenta"
                >
                  <LogOut size={16} aria-hidden="true" />
                  Salir
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleIrCarrito}
                  className="position-relative"
                  aria-label={`Ver carrito, ${cantidadCarrito} entradas añadidas`}
                >
                  <ShoppingCart size={14} className="me-1" aria-hidden="true" />
                  Carrito
                  {cantidadCarrito > 0 && (
                    <span className="carrito-badge-ticketti" aria-hidden="true">
                      {cantidadCarrito}
                    </span>
                  )}
                </Button>
                <Button
                  as="a"
                  href="/login"
                  className="btn-primary"
                  aria-label="Acceder a la plataforma"
                >
                  Acceso
                </Button>
              </>
            )}
          </Stack>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
