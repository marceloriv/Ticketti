import { Info, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import ListaEntradasCarrito from '../components/ListaEntradasCarrito';
import ResumenCarrito from '../components/ResumenCarrito';
import { useAuth } from '../hooks/useAuth';
import { useCarrito } from '../hooks/useCarrito';
import { useCarritoGuest } from '../hooks/useCarritoGuest';
import '../styles/components/PaginaCarrito.css';

const PaginaCarrito = () => {
  const { carritoId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    resumen,
    carritoCreado,
    loading,
    error,
    obtenerResumen,
    eliminarEntrada,
    renovarReserva,
    iniciarCheckout,
    limpiarError,
  } = useCarrito(carritoId);
  const {
    cart: guestCart,
    eliminarEntrada: guestEliminarEntrada,
    subtotal: guestSubtotal,
    donacion: guestDonacion,
    total: guestTotal,
    isEmpty: guestIsEmpty,
  } = useCarritoGuest();
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  /** Indica si el usuario es un invitado (no autenticado) */
  const isGuest = !isAuthenticated;
  /** Items del carrito (localStorage para invitados, backend para autenticados) */
  const cartItems = isGuest ? guestCart : (resumen?.items || []);
  /** Subtotal de las entradas (sin donación) */
  const subtotal = isGuest ? guestSubtotal : (resumen?.subtotal || 0);
  /** Monto de donación (10% del subtotal) */
  const donacion = isGuest ? guestDonacion : (resumen?.montoDonacion ?? 0);
  /** Total a pagar (subtotal + donación) */
  const total = isGuest ? guestTotal : (resumen?.total ?? 0);

  useEffect(() => {
    if (carritoId && !isGuest) {
      obtenerResumen().catch((err) => {
        console.error('[PaginaCarrito] Error al obtener resumen:', err);
      });
    }
  }, [carritoId, obtenerResumen, isGuest]);

  /**
   * Maneja la eliminación de una entrada del carrito
   * Para usuarios invitados, elimina del localStorage usando eventoId
   * Para usuarios autenticados, elimina del backend usando detalleId
   *
   * @param {number} detalleId - ID del detalle de la entrada a eliminar (autenticados)
   * @param {Object} item - Objeto completo del item (para obtener eventoId en invitados)
   */
  const handleEliminarEntrada = async (detalleId, item) => {
    if (isGuest) {
      const eventoId = item?.eventoId ?? item?.idEvento;
      if (eventoId) {
        guestEliminarEntrada(eventoId);
      }
      return;
    }
    try {
      await eliminarEntrada(detalleId);
    } catch (err) {
      console.error('[PaginaCarrito] Error al eliminar entrada:', err);
    }
  };

  /**
   * Maneja la renovación de la reserva del carrito
   * Solo disponible para usuarios autenticados
   */
  const handleRenovarReserva = async () => {
    try {
      await renovarReserva();
    } catch (err) {
      console.error('[PaginaCarrito] Error al renovar reserva:', err);
    }
  };

  /**
   * Maneja el proceso de checkout del carrito
   * Solo disponible para usuarios autenticados
   *
   * @param {Event} e - Evento del formulario
   */
  const handleCheckout = async (e) => {
    e.preventDefault();
    limpiarError();
    const causaSocialId = e.target?.causaSocial?.value;
    if (!causaSocialId) return;
    try {
      await iniciarCheckout(causaSocialId);
      setCheckoutSuccess(true);
      setTimeout(() => {
        navigate('/perfil');
      }, 2500);
    } catch (err) {
      console.error('[PaginaCarrito] Error al iniciar checkout:', err);
    }
  };

  /**
   * Maneja el checkout para usuarios invitados
   * Redirige a la página de login para que el usuario se registre
   */
  const handleGuestCheckout = () => {
    navigate('/login');
  };

  if (isGuest && guestIsEmpty) {
    return (
      <Container className="py-5 pagina-carrito-ticketti">
        <div className="pagina-carrito-vacio">
          <div className="pagina-carrito-vacio-icono">
            <ShoppingBag size={64} />
          </div>
          <h2 className="pagina-carrito-vacio-titulo">Carrito de Compras</h2>
          <p className="pagina-carrito-vacio-texto">Tu carrito está vacío. Agrega entradas para comenzar tu compra.</p>
          <Button variant="primary" className="pagina-carrito-boton-inicio" onClick={() => navigate('/home')}>
            Explorar Eventos
          </Button>
        </div>
      </Container>
    );
  }

  if (!isGuest && !carritoId) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="d-flex align-items-center">
          <Info className="me-2" size={20} />
          <div>No se ha especificado un ID de carrito.</div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="pagina-carrito-container">
      <Card className="pagina-carrito-header-card mb-4">
        <Card.Body>
          <div className="pagina-carrito-header">
            <ShoppingBag className="pagina-carrito-header-icon" size={32} />
            <div>
              <h2 className="pagina-carrito-titulo">Carrito de Compras</h2>
              <p className="pagina-carrito-subtitulo">
                {isGuest ? (
                  <>
                    <Badge bg="info" className="me-2">Invitado</Badge>
                    Inicia sesión para completar tu compra
                  </>
                ) : (
                  'Revisa tus entradas antes de pagar'
                )}
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" className="pagina-carrito-alerta d-flex align-items-center">
          <Info className="me-2" size={20} />
          <div>{error}</div>
        </Alert>
      )}

      {checkoutSuccess && (
        <Alert variant="success" className="pagina-carrito-alerta">
          Reserva iniciada exitosamente. Redirigiendo...
        </Alert>
      )}

      {isGuest && (
        <Card className="pagina-carrito-info-card mb-4">
          <Card.Body className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <Info className="me-3 text-info" size={24} />
              <div>
                <strong>Modo Invitado</strong>
                <p className="mb-0 text-muted small">Para completar tu compra, necesitas tener una cuenta.</p>
              </div>
            </div>
            <Button variant="outline-primary" onClick={() => navigate('/login')}>
              Iniciar Sesión
            </Button>
          </Card.Body>
        </Card>
      )}

      {loading && !resumen && !isGuest ? (
        <div className="pagina-carrito-loading d-flex flex-column align-items-center justify-content-center">
          <Spinner animation="border" variant="primary" role="status" className="mb-3">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="text-muted">Cargando tu carrito...</p>
        </div>
      ) : guestIsEmpty && isGuest ? (
        <div className="pagina-carrito-vacio">
          <div className="pagina-carrito-vacio-icono">
            <ShoppingBag size={64} />
          </div>
          <h3 className="pagina-carrito-vacio-texto">Tu carrito está vacío</h3>
          <Button variant="primary" className="pagina-carrito-boton-inicio" onClick={() => navigate('/home')}>
            Explorar Eventos
          </Button>
        </div>
      ) : (
        <Row className="pagina-carrito-contenido">
          <Col lg={8} className="pagina-carrito-entradas mb-4 mb-lg-0">
            <ListaEntradasCarrito
              entradas={cartItems}
              onEliminar={handleEliminarEntrada}
              onRenovar={!isGuest ? handleRenovarReserva : undefined}
              puedeRenovar={!isGuest && resumen?.puedeRenovarReserva}
              loading={loading}
            />
          </Col>
          <Col lg={4} className="pagina-carrito-resumen">
            <ResumenCarrito
              resumen={isGuest ? { items: cartItems, subtotal, montoDonacion: donacion, total } : (resumen || carritoCreado)}
              onCheckout={isGuest ? handleGuestCheckout : (carritoCreado ? handleCheckout : undefined)}
              loading={loading}
              isGuest={isGuest}
            />
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default PaginaCarrito;
