import Footer from '@components/layout/Footer';
import Header from '@components/layout/Header';
import { useAuth } from '@hooks/useAuth';
import { useCarrito } from '@hooks/useCarrito';
import { eventosApi } from '@api/index';
import { ROUTES } from '@utils/routes';
import logger from '@utils/logger';
import { jwtDecode } from 'jwt-decode';
import { AlertCircle, Calendar, MapPin, Ticket, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Spinner,
} from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useCarritoGuest } from '../hooks/useCarritoGuest';
import '../styles/components/DetalleEvento.css';

/**
 * Formatea un valor numérico a moneda local (CLP - Pesos Chilenos).
 * Si el precio es 0 o nulo, devuelve 'Gratis'.
 *
 * @param {number} price - Precio de la entrada.
 * @returns {string} Precio formateado.
 */
const formatearMoneda = (price) => {
  if (!price) return 'Gratis';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(price);
};

/**
 * Formatea una fecha ISO o string a formato legible dd/mm/aaaa.
 *
 * @param {string} dateString - Cadena de fecha.
 * @returns {string} Fecha formateada.
 */
const formatearFecha = (dateString) => {
  if (!dateString) return 'Fecha por confirmar';
  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString));
};

/**
 * Recupera el identificador único de usuario decodificando el JWT de localStorage
 * como fallback si no está disponible en el objeto del contexto.
 *
 * @param {Object} usuario - Objeto usuario del AuthContext.
 * @returns {number|string|null} ID del usuario o null si no se encuentra.
 */
const getUsuarioId = (usuario) => {
  if (usuario?.id) return usuario.id;
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      return decoded.usuarioId;
    }
  } catch (e) {
    logger.warn('[DetalleEvento] No se pudo decodificar el token JWT:', e);
  }
  return null;
};

/**
 * Componente que renderiza el desglose e información detallada de un evento musical o cultural.
 * Permite seleccionar la cantidad de entradas (máximo 4) y agregarlas al carrito.
 *
 * @returns {React.JSX.Element} Vista del detalle de evento.
 */
