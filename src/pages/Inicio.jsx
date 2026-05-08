import { useState, useEffect, useCallback } from 'react';


import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Spinner,
  Alert,
  InputGroup,
} from 'react-bootstrap';
import { Search, Calendar, MapPin } from 'lucide-react';
import Header from '@components/layout/Header';
import Footer from '@components/layout/Footer';
import ProductCard from '@components/layout/ProductCard';
import CommonCarousel from '@components/common/Carousel';
import api from '@services/api';

const BRAND_COLOR = '#5ad4e6';

const CATEGORIAS = [
  { id: 'todo', nombre: 'Todo' },
  { id: 'conciertos', nombre: 'Conciertos' },
  { id: 'festivales', nombre: 'Festivales' },
  { id: 'teatro', nombre: 'Teatro' },
  { id: 'deportes', nombre: 'Deportes' },
];

const HERO_SLIDES = [
  {
    id: 1,
    imagen: '/public/img/Tour-Press-Photo-1-28ad2aa10b.webp',
    titulo: 'Mejores Eventos',
    subtitulo:
      'Descubre los eventos más emocionantes de la ciudad. Conciertos, festivales, teatro y mucho más te esperan.',
  },
  {
    id: 2,
    imagen: '/public/img/dia_de_la_astronomia.jpg',
    titulo: 'Experiencias Únicas',
    subtitulo:
      'Vive momentos inolvidables con Ticketti. Encuentra tus eventos favoritos y asegura tus entradas.',
  },
  {
    id: 3,
    imagen: '/public/img/listicle_1686140315148_74ycs_1040x500.jpg',
    titulo: 'Cultura y Entretenimiento',
    subtitulo:
      'Desde eventos íntimos hasta grandes producciones, tenemos algo para todos los gustos.',
  },
];

const Inicio = () => {
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('todo');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarEventos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const response = await api.get('/Eventos/listarEventos');
      const datos = response.data || [];
      setEventos(datos);
      setEventosFiltrados(datos);
    } catch (err) {
      console.error('Error al cargar eventos:', err);
      setError(
        'No se pudieron cargar los eventos. Por favor, intenta más tarde.',
      );
      setEventos([]);
      setEventosFiltrados([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  useEffect(() => {
    let filtrados = eventos;

    if (categoriaActiva !== 'todo') {
      filtrados = filtrados.filter(
        (evento) =>
          evento.categoria?.toLowerCase() === categoriaActiva.toLowerCase(),
      );
    }

    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      filtrados = filtrados.filter(
        (evento) =>
          evento.nombre?.toLowerCase().includes(termino) ||
          evento.artista?.toLowerCase().includes(termino) ||
          evento.ubicacion?.toLowerCase().includes(termino),
      );
    }

    setEventosFiltrados(filtrados);
  }, [categoriaActiva, busqueda, eventos]);

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
  };

  const handleCategoriaClick = (categoriaId) => {
    setCategoriaActiva(categoriaId);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />

      <main className="flex-grow-1">
        <section id="hero" className="position-relative">
          <CommonCarousel slides={HERO_SLIDES} brandColor={BRAND_COLOR} />
        </section>

        <section id="buscador" className="py-4 bg-light">
          <Container>
            <Row className="justify-content-center">
              <Col md={8} lg={6}>
                <InputGroup className="mb-3">
                  <InputGroup.Text
                    style={{
                      backgroundColor: 'transparent',
                      borderColor: BRAND_COLOR,
                      color: BRAND_COLOR,
                    }}
                  >
                    <Search size={18} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Buscar eventos por nombre, artista o ubicación..."
                    value={busqueda}
                    onChange={handleBusquedaChange}
                    className="shadow-sm"
                    style={{
                      borderColor: BRAND_COLOR,
                    }}
                  />
                </InputGroup>

                <div className="d-flex flex-wrap justify-content-center gap-2">
                  {CATEGORIAS.map((cat) => (
                    <Button
                      key={cat.id}
                      variant={
                        categoriaActiva === cat.id
                          ? 'primary'
                          : 'outline-primary'
                      }
                      size="sm"
                      onClick={() => handleCategoriaClick(cat.id)}
                      className="rounded-pill px-4"
                      style={{
                        borderColor: BRAND_COLOR,
                        backgroundColor:
                          categoriaActiva === cat.id
                            ? BRAND_COLOR
                            : 'transparent',
                        color:
                          categoriaActiva === cat.id ? '#000' : BRAND_COLOR,
                        '--bs-btn-hover-bg': BRAND_COLOR,
                        '--bs-btn-hover-color': '#000',
                        '--bs-btn-hover-border-color': BRAND_COLOR,
                        outline:
                          categoriaActiva === cat.id
                            ? `2px solid ${BRAND_COLOR}`
                            : 'none',
                        outlineOffset: '2px',
                      }}
                    >
                      {cat.nombre}
                    </Button>
                  ))}
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        <section id="eventos" className="py-5">
          <Container>
            <h2 className="text-center mb-4 fw-bold">Eventos Destacados</h2>

            {cargando && (
              <div className="text-center py-5">
                <Spinner
                  animation="border"
                  role="status"
                  style={{ color: BRAND_COLOR }}
                >
                  <span className="visually-hidden">Cargando...</span>
                </Spinner>
                <p className="mt-2 text-muted">Cargando eventos...</p>
              </div>
            )}

            {error && (
              <Alert variant="danger" className="text-center">
                {error}
              </Alert>
            )}

            {!cargando && !error && eventosFiltrados.length === 0 && (
              <Alert variant="info" className="text-center">
                No se encontraron eventos con los filtros aplicados.
              </Alert>
            )}

            {!cargando && !error && eventosFiltrados.length > 0 && (
              <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
                {eventosFiltrados.map((evento) => (
                  <Col key={evento.id}>
                    <ProductCard
                      evento={{
                        id: evento.id,
                        imagen: evento.imagen || '/assets/hero.png',
                        titulo: evento.nombre || 'Evento sin nombre',
                        fecha: evento.fecha,
                        ubicacion:
                          evento.ubicacion || 'Ubicación por confirmar',
                        precio: evento.precio || 0,
                      }}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Inicio;
