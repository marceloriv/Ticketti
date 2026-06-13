import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { Info, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Alert,
    Button,
    Container,
    Spinner
} from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import ListaEntradasCarrito from '../components/ListaEntradasCarrito';
import ResumenCarrito from '../components/ResumenCarrito';
import { useAuth } from '../hooks/useAuth';
import { useCarrito } from '../hooks/useCarrito';
import { useCarritoGuest } from '../hooks/useCarritoGuest';
import '../styles/components/PaginaCarrito.css';

/**
 * Página que renderiza la vista principal del Carrito de compras.
 * Soporta dos flujos de compra:
 * 1. Usuario Invitado: Almacenado local en localStorage mediante {@link useCarritoGuest}.
 * 2. Usuario Autenticado: Almacenado persistente en base de datos mediante {@link useCarrito}.
 *
 * @returns {React.JSX.Element} Vista de la página de administración del carrito.
 */
const PaginaCarrito = () => {
  const { carritoId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, establecerCarritoId } = useAuth();

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
    inicializarCarrito,
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

  /** Indica si el usuario actual navega sin autenticación */
  const isGuest = !isAuthenticated;
  /** Indica si el carrito está pagado */
  const esCarritoPagado = resumen?.estadoCarrito === 'PAGADO';
  /** Listado unificado de ítems según tipo de usuario */
  const cartItems = isGuest ? guestCart : resumen?.items || [];
  /** Subtotal consolidado */
  const subtotal = isGuest ? guestSubtotal : resumen?.subtotal || 0;
  /** Monto destinado a causas benéficas */
  const donacion = isGuest ? guestDonacion : (resumen?.montoDonacion ?? 0);
  /** Monto total consolidado a facturar */
  const total = isGuest ? guestTotal : (resumen?.total ?? 0);

  // Carga inicial del resumen del carrito si el usuario está autenticado
  useEffect(() => {
    if (carritoId && !isGuest) {
      obtenerResumen().then((res) => {
        if (res && (res.estadoCarrito || res.estado) === 'PAGADO') {
          console.log('[PaginaCarrito] El carrito cargado está PAGADO. Limpiando ID de contexto...');
          establecerCarritoId(null);
        }
      }).catch((err) => {
        console.error('[PaginaCarrito] Error al cargar resumen inicial:', err);
        const errorStr = err.message || '';
        if (
          errorStr.includes('no pertenece') ||
          errorStr.includes('400') ||
          errorStr.includes('404')
        ) {
          console.log('[PaginaCarrito] ID de carrito inválido o ajeno. Redirigiendo a uno nuevo...');
          inicializarCarrito().then((res) => {
            if (res?.carritoId) {
              establecerCarritoId(res.carritoId);
              navigate(`/carrito/${res.carritoId}`, { replace: true });
            }
          });
        }
      });
    }
  }, [carritoId, obtenerResumen, isGuest, inicializarCarrito, establecerCarritoId, navigate]);

  /**
   * Procesa la eliminación de una entrada del carrito.
   *
   * @param {number|string} detalleId - ID de detalle en el backend.
   * @param {Object} item - Objeto de datos del ítem a eliminar.
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
   * Renueva temporalmente el bloqueo o reserva de las entradas en el servidor.
   */
  const handleRenovarReserva = async () => {
    try {
      await renovarReserva();
    } catch (err) {
      console.error(
        '[PaginaCarrito] Error al renovar reserva de entradas:',
        err
      );
    }
  };

  const handleCheckout = async (causaSocialId) => {
    limpiarError();
    try {
      await iniciarCheckout(causaSocialId);
      setCheckoutSuccess(true);
      establecerCarritoId(null);
      setTimeout(() => {
        navigate('/perfil');
      }, 2500);
    } catch (err) {
      console.error('[PaginaCarrito] Error al realizar checkout:', err);
    }
  };

  /**
   * Redirige al login si un invitado intenta pagar sin estar autenticado.
   */
  const handleGuestCheckout = () => {
    navigate('/login');
  };

  // Renderizar estado vacío si aplica
  if (isGuest && guestIsEmpty) {
    return (
      <div className="contacto-page">
        <Header />
        <Container className="py-5 pagina-carrito-container">
          <div className="pagina-carrito-vacio shadow-sm">
            <div className="pagina-carrito-vacio-icono">
              <ShoppingBag size={64} />
            </div>
            <h2 className="pagina-carrito-vacio-titulo">Carrito Vacío</h2>
            <p className="pagina-carrito-vacio-texto">
              Aún no has agregado entradas a tu carrito. ¡Explora eventos y
              reserva las tuyas!
            </p>
            <Button
              variant="primary"
              className="pagina-carrito-boton-inicio"
              onClick={() => navigate('/home')}
            >
              Explorar Eventos
            </Button>
          </div>
        </Container>
        <Footer />
      </div>
    );
  }

  if (!isGuest && !carritoId) {
    return (
      <div className="contacto-page">
        <Header />
        <Container className="py-5 pagina-carrito-container">
          <Alert
            variant="warning"
            className="d-flex align-items-center rounded-3 shadow-sm"
          >
            <Info className="me-3 text-warning" size={24} />
            <div>
              <span className="fw-bold">Atención:</span> No se ha provisto
              ningún identificador de carrito válido.
            </div>
          </Alert>
        </Container>
        <Footer />
      </div>
    );
  }

  return (
    <div className="contacto-page">
      <Header />
      <Container className="pagina-carrito-container py-5">
        <div className="pagina-carrito-glass-card shadow-lg">
          {/* Header del Carrito */}
          <h2 className="pagina-carrito-titulo">Mi Carrito de Compras</h2>
          <p className="pagina-carrito-items-count">
            {cartItems.length} {cartItems.length === 1 ? 'artículo' : 'artículos'}
          </p>

          {error && (
            <Alert
              variant="danger"
              className="pagina-carrito-alerta d-flex align-items-center shadow-sm"
            >
              <Info className="me-2" size={20} />
              <div>{error}</div>
            </Alert>
          )}

          {checkoutSuccess && (
            <Alert variant="success" className="pagina-carrito-alerta shadow-sm">
              ¡Reserva de entradas procesada exitosamente! Redirigiendo a tu
              perfil...
            </Alert>
          )}

          {isGuest && (
            <div className="pagina-carrito-info-card shadow-sm">
              <div>
                <strong>Paso requerido</strong>
                <p className="mb-0 text-muted small">
                  Para registrar la reserva y la donación del 10%, necesitas
                  crear una cuenta o iniciar sesión.
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => navigate('/login')}
              >
                Acceder / Registrarse
              </Button>
            </div>
          )}

          {loading && !resumen && !isGuest ? (
            <div className="pagina-carrito-loading py-5">
              <Spinner
                animation="border"
                variant="primary"
                role="status"
                className="mb-3 spinner-ticketti"
              >
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
              <p className="text-muted">
                Estableciendo conexión con el microservicio de carrito...
              </p>
            </div>
          ) : (
            <div className="pagina-carrito-grid">
              {/* Lista de entradas */}
              <div className="pagina-carrito-entradas">
                <ListaEntradasCarrito
                  entradas={cartItems}
                  onEliminar={handleEliminarEntrada}
                  onRenovar={!isGuest ? handleRenovarReserva : undefined}
                  puedeRenovar={!isGuest && resumen?.puedeRenovarReserva}
                  loading={loading}
                  esCarritoPagado={esCarritoPagado}
                />
              </div>

              {/* Panel de Resumen */}
              <div className="pagina-carrito-resumen">
                <ResumenCarrito
                  resumen={
                    isGuest
                      ? {
                          items: cartItems,
                          subtotal,
                          montoDonacion: donacion,
                          total,
                        }
                      : resumen || carritoCreado
                  }
                  onCheckout={
                    isGuest
                      ? handleGuestCheckout
                      : handleCheckout
                  }
                  loading={loading}
                  isGuest={isGuest}
                  esCarritoPagado={esCarritoPagado}
                />
              </div>
            </div>
          )}
        </div>
      </Container>
      <Footer />
    </div>
  );
};

export default PaginaCarrito;
