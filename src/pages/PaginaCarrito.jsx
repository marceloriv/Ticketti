import { useEffect, useState } from 'react';
import { Alert, Button, Col, Container, Row, Spinner } from 'react-bootstrap';
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
      obtenerResumen().catch(() => {});
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
      console.error('Error al eliminar entrada:', err);
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
      console.error('Error al renovar reserva:', err);
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
      console.error('Error al iniciar checkout:', err);
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
      <Container className="py-5 bg-light pagina-carrito-ticketti">
        <h2 className="fw-bold mb-4">Carrito de Compras</h2>
        <Alert variant="info" className="text-center">
          Tu carrito está vacío. Agrega entradas para comenzar tu compra.
        </Alert>
      </Container>
    );
  }

  if (!isGuest && !carritoId) {
    return (
      <Container className="py-5">
        <Alert variant="warning">No se ha especificado un ID de carrito.</Alert>
      </Container>
    );
  }

  return (
    <Container className="pagina-carrito-container">
      <h2 className="pagina-carrito-titulo">Carrito de Compras</h2>
      <p className="pagina-carrito-subtitulo">
        {isGuest ? 'Carrito de invitado - Inicia sesión para completar tu compra' : 'Revisa tus entradas antes de pagar'}
      </p>

      {error && <Alert variant="danger" className="pagina-carrito-alerta">{error}</Alert>}

      {checkoutSuccess && (
        <Alert variant="success" className="pagina-carrito-alerta">
          Reserva iniciada exitosamente. Redirigiendo...
        </Alert>
      )}

      {isGuest && (
        <Alert variant="info" className="pagina-carrito-alerta">
          Estás navegando como invitado. Para completar tu compra, necesitas tener una cuenta.
          <Button variant="link" className="p-0 ms-2" onClick={() => navigate('/login')}>
            Inicia sesión o regístrate
          </Button>
        </Alert>
      )}

      {loading && !resumen && !isGuest ? (
        <div className="pagina-carrito-loading">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
        </div>
      ) : guestIsEmpty && isGuest ? (
        <div className="pagina-carrito-vacio">
          <div className="pagina-carrito-vacio-icono">🛒</div>
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
