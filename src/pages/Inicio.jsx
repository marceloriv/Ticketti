import api from '@api/api';
import { getCausasActivas, getOrganizacionesActivas } from '@api/donacionesApi';
import CommonCarousel from '@components/common/Carousel';
import ProductCard from '@components/common/ProductCard';
import CategoryCard from '@components/common/CategoryCard';
import { useNavigate } from 'react-router-dom';
import Footer from '@components/layout/Footer';
import Header from '@components/layout/Header';
import { useAuth } from '@hooks/useAuth';
import { useCarrito } from '@hooks/useCarrito';
import { useCarritoGuest } from '@hooks/useCarritoGuest';
import logger from '@utils/logger';
import { Building2, Heart, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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
  { id: 'todo', nombre: 'Todo' },
  {
    id: 'conciertos',
    nombre: 'Conciertos',
    descripcion: 'Vive grandes shows musicales en vivo con tus artistas favoritos.',
  },
  {
    id: 'festivales',
    nombre: 'Festivales Culturales',
    descripcion: 'Descubre tradiciones, arte y sabor en festivales para toda la familia.',
  },
  {
    id: 'cinemovil',
    nombre: 'Cine Móvil',
    descripcion: 'Disfruta de cine al aire libre en lugares emblemáticos de la ciudad.',
  },
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
  const navigate = useNavigate();
  const { establecerCarritoId, isAuthenticated } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  //Causas y organizaciones
  const [causas, setCausas] = useState([]);
  const [organizaciones, setOrganizaciones] = useState([]);

  // Carrito
  const [carritoId, setCarritoId] = useState(null);
  const { inicializarCarrito, agregarEntrada } = useCarrito(carritoId);
  const { agregarEntrada: guestAgregarEntrada } = useCarritoGuest();
  const [message, setMessage] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);

  /**
   * Carga los eventos desde la API
   */
  const cargarEventos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const response = await api.get('/eventos/listarEventos');
      const datos = response.data || [];
      setEventos(datos);
    } catch (err) {
      logger.error('Error al cargar eventos:', err);
      setError(
        'No se pudieron cargar los eventos. Por favor, intenta más tarde.'
      );
      setEventos([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  /**
   * Carga las causas sociales y organizaciones
   */
  useEffect(() => {
    const cargarCausas = async () => {
      try {
        const [causasData, orgsData] = await Promise.all([
          getCausasActivas(),
          getOrganizacionesActivas(),
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

  /**
   * Maneja el proceso de agregar una entrada al carrito desde la página de inicio
   * Para usuarios invitados, usa localStorage
   * Para usuarios autenticados, usa el backend
   *
   * @param {Object} evento - Objeto con los datos del evento
   * @returns {Promise<void>} Promesa que se resuelve cuando se agrega la entrada
   */
  const handleAddToCart = async (evento) => {
    if (addingToCart) return;
    setAddingToCart(true);
    try {
      if (isAuthenticated) {
        // Usuario autenticado: intentar usar backend con fallback a carrito de invitado
        try {
          const { carritoId: newCarritoId } = await inicializarCarrito();
          if (!newCarritoId) throw new Error('No se pudo obtener el carrito');
          setCarritoId(newCarritoId);
          establecerCarritoId(newCarritoId);
          await agregarEntrada(
            {
              eventoId: evento.id,
              tipoEntrada: 'General',
              cantidad: 1,
              precioUnitario: evento.precioEntrada || 0,
            },
            newCarritoId
          );
        } catch (backendError) {
          // Fallback: usar carrito de invitado si el backend falla
          logger.warn(
            'Backend falló, usando carrito de invitado como fallback:',
            backendError
          );
          guestAgregarEntrada({
            eventoId: evento.id,
            eventoNombre: evento.nombre,
            imagenUrl: evento.imagenUrl,
            tipoEntrada: 'General',
            cantidad: 1,
            precioUnitario: evento.precioEntrada || 0,
          });
        }
      } else {
        // Usuario invitado: usar localStorage
        guestAgregarEntrada({
          eventoId: evento.id,
          eventoNombre: evento.nombre,
          imagenUrl: evento.imagenUrl,
          tipoEntrada: 'General',
          cantidad: 1,
          precioUnitario: evento.precioEntrada || 0,
        });
      }
      setMessage(`Entrada agregada al carrito: ${evento.nombre}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error al agregar al carrito: ' + err.message);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setAddingToCart(false);
    }
  };

  // Nota: el filtrado principal ahora se maneja en la página /eventos.

  const getCategoryImage = (id) => {
    switch (id) {
      case 'festivales':
        return '/img/categoriafolk.png';
      case 'cinemovil':
        return '/img/categoriaautocine.jpg';
      case 'conciertos':
        return '/img/categoriaconcierto.webp';
      default:
        return '/img/default-cat.jpg';
    }
  };

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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        navigate(`/eventos?search=${encodeURIComponent(busqueda)}`);
                      }
                    }}
                    className="inicio-search-input"
                  />
                </InputGroup>
              </Col>
            </Row>
          </Container>
        </section>

        {/* CATEGORÍAS - CARDS */}
        <section id="categorias-eventos" className="py-5 bg-white">
          <Container>
            <h2 className="text-center mb-4 fw-bold">Explora por Categoría</h2>
            <Row className="g-4">
              {CATEGORIAS.filter((c) => c.id !== 'todo').map((cat) => (
                <Col key={cat.id} md={4}>
                  <CategoryCard
                    title={cat.nombre}
                    imgSrc={getCategoryImage(cat.id)}
                    description={cat.descripcion}
                    onClick={() => navigate(`/eventos?categoria=${encodeURIComponent(cat.id)}`)}
                  />
                </Col>
              ))}
            </Row>
          </Container>
        </section>
        {/* EVENTOS DESTACADOS (solo muestra primeros 6) */}
        <section id="eventos" className="py-5">
          <Container>
            <h2 className="text-center mb-4 fw-bold">Eventos Destacados</h2>
            {cargando && (
              <div className="text-center py-5">
                <Spinner animation="border" className="spinner-ticketti" />
              </div>
            )}
            {error && (
              <Alert variant="danger" className="text-center">{error}</Alert>
            )}

            {!cargando && !error && eventos.length === 0 && (
              <Alert variant="info" className="text-center">No se encontraron eventos.</Alert>
            )}

            {!cargando && !error && eventos.length > 0 && (
              <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
                {eventos.slice(0, 6).map((evento) => (
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
                      onComprar={() => handleAddToCart(evento)}
                    />
                  </Col>
                ))}
              </Row>
            )}
            <div className="text-center mt-4">
              <Button variant="outline-primary" onClick={() => navigate('/eventos')}>Ver todos los eventos</Button>
            </div>
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
