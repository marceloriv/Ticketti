import api from '@api/api';
import ProductCard from '@components/common/ProductCard';
import Footer from '@components/layout/Footer';
import Header from '@components/layout/Header';
import logger from '@utils/logger';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Col, Container, Row, Form, Button, Offcanvas, Accordion } from 'react-bootstrap';
import { Search, SlidersHorizontal, Tickets } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import '@styles/components/Eventos.css';

const CATEGORIAS = [
  { id: 'todo', nombre: 'Todo', generos: [] },
  {
    id: 'conciertos',
    nombre: 'Conciertos',
    generos: ['ROCK', 'JAZZ', 'POP', 'KPOP', 'METAL', 'RAP', 'RNB', 'INDIE', 'REGGAETON'],
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

const GENEROS_POR_CATEGORIA = CATEGORIAS.filter((c) => c.id !== 'todo');

const RANGOS_POR_CATEGORIA = {
  cinemovil: [
    { key: 'cm1', label: 'Hasta $10.000', min: 0, max: 10000 },
    { key: 'cm2', label: '$10.000 - $20.000', min: 10000, max: 20000 },
  ],
  festivales: [
    { key: 'fc1', label: 'Hasta $20.000', min: 0, max: 20000 },
    { key: 'fc2', label: '$20.000 - $35.000', min: 20000, max: 35000 },
    { key: 'fc3', label: '$35.000 - $50.000', min: 35000, max: 50000 },
  ],
  conciertos: [
    { key: 'cc1', label: 'Hasta $50.000', min: 0, max: 50000 },
    { key: 'cc2', label: '$50.000 - $150.000', min: 50000, max: 150000 },
    { key: 'cc3', label: '$150.000 - $300.000', min: 150000, max: 300000 },
    { key: 'cc4', label: '$300.000 - $600.000', min: 300000, max: 600000 },
  ],
};

const SkeletonCard = () => (
  <div className="eventos-skeleton">
    <div className="eventos-skeleton__media" />
    <div className="eventos-skeleton__body">
      <div className="eventos-skeleton__line eventos-skeleton__line--short" />
      <div className="eventos-skeleton__line eventos-skeleton__line--medium" />
      <div className="eventos-skeleton__line" />
    </div>
  </div>
);

const Eventos = () => {
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('todo');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [generosSeleccionados, setGenerosSeleccionados] = useState([]);
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [rangoRapido, setRangoRapido] = useState(null);
  const [mostrarFiltrosMobile, setMostrarFiltrosMobile] = useState(false);

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
      logger.error('Error al cargar eventos:', err);
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

  useEffect(() => {
    const cat = searchParams.get('categoria');
    if (cat) setCategoriaActiva(cat);
    const search = searchParams.get('search');
    if (search) setBusqueda(search);
  }, [searchParams]);

  useEffect(() => {
    let filtrados = eventos;

    if (categoriaActiva !== 'todo') {
      const categoriaSeleccionada = CATEGORIAS.find((c) => c.id === categoriaActiva);
      if (categoriaSeleccionada) {
        filtrados = filtrados.filter((evento) => categoriaSeleccionada.generos.includes(evento.genero));
      }
    }

    if (generosSeleccionados.length > 0) {
      filtrados = filtrados.filter((evento) => generosSeleccionados.includes(evento.genero));
    }

    if (precioMin) {
      filtrados = filtrados.filter((evento) => (evento.precioEntrada || 0) >= Number(precioMin));
    }
    if (precioMax) {
      filtrados = filtrados.filter((evento) => (evento.precioEntrada || 0) <= Number(precioMax));
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
  }, [categoriaActiva, busqueda, eventos, generosSeleccionados, precioMin, precioMax]);

  const toggleGenero = (genero) => {
    setGenerosSeleccionados((prev) =>
      prev.includes(genero) ? prev.filter((g) => g !== genero) : [...prev, genero]
    );
  };

  const aplicarRangoRapido = (min, max, key) => {
    setPrecioMin(min);
    setPrecioMax(max ?? '');
    setRangoRapido(key);
  };

  const limpiarFiltros = () => {
    setGenerosSeleccionados([]);
    setPrecioMin('');
    setPrecioMax('');
    setRangoRapido(null);
  };

  const totalFiltrosActivos =
    generosSeleccionados.length + (precioMin ? 1 : 0) + (precioMax ? 1 : 0);

  const acordeonPorDefecto = categoriaActiva !== 'todo' ? categoriaActiva : null;

  const ContenidoFiltros = () => (
    <>
      <div className="eventos-sidebar__header">
        <h6 className="eventos-sidebar__title">Filtros</h6>
        {totalFiltrosActivos > 0 && (
          <button className="eventos-sidebar__clear" onClick={limpiarFiltros}>
            Limpiar ({totalFiltrosActivos})
          </button>
        )}
      </div>

      <hr className="eventos-sidebar__divider" />

      <Accordion defaultActiveKey={acordeonPorDefecto} alwaysOpen flush>
        {GENEROS_POR_CATEGORIA.map((cat) => (
          <Accordion.Item key={cat.id} eventKey={cat.id}>
            <Accordion.Header>{cat.nombre}</Accordion.Header>
            <Accordion.Body>
              {cat.generos.map((genero) => (
                <Form.Check
                  key={genero}
                  type="checkbox"
                  id={`genero-${genero}`}
                  label={genero}
                  checked={generosSeleccionados.includes(genero)}
                  onChange={() => toggleGenero(genero)}
                  className="eventos-check"
                />
              ))}

              {RANGOS_POR_CATEGORIA[cat.id] && (
                <>
                  <p className="eventos-price-label">Precio</p>
                  {RANGOS_POR_CATEGORIA[cat.id].map((rango) => (
                    <Form.Check
                      key={rango.key}
                      type="radio"
                      id={`rango-${rango.key}`}
                      name="rango-precio"
                      label={rango.label}
                      checked={rangoRapido === rango.key}
                      onChange={() => aplicarRangoRapido(rango.min, rango.max, rango.key)}
                      className="eventos-check"
                    />
                  ))}
                </>
              )}
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>

      <hr className="eventos-sidebar__divider" />

      <div className="eventos-price-manual">
        <p className="eventos-price-manual__label">Precio personalizado</p>
        <Row className="g-2">
          <Col xs={6}>
            <Form.Control
              type="number"
              placeholder="$ Min"
              size="sm"
              value={precioMin}
              onChange={(e) => { setPrecioMin(e.target.value); setRangoRapido(null); }}
            />
          </Col>
          <Col xs={6}>
            <Form.Control
              type="number"
              placeholder="$ Max"
              size="sm"
              value={precioMax}
              onChange={(e) => { setPrecioMax(e.target.value); setRangoRapido(null); }}
            />
          </Col>
        </Row>
      </div>
    </>
  );

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="grow">
        <section className="eventos-hero text-center">
          <div className="eventos-hero__pattern" />
          <Container>
            <h1 className="eventos-hero__title">Eventos</h1>
            <p className="eventos-hero__subtitle">
              Descubre conciertos, festivales culturales y cine móvil. Encuentra tu próxima experiencia inolvidable.
            </p>
            <div className="eventos-hero__search">
              <div className="input-group">
                <span className="input-group-text">
                  <Search size={18} />
                </span>
                <Form.Control
                  type="text"
                  placeholder="Buscar eventos por nombre o ubicación..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
          </Container>
        </section>

        <section className="py-5">
          <Container>
            <div className="d-lg-none mb-3">
              <Button
                className="eventos-mobile-filter-btn d-flex align-items-center gap-2"
                onClick={() => setMostrarFiltrosMobile(true)}
              >
                <SlidersHorizontal size={16} />
                Filtrar
                {totalFiltrosActivos > 0 && <span className="badge">{totalFiltrosActivos}</span>}
              </Button>
            </div>

            <Row>
              <Col lg={3} className="d-none d-lg-block">
                <div className="eventos-sidebar p-0">
                  <ContenidoFiltros />
                </div>
              </Col>

              <Col lg={9}>
                {!cargando && !error && (
                  <div className="eventos-stats">
                    <span className="eventos-stats__count">
                      <strong>{eventosFiltrados.length}</strong>{' '}
                      {eventosFiltrados.length === 1 ? 'evento encontrado' : 'eventos encontrados'}
                    </span>
                  </div>
                )}

                {cargando && (
                  <Row xs={1} sm={2} xl={3} className="g-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Col key={i}>
                        <SkeletonCard />
                      </Col>
                    ))}
                  </Row>
                )}

                {error && <Alert variant="danger" className="text-center">{error}</Alert>}

                {!cargando && !error && eventosFiltrados.length === 0 && (
                  <div className="eventos-empty">
                    <div className="eventos-empty__icon">
                      <Tickets size={32} />
                    </div>
                    <h3 className="eventos-empty__title">No se encontraron eventos</h3>
                    <p className="eventos-empty__text">
                      Intenta ajustar los filtros o cambiar tu búsqueda para descubrir más eventos.
                    </p>
                    <Button className="btn-ticketti" onClick={() => { limpiarFiltros(); setBusqueda(''); }}>
                      Limpiar filtros
                    </Button>
                  </div>
                )}

                {!cargando && !error && eventosFiltrados.length > 0 && (
                  <Row xs={1} sm={2} xl={3} className="g-4">
                    {eventosFiltrados.map((evento) => (
                      <Col key={evento.id} className="eventos-card-wrapper">
                        <ProductCard
                          evento={{
                            id: evento.id,
                            imagen: evento.imagenUrl || '/img/mascota1.png',
                            titulo: evento.nombre || 'Evento sin nombre',
                            fecha: evento.fecha,
                            ubicacion: evento.recinto?.ubicacion || 'Ubicación por confirmar',
                            precio: evento.precioEntrada || 0,
                          }}
                        />
                      </Col>
                    ))}
                  </Row>
                )}
              </Col>
            </Row>
          </Container>
        </section>
      </main>
      <Footer />

      <Offcanvas
        show={mostrarFiltrosMobile}
        onHide={() => setMostrarFiltrosMobile(false)}
        placement="start"
        className="eventos-offcanvas"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Filtros</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <ContenidoFiltros />
          <div className="p-3">
            <button className="eventos-offcanvas__apply" onClick={() => setMostrarFiltrosMobile(false)}>
              Aplicar filtros
            </button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default Eventos;
