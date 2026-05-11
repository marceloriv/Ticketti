import { useState, useEffect, useCallback } from 'react';
import { Heart, Building2, Search } from 'lucide-react';
import {
  Container, Row, Col, Form, Button,
  Spinner, Alert, InputGroup,
} from 'react-bootstrap';
import Header from '@components/layout/Header';
import Footer from '@components/layout/Footer';
import ProductCard from '@components/layout/ProductCard';
import CommonCarousel from '@components/common/Carousel';
import api from '@services/api';
import { getCausasActivas, getOrganizaciones } from '@services/donacionesApi';

const BRAND_COLOR = '#5ad4e6';

const CATEGORIAS = [
  { id: 'todo', nombre: 'Todo', generos: [] },
  { id: 'conciertos', nombre: 'Conciertos', generos: ['ROCK','JAZZ','POP','KPOP','METAL','RAP','RNB','INDIE','REGGAETOM'] },
  { id: 'festivales', nombre: 'Festivales Culturales', generos: ['GASTRONOMIA','ARTE','ARTESANIA','FOLCLORE'] },
  { id: 'cinemovil', nombre: 'Cine Móvil', generos: ['TERROR','COMEDIA','DRAMA','ACCION','ROMANCE','PARODIA'] },
];

const HERO_SLIDES = [
  { id: 1, imagen: '/public/img/Tour-Press-Photo-1-28ad2aa10b.webp', titulo: 'Mejores Eventos', subtitulo: 'Descubre los eventos más emocionantes de la ciudad.' },
  { id: 2, imagen: '/public/img/dia_de_la_astronomia.jpg', titulo: 'Experiencias Únicas', subtitulo: 'Vive momentos inolvidables con Ticketti.' },
  { id: 3, imagen: '/public/img/listicle_1686140315148_74ycs_1040x500.jpg', titulo: 'Cultura y Entretenimiento', subtitulo: 'Desde eventos íntimos hasta grandes producciones.' },
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

  //carga eventos
  const cargarEventos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const response = await api.get('/Eventos/listarEventos');
      const datos = response.data || [];
      setEventos(datos);
      setEventosFiltrados(datos);
    } catch {
      setError('No se pudieron cargar los eventos. Intenta más tarde.');
      setEventos([]);
      setEventosFiltrados([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarEventos(); }, [cargarEventos]);

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

  //Filtros por categoría y búsqueda
  useEffect(() => {
    let filtrados = eventos;
    if (categoriaActiva !== 'todo') {
      const cat = CATEGORIAS.find(c => c.id === categoriaActiva);
      filtrados = filtrados.filter(e => cat.generos.includes(e.genero));
    }
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      filtrados = filtrados.filter(e =>
        e.nombre?.toLowerCase().includes(termino) ||
        e.recinto?.ubicacion?.toLowerCase().includes(termino)
      );
    }
    setEventosFiltrados(filtrados);
  }, [categoriaActiva, busqueda, eventos]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />

      <main className="flex-grow-1">

        {/* HERO - Eventos */}
        <section id="hero" className="position-relative">
          <CommonCarousel slides={HERO_SLIDES} brandColor={BRAND_COLOR} />
        </section>

        {/* BUSCADOR — EVENTOS */}
        <section id="buscador" className="py-4 bg-light">
          <Container>
            <Row className="justify-content-center">
              <Col md={8} lg={6}>
                <InputGroup className="mb-3">
                  <InputGroup.Text style={{ backgroundColor:'transparent', borderColor:BRAND_COLOR, color:BRAND_COLOR }}>
                    <Search size={18} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Buscar eventos por nombre, género o ubicación..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    style={{ borderColor: BRAND_COLOR }}
                  />
                </InputGroup>
                <div className="d-flex flex-wrap justify-content-center gap-2">
                  {CATEGORIAS.map(cat => (
                    <Button key={cat.id} size="sm"
                      onClick={() => setCategoriaActiva(cat.id)}
                      className="rounded-pill px-4"
                      style={{
                        borderColor: BRAND_COLOR,
                        backgroundColor: categoriaActiva === cat.id ? BRAND_COLOR : 'transparent',
                        color: categoriaActiva === cat.id ? '#000' : BRAND_COLOR,
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

        {/* EVENTOS  */}
        <section id="eventos" className="py-5">
          <Container>
            <h2 className="text-center mb-4 fw-bold">Eventos Destacados</h2>
            {cargando && <div className="text-center py-5"><Spinner animation="border" style={{ color:BRAND_COLOR }} /></div>}
            {error && <Alert variant="danger" className="text-center">{error}</Alert>}
            {!cargando && !error && eventosFiltrados.length === 0 && (
              <Alert variant="info" className="text-center">No se encontraron eventos.</Alert>
            )}
            {!cargando && !error && eventosFiltrados.length > 0 && (
              <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
                {eventosFiltrados.map(evento => (
                  <Col key={evento.id}>
                    <ProductCard evento={{
                      id: evento.id,
                      imagen: evento.imagenUrl || '/assets/hero.png',
                      titulo: evento.nombre || 'Evento sin nombre',
                      fecha: evento.fecha,
                      ubicacion: evento.recinto?.ubicacion || 'Ubicación por confirmar',
                      precio: evento.precioEntrada || 0,
                    }} />
                  </Col>
                ))}
              </Row>
            )}
          </Container>
        </section>

        {/* CAUSAS SOCIALES */}
        {causas.length > 0 && (
          <section id="causas" className="py-5" style={{ background:'#f8f9fa' }}>
            <Container>
              <div className="d-flex align-items-center gap-2 mb-3">
                <Heart size={28} style={{ color:BRAND_COLOR }} />
                <h2 className="fw-bold mb-0">Apoya una causa</h2>
              </div>
              <p className="text-muted mb-4">Con cada compra, el 10% de tu entrada va directo a la causa que elijas.</p>
              <Row xs={1} sm={2} lg={3} className="g-4">
                {causas.slice(0,6).map(c => (
                  <Col key={c.idCausa}>
                    <div className="p-4 rounded shadow-sm h-100 d-flex flex-column"
                      style={{ background:'#fff', borderLeft:`4px solid ${BRAND_COLOR}`, transition:'transform 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.transform='translateY(-3px)'}
                      onMouseLeave={e => e.currentTarget.style.transform=''}
                    >
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <Heart size={18} style={{ color:BRAND_COLOR }} />
                        <span className="fw-bold">{c.nombre}</span>
                      </div>
                      {c.descripcion && <p className="text-muted small mb-2">{c.descripcion}</p>}
                      {c.organizacion && (
                        <p className="text-muted small mt-auto mb-0">
                          <Building2 size={13} className="me-1" />{c.organizacion.nombre}
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
                <Building2 size={28} style={{ color:BRAND_COLOR }} />
                <h2 className="fw-bold mb-0">Organizaciones aliadas</h2>
              </div>
              <p className="text-muted mb-4">Trabajamos con estas organizaciones para que tu aporte llegue donde más se necesita.</p>
              <Row xs={2} sm={3} lg={4} className="g-3">
                {organizaciones.slice(0,8).map(o => (
                  <Col key={o.idOrganizacion}>
                    <div className="p-3 rounded shadow-sm text-center h-100 d-flex flex-column align-items-center justify-content-center"
                      style={{ background:'#fff', transition:'box-shadow 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow=`0 4px 15px rgba(90,212,230,0.2)`}
                      onMouseLeave={e => e.currentTarget.style.boxShadow=''}
                    >
                      <div style={{ width:44, height:44, borderRadius:'50%', background:`${BRAND_COLOR}20`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:8 }}>
                        <Building2 size={20} style={{ color:BRAND_COLOR }} />
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