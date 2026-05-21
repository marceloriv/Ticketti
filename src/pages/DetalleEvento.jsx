import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Badge,
  Button,
  Spinner,
  Alert,
  Modal,
  Form,
} from 'react-bootstrap';
import { Calendar, MapPin, Ticket, Users, AlertCircle } from 'lucide-react';
import Header from '@components/layout/Header';
import Footer from '@components/layout/Footer';
import { useAuth } from '@hooks/useAuth';
import { useCarrito } from '@hooks/useCarrito';
import api from '@services/api';
import { COLOR_MARCA } from '@utils/constantes';

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
          <Spinner animation="border" style={{ color: COLOR_MARCA }} />
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
      <main className="flex-grow-1 py-5">
        <Container>
          <Button
            variant="link"
            onClick={() => navigate(-1)}
            className="mb-4 p-0"
            style={{ color: COLOR_MARCA }}
          >
            ← Volver
          </Button>

          <Row>
            <Col md={6}>
              <img
                src={evento.imagenUrl || '/assets/hero.png'}
                alt={evento.nombre}
                className="w-100 rounded shadow"
                style={{ objectFit: 'cover', maxHeight: '400px' }}
              />
            </Col>

            <Col md={6} className="mt-4 mt-md-0">
              <Badge bg="info" className="mb-3">
                {evento.genero}
              </Badge>
              <h1 className="fw-bold mb-3">{evento.nombre}</h1>
              <p className="text-muted mb-4">{evento.descripcion}</p>

              <div className="mb-2 d-flex align-items-center gap-2">
                <Calendar size={18} style={{ stroke: COLOR_MARCA }} />
                <span>{formatearFecha(evento.fecha)}</span>
              </div>

              <div className="mb-2 d-flex align-items-center gap-2">
                <MapPin size={18} style={{ stroke: COLOR_MARCA }} />
                <span>
                  {evento.recinto?.nombre} — {evento.recinto?.ubicacion}
                </span>
              </div>

              <div className="mb-2 d-flex align-items-center gap-2">
                <Users size={18} style={{ stroke: COLOR_MARCA }} />
                <span>{evento.stock} entradas disponibles</span>
              </div>

              <h3 className="fw-bold mb-4">{formatearMoneda(evento.precioEntrada)}</h3>

              <Button
                size="lg"
                className="d-flex align-items-center gap-2 mb-3"
                style={{
                  backgroundColor: COLOR_MARCA,
                  borderColor: COLOR_MARCA,
                  color: '#000',
                  width: '100%',
                  justifyContent: 'center',
                }}
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
        <Modal.Header closeButton style={{ borderBottomColor: COLOR_MARCA }}>
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
            style={{ backgroundColor: COLOR_MARCA, borderColor: COLOR_MARCA }}
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
