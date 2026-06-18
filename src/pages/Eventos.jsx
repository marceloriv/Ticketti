import api from '@api/api';
import ProductCard from '@components/common/ProductCard';
import Footer from '@components/layout/Footer';
import Header from '@components/layout/Header';
import { useAuth } from '@hooks/useAuth';
import { useCarrito } from '@hooks/useCarrito';
import { useCarritoGuest } from '@hooks/useCarritoGuest';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Col, Container, Row, Spinner } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';

const CATEGORIAS = [
  { id: 'todo', nombre: 'Todo', generos: [] },
  {
    id: 'conciertos',
    nombre: 'Conciertos',
    generos: [
      'ROCK',
      'JAZZ',
      'POP',
      'KPOP',
      'METAL',
      'RAP',
      'RNB',
      'INDIE',
      'REGGAETON',
    ],
  },
  {
    id: 'festivales',
    nombre: 'Festivales Culturales',
    generos: ['GASTRONOMIA', 'ARTE', 'ARTESANIA', 'FOLCLORE'],
  },
  {
    id: 'cinemovil',
    nombre: 'Cine Móvil',
    generos: ['TERROR', 'COMEDIA', 'DRAMA', 'ACCION', 'ROMANCE', 'PARODIA'],
  },
];

const Eventos = () => {
  const { establecerCarritoId, isAuthenticated } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('todo');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [carritoId, setCarritoId] = useState(null);
  const { inicializarCarrito, agregarEntrada } = useCarrito(carritoId);
  const { agregarEntrada: guestAgregarEntrada } = useCarritoGuest();

  const [searchParams] = useSearchParams();

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
      setError('No se pudieron cargar los eventos. Por favor, intenta más tarde.');
      setEventos([]);
      setEventosFiltrados([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  // aplicar categoria desde query string
  useEffect(() => {
    const cat = searchParams.get('categoria');
    if (cat) setCategoriaActiva(cat);
  }, [searchParams]);

  useEffect(() => {
    let filtrados = eventos;

    if (categoriaActiva !== 'todo') {
      const categoriaSeleccionada = CATEGORIAS.find((c) => c.id === categoriaActiva);
      if (categoriaSeleccionada) {
        filtrados = filtrados.filter((evento) => categoriaSeleccionada.generos.includes(evento.genero));
      }
    }

    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      filtrados = filtrados.filter(
        (evento) =>
          evento.nombre?.toLowerCase().includes(termino) ||
          evento.recinto?.ubicacion?.toLowerCase().includes(termino)
      );
    }

    setEventosFiltrados(filtrados);
  }, [categoriaActiva, busqueda, eventos]);

  const handleAddToCart = async (evento) => {
    try {
      if (isAuthenticated) {
        const { carritoId: newCarritoId } = await inicializarCarrito();
        if (!newCarritoId) throw new Error('No se pudo obtener el carrito');
        setCarritoId(newCarritoId);
        establecerCarritoId(newCarritoId);
        await agregarEntrada({ eventoId: evento.id, tipoEntrada: 'General', cantidad: 1, precioUnitario: evento.precioEntrada || 0 }, newCarritoId);
      } else {
        guestAgregarEntrada({ eventoId: evento.id, eventoNombre: evento.nombre, imagenUrl: evento.imagenUrl, tipoEntrada: 'General', cantidad: 1, precioUnitario: evento.precioEntrada || 0 });
      }
    } catch (err) {
      console.error('Error agregando al carrito', err);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="grow">
        <section className="py-5">
          <Container>
            <h2 className="text-center mb-4 fw-bold">Eventos</h2>
            {cargando && (
              <div className="text-center py-5">
                <Spinner animation="border" className="spinner-ticketti" />
              </div>
            )}
            {error && (
              <Alert variant="danger" className="text-center">{error}</Alert>
            )}

            {!cargando && !error && eventosFiltrados.length === 0 && (
              <Alert variant="info" className="text-center">No se encontraron eventos.</Alert>
            )}

            {!cargando && !error && eventosFiltrados.length > 0 && (
              <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
                {eventosFiltrados.map((evento) => (
                  <Col key={evento.id}>
                    <ProductCard
                      evento={{ id: evento.id, imagen: evento.imagenUrl || '/assets/hero.png', titulo: evento.nombre || 'Evento sin nombre', fecha: evento.fecha, ubicacion: evento.recinto?.ubicacion || 'Ubicación por confirmar', precio: evento.precioEntrada || 0 }}
                      onComprar={() => handleAddToCart(evento)}
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

export default Eventos;
