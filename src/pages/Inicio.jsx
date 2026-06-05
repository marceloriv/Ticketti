import CommonCarousel from '@components/common/Carousel';
import ProductCard from '@components/common/ProductCard';
import Footer from '@components/layout/Footer';
import Header from '@components/layout/Header';
import api from '@services/api';
import { getCausasActivas, getOrganizaciones } from '@services/donacionesApi';
import { Building2, Heart, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useCarrito } from '@hooks/useCarrito';
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Spinner,
} from 'react-bootstrap';

const CATEGORIAS = [
  { id: 'todo', nombre: 'Todo', generos: [] },
  { id: 'conciertos', nombre: 'Conciertos', generos: ['ROCK', 'JAZZ', 'POP', 'KPOP', 'METAL', 'RAP', 'RNB', 'INDIE', 'REGGAETOM'] },
  { id: 'festivales', nombre: 'Festivales Culturales', generos: ['GASTRONOMIA', 'ARTE', 'ARTESANIA', 'FOLCLORE'] },
  { id: 'cinemovil', nombre: 'Cine Móvil', generos: ['TERROR', 'COMEDIA', 'DRAMA', 'ACCION', 'ROMANCE', 'PARODIA'] },
];

const HERO_SLIDES = [
  {
    id: 1,
    imagen: '/img/Tour-Press-Photo-1-28ad2aa10b.webp',
    titulo: 'Mejores Eventos',
    subtitulo: 'Descubre los eventos más emocionantes de la ciudad.',
  },
  {
    id: 2,
    imagen: '/img/dia_de_la_astronomia.jpg',
    titulo: 'Experiencias únicas',
    subtitulo: 'Vive momentos inolvidables con Ticketti.',
  },
  {
    id: 3,
    imagen: '/img/listicle_1686140315148_74ycs_1040x500.jpg',
    titulo: 'Cultura y Entretenimiento',
    subtitulo: 'Desde eventos íntimos hasta grandes producciones.',
  },
];