const DetalleEvento = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { usuario, isAuthenticated, establecerCarritoId } = useAuth();
  const {
    agregarEntrada,
    inicializarCarrito,
    loading: loadingCarrito,
  } = useCarrito(null);
  const { agregarEntrada: guestAgregarEntrada } = useCarritoGuest();

  const [evento, setEvento] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [errorCarrito, setErrorCarrito] = useState('');

  // Cargar información del evento desde el microservicio
  useEffect(() => {
    const cargarEvento = async () => {
      try {
        setCargando(true);
        const data = await eventosApi.buscarEvento(id);
        setEvento(data);
      } catch (err) {
        logger.error('[DetalleEvento] Error al cargar evento:', err);
        setError('No se pudo cargar el evento de forma correcta.');
      } finally {
        setCargando(false);
      }
    };
    cargarEvento();
  }, [id]);

  /**
   * Maneja el proceso de añadir entradas al carrito de compras.
   * Si el usuario es invitado, almacena en localStorage.
   * Si está autenticado, inicializa y actualiza el carrito en el backend.
   */
  const manejarAgregarAlCarrito = async () => {
    logger.log('[DetalleEvento] Añadiendo entradas al carrito');
    setErrorCarrito('');

    if (cantidad < 1 || cantidad > 4) {
      setErrorCarrito('Debes seleccionar entre 1 y 4 entradas');
      return;
    }

    // Modo invitado (No autenticado): Guardar en localStorage
    if (!isAuthenticated) {
      logger.log('[DetalleEvento] Modo invitado, agregando a localStorage');
      try {
        guestAgregarEntrada({
          eventoId: Number(id),
          tipoEntrada: 'General',
          cantidad,
          precioUnitario: evento?.precioEntrada || 0,
          eventoNombre: evento?.nombre,
        });

        setShowModal(false);
        setCantidad(1);
        navigate('/carrito');
      } catch (err) {
        setErrorCarrito(
          err.message || 'Error al agregar entrada al carrito local.'
        );
      }
      return;
    }

    // Modo autenticado: Guardar en backend
    const usuarioId = getUsuarioId(usuario);
    if (!usuarioId) {
      logger.log('[DetalleEvento] Sin sesión activa, redirigiendo al login');
      navigate('/login');
      return;
    }

    try {
      logger.log('[DetalleEvento] Inicializando carrito en microservicios');
      const { carritoId: idCarrito } = await inicializarCarrito();
      if (!idCarrito) {
        setErrorCarrito(
          'No se pudo crear o inicializar el carrito de compras.'
        );
        return;
      }
      // Registrar el ID del carrito en el contexto global
      establecerCarritoId(idCarrito);

      logger.log(
        '[DetalleEvento] Llamando al microservicio de carrito para agregar item'
      );
      await agregarEntrada(
        {
          eventoId: Number(id),
          tipoEntrada: 'General',
          cantidad,
          precioUnitario: evento?.precioEntrada || 0,
        },
        idCarrito
      );

      setShowModal(false);
      setCantidad(1);
      navigate(`/carrito/${idCarrito}`);
    } catch (err) {
      logger.error(
        '[DetalleEvento] Falló agregar entrada en el microservicio:',
        err
      );
      setErrorCarrito(
        err.message ||
          'No se pudo agregar el ítem al carrito del servidor. Inténtalo de nuevo.'
      );
    }
  };

  if (cargando) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <div className="text-center py-5 my-auto">
          <Spinner animation="border" className="spinner-ticketti" />
          <p className="mt-2 text-muted">Cargando detalles del evento...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !evento) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <Container className="py-5 my-auto">
          <Alert variant="danger">
            <Alert.Heading>Error de Carga</Alert.Heading>
            <p>
              {error ||
                'El evento especificado no existe o no se encuentra disponible.'}
            </p>
            <Button variant="outline-danger" onClick={() => navigate(ROUTES.INICIO)}>
              Volver al inicio
            </Button>
          </Alert>
        </Container>
        <Footer />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="detalle-evento-container py-5">
        <Container>
          <Button
            variant="link"
            onClick={() => {
              try {
                navigate(-1);
              } catch {
                navigate(ROUTES.INICIO);
              }
            }}
            className="mb-4 p-0 text-decoration-none text-ticketti"
          >
            ← Volver Atrás
          </Button>

          <Row className="g-4">
            <Col lg={6}>
              <img
                src={
                  evento.imagenUrl ||
                  'https://via.placeholder.com/600x400?text=Ticketti'
                }
                alt={evento.nombre}
                className="detalle-evento-imagen w-100 rounded-4 shadow-sm"
                onError={(e) => {
                  e.target.src =
                    'https://via.placeholder.com/600x400?text=Ticketti';
                }}
              />
            </Col>

            <Col lg={6}>
              <div className="detalle-evento-content-wrapper p-2">
                <Badge
                  bg="info"
                  className="detalle-evento-badge mb-3 px-3 py-2 text-dark"
                >
                  {evento.genero}
                </Badge>
                <h1 className="detalle-evento-titulo mb-3">{evento.nombre}</h1>
                <p className="detalle-evento-descripcion-texto text-muted mb-4">
                  {evento.descripcion}
                </p>

                <div className="detalle-evento-informacion-desglose mb-4">
                  <div className="detalle-evento-info-card d-flex align-items-center gap-3 p-3 mb-2 rounded-3">
                    <Calendar
                      size={20}
                      className="detalle-evento-info-icono text-primary" aria-hidden="true"
                    />
                    <div>
                      <small className="text-muted d-block">Fecha y Hora</small>
                      <span className="fw-semibold">
                        {formatearFecha(evento.fecha)}
                      </span>
                    </div>
                  </div>

                  <div className="detalle-evento-info-card d-flex align-items-center gap-3 p-3 mb-2 rounded-3">
                    <MapPin
                      size={20}
                      className="detalle-evento-info-icono text-primary" aria-hidden="true"
                    />
                    <div>
                      <small className="text-muted d-block">Recinto</small>
                      <span className="fw-semibold">
                        {evento.recinto?.nombre} — {evento.recinto?.ubicacion}
                      </span>
                    </div>
                  </div>

                  <div className="detalle-evento-info-card d-flex align-items-center gap-3 p-3 mb-2 rounded-3">
                    <Users
                      size={20}
                      className="detalle-evento-info-icono text-primary" aria-hidden="true"
                    />
                    <div>
                      <small className="text-muted d-block">
                        Disponibilidad
                      </small>
                      <span className="fw-semibold">
                        {evento.stock} entradas restantes
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detalle-evento-precio-card p-4 rounded-4 shadow-sm">
                  <p className="detalle-evento-precio-etiqueta text-muted mb-1">
                    Precio Unitario (General)
                  </p>
                  <h3 className="detalle-evento-precio-valor mb-3">
                    {formatearMoneda(evento.precioEntrada)}
                  </h3>
                  {usuario?.rol === 'ORGANIZADOR' && Number(evento.organizadorId) === Number(usuario?.id) ? (
                    <>
                      <Button
                        size="lg"
                        variant="warning"
                        className="w-100 py-3 d-flex align-items-center justify-content-center gap-2 cursor-not-allowed"
                        disabled
                      >
                        <Ticket size={22} />
                        Eres el Organizador
                      </Button>
                      <p className="text-warning text-center small mb-0 mt-3 fw-semibold">
                        No puedes comprar entradas para un evento creado por ti mismo.
                      </p>
                    </>
                  ) : (
                    <>
                      <Button
                        size="lg"
                        className="detalle-evento-boton-agregar w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                        onClick={() => setShowModal(true)}
                        disabled={evento.stock <= 0}
                      >
                        <Ticket size={22} />
                        {evento.stock > 0 ? 'Comprar entrada' : 'Agotado'}
                      </Button>
                      {evento.stock > 0 && (
                        <p className="text-muted small text-center mb-0 mt-3">
                          Límite de 4 entradas por transacción.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </main>

      {/* ── Modal de selección de cantidad ── */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        className="detalle-evento-modal"
      >
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title className="fw-bold">Selecciona tu cantidad</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <div className="detalle-evento-modal-info p-3 mb-3 rounded-3 bg-light">
            <span className="d-block fw-bold text-dark">{evento.nombre}</span>
            <small className="text-muted">
              Costo unitario: {formatearMoneda(evento.precioEntrada)}
            </small>
          </div>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Cantidad de entradas
            </Form.Label>
            <Form.Control
              type="number"
              min={1}
              max={4}
              value={cantidad}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (!Number.isNaN(val) && val >= 1 && val <= 4) {
                  setCantidad(val);
                  setErrorCarrito('');
                }
              }}
              className="py-2"
            />
          </Form.Group>
          <p className="small text-muted mb-0">
            * Ayudas a financiar proyectos benéficos con el 10% de tu pago.
          </p>
          {errorCarrito && (
            <Alert
              variant="danger"
              className="mt-3 mb-0 d-flex align-items-center gap-2 py-2"
            >
              <AlertCircle size={16} />
              <small>{errorCarrito}</small>
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top-0 pt-0">
          <Button
            variant="outline-secondary"
            onClick={() => {
              setShowModal(false);
              setErrorCarrito('');
              setCantidad(1);
            }}
            disabled={loadingCarrito}
          >
            Cancelar
          </Button>
          <Button
            className="btn-ticketti"
            onClick={manejarAgregarAlCarrito}
            disabled={loadingCarrito || cantidad < 1 || cantidad > 4}
          >
            {loadingCarrito
              ? 'Procesando...'
              : `Agregar ${cantidad} al carrito`}
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
    </div>
  );
};

export default DetalleEvento;
