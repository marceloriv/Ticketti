import Footer from '@components/layout/Footer';
import Header from '@components/layout/Header';
import { useAuth } from '@hooks/useAuth';
import { useCarrito } from '@hooks/useCarrito';
import api from '@services/api';
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

const DetalleEvento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { agregarEntrada, inicializarCarrito, loading: loadingCarrito } = useCarrito(null);
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

  const manejarAgregarAlCarrito = async () => {
    setErrorCarrito('');
    if (!usuario?.id) {
      navigate('/login');
      return;
    }

    if (cantidad < 1 || cantidad > 4) {
      setErrorCarrito('Debes seleccionar entre 1 y 4 entradas');
      return;
    }

    try {
      // Crear o recuperar carrito activo del usuario
      const { carritoId: idCarrito } = await inicializarCarrito();
      if (!idCarrito) {
        setErrorCarrito('No se pudo crear el carrito. Intenta nuevamente.');
        return;
      }

      // Agregar entrada al carrito
      await agregarEntrada({
        eventoId: Number(id),
        tipoEntrada: 'General',
        cantidad,
        precioUnitario: evento?.precioEntrada || 0,
      });

      setShowModal(false);
      setCantidad(1);

      // Navegar al carrito
      navigate(`/carrito/${idCarrito}`);
    } catch (err) {
      setErrorCarrito(
        err.message || 'Error al agregar entrada al carrito.'
      );
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
      <main className="grow py-5 detalle-evento-main">
        <Container>
          <Button
            variant="link"
            onClick={() => navigate(-1)}
            className="mb-4 p-0"
            className="mb-4 p-0 detalle-evento-text"
          >
            ← Volver
          </Button>

          <Row>
            <Col md={6}>
              <img
                src={evento.imagenUrl || '/assets/hero.png'}
                alt={evento.nombre}
                className="w-100 rounded shadow"
                className="w-100 rounded shadow detalle-evento-image"
              />
            </Col>

            <Col md={6} className="mt-4 mt-md-0">
              <Badge bg="info" className="mb-3">
                {evento.genero}
              </Badge>
              <h1 className="fw-bold mb-3">{evento.nombre}</h1>
              <p className="text-muted mb-4">{evento.descripcion}</p>

              <div className="mb-2 d-flex align-items-center gap-2">
                <Calendar size={18} className="detalle-evento-text" />
                <span>{formatearFecha(evento.fecha)}</span>
              </div>

              <div className="mb-2 d-flex align-items-center gap-2">
                <MapPin size={18} className="detalle-evento-text" />
                <span>
                  {evento.recinto?.nombre} — {evento.recinto?.ubicacion}
                </span>
              </div>

              <div className="mb-2 d-flex align-items-center gap-2">
                <Users size={18} className="detalle-evento-text" />
                <span>{evento.stock} entradas disponibles</span>
              </div>

              <h3 className="fw-bold mb-4">{formatearMoneda(evento.precioEntrada)}</h3>

              <Button
                size="lg"
                className="d-flex align-items-center gap-2 mb-3 btn-ticketti detalle-evento-button"
                onClick={() => setShowModal(true)}
              >
                <Ticket size={20} />
                Comprar entrada
              </Button>

              {evento.stock > 0 && (
                <p className="text-muted small text-center mb-0">
                  Quedan {evento.stock} entradas disponibles
                </p>
              )}
            </Col>
          </Row>
        </Container>
      </main>

      {/* ── Modal de selección de cantidad ── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="detalle-evento-modal-header">
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