const Inicio = () => {
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('todo');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  //Causas y organizaciones
  const [causas, setCausas] = useState([]);
  const [organizaciones, setOrganizaciones] = useState([]);

  // Carrito
  const { inicializarCarrito, agregarEntrada } = useCarrito(null);
  const [message, setMessage] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);

  //carga eventos
  const cargarEventos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const response = await api.get('/eventos/listarEventos');
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

  // Carga causas y organizaciones
  useEffect(() => {
    const cargarCausas = async () => {
      try {
        const [causasData, orgsData] = await Promise.all([
          getCausasActivas(),
          getOrganizaciones(),
        ]);
        setCausas(causasData);
        setOrganizaciones(orgsData);
      } catch {
        setCausas([]);
        setOrganizaciones([]);
      }
    };
    cargarCausas();
  }, []);

  const handleAddToCart = async (evento) => {
    if (addingToCart) return;
    setAddingToCart(true);
    try {
      const { carritoId } = await inicializarCarrito();
      if (!carritoId) throw new Error('No se pudo obtener el carrito');
      await agregarEntrada({
        eventoId: evento.id,
        tipoEntrada: 'General',
        cantidad: 1,
        precioUnitario: evento.precioEntrada || 0,
      });
      setMessage(`Entrada agregada al carrito: ${evento.nombre}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error al agregar al carrito: ' + err.message);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setAddingToCart(false);
    }
  };

  //Filtros por categoría y búsqueda
  useEffect(() => {
    let filtrados = eventos;

    if (categoriaActiva !== 'todo') {
      const categoriaSeleccionada = CATEGORIAS.find(c => c.id === categoriaActiva);
      filtrados = filtrados.filter(evento =>
        categoriaSeleccionada.generos.includes(evento.genero)
      );
    }

    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      filtrados = filtrados.filter(evento =>
        evento.nombre?.toLowerCase().includes(termino) ||
        evento.recinto?.ubicacion?.toLowerCase().includes(termino)
      );
    }

    setEventosFiltrados(filtrados);
  }, [categoriaActiva, busqueda, eventos]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="grow">
        {message && (
          <Alert variant={message.startsWith('Error') ? 'danger' : 'success'}>
            {message}
          </Alert>
        )}
        {/* HERO - Eventos */}
        <section id="hero" className="position-relative">
          <CommonCarousel slides={HERO_SLIDES} />
        </section>

        {/* BUSCADOR - EVENTOS */}
        <section id="buscador" className="py-4 bg-light">
          <Container>
            <Row className="justify-content-center">
              <Col md={8} lg={6}>
                <InputGroup className="mb-3">
                  <InputGroup.Text className="inicio-search-icon">
                    <Search size={18} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Buscar eventos por nombre, género o ubicación..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="inicio-search-input"
                  />
                </InputGroup>
                <div className="d-flex flex-wrap justify-content-center gap-2">
                  {CATEGORIAS.map((cat) => (
                    <Button
                      key={cat.id}
                      size="sm"
                      onClick={() => setCategoriaActiva(cat.id)}
                      className={`rounded-pill px-4 inicio-categoria-button ${
                        categoriaActiva === cat.id ? 'active' : ''
                      }`}
                    >
                      {cat.nombre}
                    </Button>
                  ))}
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* EVENTOS  */}
        <section id="eventos" className="py-5">
          <Container>
            <h2 className="text-center mb-4 fw-bold">Eventos Destacados</h2>
            {cargando && (
              <div className="text-center py-5">
                <Spinner animation="border" className="spinner-ticketti" />
              </div>
            )}
            {error && (
              <Alert variant="danger" className="text-center">
                {error}
              </Alert>
            )}
            {!cargando && !error && eventosFiltrados.length === 0 && (
              <Alert variant="info" className="text-center">
                No se encontraron eventos.
              </Alert>
            )}
            {!cargando && !error && eventosFiltrados.length > 0 && (
              <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
                {eventosFiltrados.map((evento) => (
                  <Col key={evento.id}>
                    <ProductCard
                      evento={{
                        id: evento.id,
                        imagen: evento.imagenUrl || '/assets/hero.png',
                        titulo: evento.nombre || 'Evento sin nombre',
                        fecha: evento.fecha,
                        ubicacion: evento.recinto?.ubicacion || 'Ubicación por confirmar',
                        precio: evento.precioEntrada || 0,
                      }}
                      onComprar={(id) => handleAddToCart(evento)}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </Container>
        </section>

        {/* CAUSAS SOCIALES */}
        {causas.length > 0 && (
          <section id="causas" className="py-5 inicio-causas-section">
            <Container>
              <div className="d-flex align-items-center gap-2 mb-3">
                <Heart size={28} className="text-ticketti" />
                <h2 className="fw-bold mb-0">Apoya una causa</h2>
              </div>
              <p className="text-muted mb-4">
                Con cada compra, el 10% de tu entrada va directo a la causa que
                elijas.
              </p>
              <Row xs={1} sm={2} lg={3} className="g-4">
                {causas.slice(0, 6).map((c) => (
                  <Col key={c.idCausa}>
                    <div className="p-4 rounded shadow-sm h-100 d-flex flex-column inicio-causa-card">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <Heart size={18} className="text-ticketti" />
                        <span className="fw-bold">{c.nombre}</span>
                      </div>
                      {c.descripcion && (
                        <p className="text-muted small mb-2">{c.descripcion}</p>
                      )}
                      {c.organizacion && (
                        <p className="text-muted small mt-auto mb-0">
                          <Building2 size={13} className="me-1" />
                          {c.organizacion.nombre}
                        </p>
                      )}
                    </div>
                  </Col>
                ))}
              </Row>
            </Container>
          </section>
        )}

        {/* ORGANIZACIONES */}
        {organizaciones.length > 0 && (
          <section id="organizaciones" className="py-5">
            <Container>
              <div className="d-flex align-items-center gap-2 mb-3">
                <Building2 size={28} className="text-ticketti" />
                <h2 className="fw-bold mb-0">Organizaciones aliadas</h2>
              </div>
              <p className="text-muted mb-4">
                Trabajamos con estas organizaciones para que tu aporte llegue
                donde más se necesita.
              </p>
              <Row xs={2} sm={3} lg={4} className="g-3">
                {organizaciones.slice(0, 8).map((o) => (
                  <Col key={o.idOrganizacion}>
                    <div className="p-3 rounded shadow-sm text-center h-100 d-flex flex-column align-items-center justify-content-center inicio-org-card">
                      <div className="inicio-org-icon">
                        <Building2 size={20} className="text-ticketti" />
                      </div>
                      <p className="fw-semibold small mb-0">{o.nombre}</p>
                    </div>
                  </Col>
                ))}
              </Row>
            </Container>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Inicio;

