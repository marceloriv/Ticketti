import api from '@api/api';
import Footer from '@components/layout/Footer';
import Header from '@components/layout/Header';
import { useAuth } from '@hooks/useAuth';
import { useCarrito } from '@hooks/useCarrito';
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

const formatearMoneda = (price) => {
  if (!price) return 'Gratis';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(price);
};

const formatearFecha = (dateString) => {
  if (!dateString) return 'Fecha por confirmar';
  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString));
};

// Helper para obtener usuarioId del JWT si no está en usuario.id
const getUsuarioId = (usuario) => {
  if (usuario?.id) return usuario.id;
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      return decoded.usuarioId;
    }
  } catch (e) {
    console.warn('No se pudo decodificar el token:', e);
  }
  return null;
};

const DetalleEvento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  /** Indica si el usuario está autenticado en el sistema */
  const { usuario, isAuthenticated, establecerCarritoId } = useAuth();
  const { agregarEntrada, inicializarCarrito, loading: loadingCarrito } = useCarrito(null);
  /** Función para agregar entradas al carrito de invitado (localStorage) */
  const { agregarEntrada: guestAgregarEntrada } = useCarritoGuest();
  const [evento, setEvento] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [errorCarrito, setErrorCarrito] = useState('');

  useEffect(() => {
    const cargarEvento = async () => {
      try {
        setCargando(true);
        const response = await api.get(`/eventos/buscarEvento/${id}`);
        setEvento(response.data);
      } catch {
        setError('No se pudo cargar el evento.');
      } finally {
        setCargando(false);
      }
    };
    cargarEvento();
  }, [id]);

  /**
   * Maneja el proceso de agregar entradas al carrito
   * Para usuarios invitados, agrega al localStorage
   * Para usuarios autenticados, agrega al backend
   *
   * @returns {Promise<void>} Promesa que se resuelve cuando la entrada se agrega
   */
  const manejarAgregarAlCarrito = async () => {
    console.log('[DetalleEvento] Iniciando agregar al carrito');
    setErrorCarrito('');

    if (cantidad < 1 || cantidad > 4) {
      setErrorCarrito('Debes seleccionar entre 1 y 4 entradas');
      return;
    }

    // Guest user: add to localStorage cart
    if (!isAuthenticated) {
      console.log('[DetalleEvento] Usuario no autenticado, usando carrito guest');
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
        setErrorCarrito(err.message || 'Error al agregar entrada al carrito.');
      }
      return;
    }

    // Authenticated user: add to backend cart with fallback
    const usuarioId = getUsuarioId(usuario);
    if (!usuarioId) {
      console.log('[DetalleEvento] Usuario sin ID, redirigiendo a login');
      navigate('/login');
      return;
    }

    try {
      console.log('[DetalleEvento] Usuario autenticado, inicializando carrito');
      // Crear o recuperar carrito activo del usuario
      const { carritoId: idCarrito } = await inicializarCarrito();
      console.log('[DetalleEvento] Carrito inicializado con ID:', idCarrito);
      if (!idCarrito) {
        setErrorCarrito('No se pudo crear el carrito. Intenta nuevamente.');
        return;
      }
      // Actualizar el contexto de autenticación con el nuevo carritoId
      establecerCarritoId(idCarrito);

      // Agregar entrada al carrito
      console.log('[DetalleEvento] Agregando entrada al carrito:', idCarrito);
      await agregarEntrada(
        {
          eventoId: Number(id),
          tipoEntrada: 'General',
          cantidad,
          precioUnitario: evento?.precioEntrada || 0,
        },
        idCarrito
      );
      console.log('[DetalleEvento] Entrada agregada exitosamente');

      setShowModal(false);
      setCantidad(1);

      // Navegar al carrito
      navigate(`/carrito/${idCarrito}`);
    } catch (err) {
      // Fallback: usar carrito de invitado si el backend falla
      console.warn('Backend falló, usando carrito de invitado como fallback:', err);
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
      } catch (guestError) {
        setErrorCarrito(
          guestError.message || 'Error al agregar entrada al carrito.'
        );
      }
    }
  };

  if (cargando)
    return (
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <div className="text-center py-5">
          <Spinner animation="border" className="spinner-ticketti" />
        </div>
        <Footer />
      </div>
    );

  if (error || !evento)
    return (
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <Container className="py-5">
          <Alert variant="danger">{error || 'Evento no encontrado.'}</Alert>
        </Container>
        <Footer />
      </div>
    );

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="detalle-evento-container">
        <Container>
          <Button
            variant="link"
            onClick={() => navigate(-1)}
            className="mb-4 p-0"
          >
            ← Volver
          </Button>

          <Row>
            <Col md={6}>
              <img
                src={evento.imagenUrl || '/assets/hero.png'}
                alt={evento.nombre}
                className="detalle-evento-imagen"
              />
            </Col>

            <Col md={6} className="mt-4 mt-md-0">
              <Badge bg="info" className="detalle-evento-badge mb-3">
                {evento.genero}
              </Badge>
              <h1 className="detalle-evento-titulo">{evento.nombre}</h1>
              <p className="detalle-evento-descripcion-texto">{evento.descripcion}</p>

              <div className="detalle-evento-info-card">
                <div className="d-flex align-items-center gap-2">
                  <Calendar size={18} className="detalle-evento-info-icono" />
                  <span>{formatearFecha(evento.fecha)}</span>
                </div>
              </div>

              <div className="detalle-evento-info-card">
                <div className="d-flex align-items-center gap-2">
                  <MapPin size={18} className="detalle-evento-info-icono" />
                  <span>
                    {evento.recinto?.nombre} — {evento.recinto?.ubicacion}
                  </span>
                </div>
              </div>

              <div className="detalle-evento-info-card">
                <div className="d-flex align-items-center gap-2">
                  <Users size={18} className="detalle-evento-info-icono" />
                  <span>{evento.stock} entradas disponibles</span>
                </div>
              </div>

              <div className="detalle-evento-precio-card">
                <p className="detalle-evento-precio-etiqueta">Precio por entrada</p>
                <h3 className="detalle-evento-precio-valor">{formatearMoneda(evento.precioEntrada)}</h3>
                <Button
                  size="lg"
                  className="detalle-evento-boton-agregar"
                  onClick={() => setShowModal(true)}
                >
                  <Ticket size={20} className="me-2" />
                  Comprar entrada
                </Button>
                {evento.stock > 0 && (
                  <p className="text-muted small text-center mb-0 mt-3">
                    Quedan {evento.stock} entradas disponibles
                  </p>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </main>

      {/* ── Modal de selección de cantidad ── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Selecciona tu cantidad</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">
            <strong>{evento.nombre}</strong>
            <br />
            Precio: {formatearMoneda(evento.precioEntrada)} por entrada
          </p>
          <Form.Label className="fw-semibold">Cantidad de entradas</Form.Label>
          <Form.Control
            type="number"
            min={1}
            max={4}
            value={cantidad}
            onChange={(e) => {
              const val = Number(e.target.value);
              setCantidad(val);
              setErrorCarrito('');
            }}
            className="mb-3"
          />
          <p className="small text-muted mb-0">
            Maximo 4 entradas por compra.
          </p>
          {errorCarrito && (
            <Alert variant="danger" className="mt-3 mb-0 d-flex align-items-center gap-2">
              <AlertCircle size={16} />
              {errorCarrito}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
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
            {loadingCarrito ? 'Agregando...' : `Agregar ${cantidad} al carrito`}
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
    </div>
  );
};

export default DetalleEvento;
