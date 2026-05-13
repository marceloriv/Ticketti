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
} from 'react-bootstrap';
import { Calendar, MapPin, Ticket, Users } from 'lucide-react';
import Header from '@components/layout/Header';
import Footer from '@components/layout/Footer';
import api from '@services/api';

const BRAND_COLOR = '#5ad4e6';

const formatPrice = (price) => {
  if (!price) return 'Gratis';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateString) => {
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
  const [evento, setEvento] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarEvento = async () => {
      try {
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

  if (cargando)
    return (
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <div className="text-center py-5">
          <Spinner animation="border" style={{ color: BRAND_COLOR }} />
        </div>
        <Footer />
      </div>
    );

  if (error)
    return (
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <Container className="py-5">
          <Alert variant="danger">{error}</Alert>
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
            style={{ color: BRAND_COLOR }}
          >
            Inicio
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
                <Calendar size={18} style={{ stroke: BRAND_COLOR }} />
                <span>{formatDate(evento.fecha)}</span>
              </div>

              <div className="mb-2 d-flex align-items-center gap-2">
                <MapPin size={18} style={{ stroke: BRAND_COLOR }} />
                <span>
                  {evento.recinto?.nombre} — {evento.recinto?.ubicacion}
                </span>
              </div>

              <div className="mb-4 d-flex align-items-center gap-2">
                <Users size={18} style={{ stroke: BRAND_COLOR }} />
                <span>{evento.stock} entradas disponibles</span>
              </div>

              <h3 className="fw-bold mb-4">
                {formatPrice(evento.precioEntrada)}
              </h3>

              <Button
                size="lg"
                className="d-flex align-items-center gap-2"
                style={{
                  backgroundColor: BRAND_COLOR,
                  borderColor: BRAND_COLOR,
                  color: '#000',
                }}
              >
                <Ticket size={20} />
                Comprar entrada
              </Button>
            </Col>
          </Row>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default DetalleEvento;
