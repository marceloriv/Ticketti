import Footer from '@components/layout/Footer';
import Header from '@components/layout/Header';
import { useAuth } from '@hooks/useAuth';
import logger from '@utils/logger';
import { BarChart2, Calendar, Plus, TrendingUp } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import {
  Button, Card, Col, Container, Form,
  Modal, Nav, Row, Spinner, Tab
} from 'react-bootstrap';
import api from '@services/api';
import { obtenerEstadisticasEventos } from '@api/carritoApi';

const GENEROS = [
  'ROCK', 'JAZZ', 'POP', 'KPOP', 'METAL', 'RAP', 'RNB', 'INDIE', 'REGGAETON',
  'TERROR', 'COMEDIA', 'DRAMA', 'ACCION', 'ROMANCE', 'PARODIA',
  'GASTRONOMIA', 'ARTE', 'ARTESANIA', 'FOLCLORE'
];

const ESTADOS = ['PUBLICADO', 'CANCELADO'];

const Placeholder = ({ ms, descripcion, altura = 200 }) => (
  <div className={`d-flex flex-column align-items-center justify-content-center text-center rounded dashboard-organizador-placeholder dashboard-organizador-placeholder--${altura}`}>
    <p className="text-muted fw-semibold mb-1">🔧 Pendiente — {ms}</p>
    <p className="text-muted small mb-0">{descripcion}</p>
  </div>
);

const DashboardOrganizador = () => {
  const { usuario } = useAuth();
  const estaCreando = useRef(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);
  const [errores, setErrores] = useState({});

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    fecha: '',
    genero: '',
    estado: 'PUBLICADO',
    aforo: '',
    stock: '',
    precioEntrada: '',
    recinto: { nombre: '', ubicacion: '' },
    imagenUrl: '',
    causaSocialId: null,
    causaSocialNombre: '',
    organizacionNombre: '',
  });

  const [archivoPdf, setArchivoPdf] = useState(null);
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [causasActivas, setCausasActivas] = useState([]);
  const [cargandoCausas, setCargandoCausas] = useState(false);
  const [misEventos, setMisEventos] = useState([]);
  const [cargandoEventos, setCargandoEventos] = useState(false);
  const [estadisticas, setEstadisticas] = useState([]);
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(false);

  // Cargar causas activas cuando se abre el modal
  useEffect(() => {
    if (mostrarModal) {
      cargarCausasActivas();
    }
  }, [mostrarModal]);

  const cargarMisEventos = async () => {
    setCargandoEventos(true);
    try {
      const response = await api.get('/eventos/mis');
      setMisEventos(response.data || []);
    } catch (err) {
      logger.error('Error cargando eventos:', err);
    } finally {
      setCargandoEventos(false);
    }
  };

  useEffect(() => {
    cargarMisEventos();
  }, []);

  useEffect(() => {
    if (misEventos.length === 0) return;
    const cargarEstadisticas = async () => {
      setCargandoEstadisticas(true);
      try {
        const eventoIds = misEventos.map(e => e.id);
        const stats = await obtenerEstadisticasEventos(eventoIds);
        setEstadisticas(stats);
      } catch (err) {
        logger.error('Error cargando estadisticas:', err);
        setEstadisticas([]);
      } finally {
        setCargandoEstadisticas(false);
      }
    };
    cargarEstadisticas();
  }, [misEventos]);

  // Actualizar nombre de causa y organización cuando se selecciona una causa activa
  useEffect(() => {
    if (!form.causaSocialId) return;

    const causaSeleccionada = causasActivas.find(c => c.idCausa === parseInt(form.causaSocialId, 10));
    if (!causaSeleccionada) return;

    const causaSocialNombre = causaSeleccionada.nombre || '';
    const organizacionNombre = causaSeleccionada.organizacion?.nombre || '';

    if (form.causaSocialNombre !== causaSocialNombre || form.organizacionNombre !== organizacionNombre) {
      setForm(prev => ({
        ...prev,
        causaSocialNombre,
        organizacionNombre,
      }));
    }
  }, [form.causaSocialId, causasActivas]);

  const cargarCausasActivas = async () => {
    setCargandoCausas(true);
    try {
      const response = await api.get('/causas/activas');
      setCausasActivas(response.data || []);
    } catch (err) {
      logger.error('Error cargando causas activas:', err);
      setCausasActivas([]);
    } finally {
      setCargandoCausas(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'recintoNombre' || name === 'recintoUbicacion') {
      setForm(prev => ({
        ...prev,
        recinto: {
          ...prev.recinto,
          [name === 'recintoNombre' ? 'nombre' : 'ubicacion']: value
        }
      }));
      setErrores(prev => ({ ...prev, [name]: undefined }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
      setErrores(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!form.nombre.trim()) {
      nuevosErrores.nombre = 'Nombre del evento es obligatorio.';
    }

    if (!form.descripcion.trim()) {
      nuevosErrores.descripcion = 'Descripción del evento es obligatoria.';
    }

    if (!form.fecha) {
      nuevosErrores.fecha = 'Fecha y hora son obligatorias.';
    } else {
      const fechaIso = new Date(form.fecha);
      if (Number.isNaN(fechaIso.getTime())) {
        nuevosErrores.fecha = 'Fecha y hora no son válidas.';
      }
    }

    if (!form.genero) {
      nuevosErrores.genero = 'Selecciona un género para el evento.';
    }

    if (!form.recinto.nombre.trim()) {
      nuevosErrores.recintoNombre = 'Nombre del recinto es obligatorio.';
    }

    if (!form.recinto.ubicacion.trim()) {
      nuevosErrores.recintoUbicacion = 'Ubicación del recinto es obligatoria.';
    }

    if (!form.aforo) {
      nuevosErrores.aforo = 'Aforo es obligatorio.';
    } else if (parseInt(form.aforo, 10) <= 0) {
      nuevosErrores.aforo = 'Aforo debe ser mayor que cero.';
    }

    if (form.stock === '') {
      nuevosErrores.stock = 'Stock de entradas es obligatorio.';
    } else if (parseInt(form.stock, 10) < 0) {
      nuevosErrores.stock = 'Stock no puede ser negativo.';
    }

    if (form.aforo && form.stock !== '' && parseInt(form.stock, 10) > parseInt(form.aforo, 10)) {
      nuevosErrores.stock = 'El stock no puede ser mayor que el aforo.';
    }

    if (!form.precioEntrada) {
      nuevosErrores.precioEntrada = 'Precio de entrada es obligatorio.';
    } else if (parseFloat(form.precioEntrada) <= 0) {
      nuevosErrores.precioEntrada = 'Precio de entrada debe ser mayor que cero.';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleImagen = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    setArchivoImagen(archivo);
    setForm(prev => ({ ...prev, imagenUrl: `/img/${archivo.name}` }));
  };

  const handlePdf = (e) => {
    setArchivoPdf(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (estaCreando.current) return;
    estaCreando.current = true;
    setCargando(true);
    setError(null);
    try {
      if (!validarFormulario()) {
        setCargando(false);
        estaCreando.current = false;
        return;
      }

      const fechaIso = new Date(form.fecha);
      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        fecha: fechaIso.toISOString(),
        genero: form.genero || null,
        estado: form.estado,
        aforo: parseInt(form.aforo, 10),
        stock: parseInt(form.stock, 10),
        precioEntrada: parseFloat(form.precioEntrada),
        recinto: {
          nombre: form.recinto.nombre,
          ubicacion: form.recinto.ubicacion,
        },
        imagenUrl: form.imagenUrl,
        causaSocialId: form.causaSocialId ? parseInt(form.causaSocialId, 10) : null,
      };

      await api.post('/eventos/crear', payload);
      logger.info('Evento creado:', payload);
      setExito(true);
      cargarMisEventos();
      setTimeout(() => {
        setMostrarModal(false);
        setExito(false);
        setForm({
          nombre: '', descripcion: '', fecha: '', genero: '',
          estado: 'PUBLICADO', aforo: '', stock: '', precioEntrada: '',
          recinto: { nombre: '', ubicacion: '' }, imagenUrl: '',
          causaSocialId: null, causaSocialNombre: '', organizacionNombre: '',
        });
        setArchivoPdf(null);
        setArchivoImagen(null);
        estaCreando.current = false;
      }, 1500);
    } catch (err) {
      logger.error('Error creando evento:', err);
      const mensaje = err.response?.data?.message || err.response?.data || err.message || 'Error al crear el evento. Verifica los datos.';
      setError(`Error al crear el evento. ${mensaje}`);
      estaCreando.current = false;
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="grow py-4 dashboard-organizador-main">
        <Container fluid="lg">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-0">Panel Organizador</h2>
              <p className="text-muted small mb-0">
                Bienvenido, {usuario?.nombre || 'Organizador'}
              </p>
            </div>
            <Button
              className="d-flex align-items-center gap-2 btn-ticketti"
              onClick={() => setMostrarModal(true)}
            >
              <Plus size={18} /> Crear evento
            </Button>
          </div>

          {/* Estadísticas */}
          <Row className="g-3 mb-4">
            <Col xs={6} md={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="d-flex align-items-center gap-3 p-4">
                  <div className="dashboard-stat-icon dashboard-stat-icon-brand">
                    <Calendar size={22} />
                  </div>
                  <div>
                    <p className="text-muted small mb-1">Mis eventos</p>
                    <h5 className="fw-bold mb-0">{cargandoEventos ? '...' : misEventos.length}</h5>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={6} md={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="d-flex align-items-center gap-3 p-4">
                  <div className="dashboard-stat-icon dashboard-stat-icon-success">
                    <TrendingUp size={22} />
                  </div>
                  <div>
                    <p className="text-muted small mb-1">Entradas vendidas</p>
                    <h5 className="fw-bold mb-0">
                      {cargandoEstadisticas ? '...' : estadisticas.reduce((sum, e) => sum + Number(e.entradasVendidas || 0), 0)}
                    </h5>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={6} md={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="d-flex align-items-center gap-3 p-4">
                  <div className="dashboard-stat-icon dashboard-stat-icon-warning">
                    <BarChart2 size={22} />
                  </div>
                  <div>
                    <p className="text-muted small mb-1">Ingresos</p>
                    <h5 className="fw-bold mb-0">
                      {cargandoEstadisticas ? '...' : `$${estadisticas.reduce((sum, e) => sum + Number(e.ingresos || 0), 0).toLocaleString('es-CL')}`}
                    </h5>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={6} md={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="d-flex align-items-center gap-3 p-4">
                  <div className="dashboard-stat-icon dashboard-stat-icon-pink">
                    <TrendingUp size={22} />
                  </div>
                  <div>
                    <p className="text-muted small mb-1">Donaciones generadas</p>
                    <p className="text-muted small fst-italic mb-0">Pendiente MSDonaciones</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Tabs */}
          <Tab.Container defaultActiveKey="eventos">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <Nav variant="tabs" className="border-0">
                  <Nav.Item><Nav.Link eventKey="eventos">Mis Eventos</Nav.Link></Nav.Item>
                  <Nav.Item><Nav.Link eventKey="ventas">Ventas por Evento</Nav.Link></Nav.Item>
                  <Nav.Item><Nav.Link eventKey="reportes">Reportes</Nav.Link></Nav.Item>
                </Nav>
              </Card.Header>
              <Card.Body>
                <Tab.Content>
                  <Tab.Pane eventKey="eventos">
                    {cargandoEventos ? (
                      <p className="text-muted text-center py-4">Cargando eventos...</p>
                    ) : misEventos.length === 0 ? (
                      <p className="text-muted text-center py-4">No tienes eventos creados aún.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover align-middle">
                          <thead>
                            <tr>
                              <th>Nombre</th>
                              <th>Fecha</th>
                              <th>Género</th>
                              <th>Estado</th>
                              <th>Stock</th>
                              <th>Precio</th>
                            </tr>
                          </thead>
                          <tbody>
                            {misEventos.map(evento => (
                              <tr key={evento.id}>
                                <td className="fw-semibold">{evento.nombre}</td>
                                <td>{new Date(evento.fecha).toLocaleDateString('es-CL')}</td>
                                <td><span className="badge bg-secondary">{evento.genero}</span></td>
                                <td>
                                  <span className={`badge ${evento.estado === 'PUBLICADO' ? 'bg-success' : 'bg-danger'}`}>
                                    {evento.estado}
                                  </span>
                                </td>
                                <td>{evento.stock}</td>
                                <td>${evento.precioEntrada?.toLocaleString('es-CL')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Tab.Pane>
                  <Tab.Pane eventKey="ventas">
                    {cargandoEstadisticas ? (
                      <p className="text-muted text-center py-4">Cargando estadisticas...</p>
                    ) : misEventos.length === 0 ? (
                      <p className="text-muted text-center py-4">No hay eventos para mostrar.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover align-middle">
                          <thead>
                            <tr>
                              <th>Evento</th>
                              <th>Fecha</th>
                              <th>Stock original</th>
                              <th>Stock restante</th>
                              <th>Vendidas</th>
                              <th>Reembolsadas</th>
                              <th>Precio</th>
                              <th>Ingresos</th>
                            </tr>
                          </thead>
                          <tbody>
                            {misEventos.map(evento => {
                              const stat = estadisticas.find(s => s.eventoId === evento.id);
                              const vendidos = Number(stat?.entradasVendidas || 0);
                              const ingresos = Number(stat?.ingresos || 0);
                              return (
                                <tr key={evento.id}>
                                  <td className="fw-semibold">{evento.nombre}</td>
                                  <td>{new Date(evento.fecha).toLocaleDateString('es-CL')}</td>
                                  <td>{evento.aforo}</td>
                                  <td>{evento.stock}</td>
                                  <td>{vendidos}</td>
                                  <td>{stat?.entradasReembolsadas || 0}</td>
                                  <td>${evento.precioEntrada?.toLocaleString('es-CL')}</td>
                                  <td className="fw-semibold">${ingresos.toLocaleString('es-CL')}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Tab.Pane>
                  <Tab.Pane eventKey="reportes">
                    <Placeholder ms="MSEventos + MSCarrito" descripcion="Reportes de asistencia e ingresos" altura={250} />
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Card>
          </Tab.Container>
        </Container>
      </main>
      <Footer />

      {/* Modal Crear Evento */}
      <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Crear Evento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {exito && <div className="alert alert-success">¡Evento creado exitosamente!</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Nombre del Evento</Form.Label>
                <Form.Control name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Lollapalooza" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Fecha</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="fecha"
                  value={form.fecha}
                  onChange={handleChange}
                  isInvalid={!!errores.fecha}
                />
                <Form.Control.Feedback type="invalid">
                  {errores.fecha}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  isInvalid={!!errores.descripcion}
                />
                <Form.Control.Feedback type="invalid">
                  {errores.descripcion}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Género</Form.Label>
                <Form.Select name="genero" value={form.genero} onChange={handleChange}>
                  <option value="">Seleccionar género</option>
                  {GENEROS.map(g => <option key={g} value={g}>{g}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Estado</Form.Label>
                <Form.Select name="estado" value={form.estado} onChange={handleChange}>
                  {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Nombre del Recinto</Form.Label>
                <Form.Control
                  name="recintoNombre"
                  value={form.recinto.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Parque O'Higgins"
                  isInvalid={!!errores.recintoNombre}
                />
                <Form.Control.Feedback type="invalid">
                  {errores.recintoNombre}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Ubicación</Form.Label>
                <Form.Control
                  name="recintoUbicacion"
                  value={form.recinto.ubicacion}
                  onChange={handleChange}
                  placeholder="Ej: Santiago Centro"
                  isInvalid={!!errores.recintoUbicacion}
                />
                <Form.Control.Feedback type="invalid">
                  {errores.recintoUbicacion}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Aforo</Form.Label>
                <Form.Control
                  type="number"
                  name="aforo"
                  value={form.aforo}
                  onChange={handleChange}
                  min="1"
                  isInvalid={!!errores.aforo}
                />
                <Form.Control.Feedback type="invalid">
                  {errores.aforo}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Stock Entradas</Form.Label>
                <Form.Control
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  min="0"
                  isInvalid={!!errores.stock}
                />
                <Form.Control.Feedback type="invalid">
                  {errores.stock}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Precio Entradas</Form.Label>
                <Form.Control
                  type="number"
                  name="precioEntrada"
                  value={form.precioEntrada}
                  onChange={handleChange}
                  min="0"
                  isInvalid={!!errores.precioEntrada}
                />
                <Form.Control.Feedback type="invalid">
                  {errores.precioEntrada}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Imagen del Evento</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={handleImagen} />
                {archivoImagen && (
                  <img src={URL.createObjectURL(archivoImagen)} alt="preview"
                    className="mt-2 rounded" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover' }} />
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Causa Social (.pdf)</Form.Label>
                <Form.Control type="file" accept=".pdf" onChange={handlePdf} />
                {archivoPdf && (
                  <p className="text-muted small mt-2">📄 {archivoPdf.name}</p>
                )}
              </Form.Group>
            </Col>
            <Col md={12}>
              <hr />
              <p className="fw-semibold mb-3">Causa Social (Opcional)</p>
              <p className="text-muted small mb-2">Si no selecciona una causa, adminplataforma podrá agregarla posteriormente.</p>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Seleccionar Causa Social</Form.Label>
                <Form.Select
                  name="causaSocialId"
                  value={form.causaSocialId || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, causaSocialId: e.target.value ? e.target.value : null }))}
                  disabled={cargandoCausas}
                >
                  <option value="">-- Sin causa social --</option>
                  {causasActivas.map(causa => (
                    <option key={causa.idCausa} value={causa.idCausa}>
                      {causa.nombre} ({causa.organizacion?.nombre || 'Sin organización'})
                    </option>
                  ))}
                </Form.Select>
                {cargandoCausas && <p className="text-muted small mt-2">Cargando causas...</p>}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Nombre causa social</Form.Label>
                <Form.Control
                  name="causaSocialNombre"
                  value={form.causaSocialNombre}
                  onChange={handleChange}
                  placeholder="Se rellenará al seleccionar o escribir manualmente"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Nombre organización</Form.Label>
                <Form.Control
                  name="organizacionNombre"
                  value={form.organizacionNombre}
                  onChange={handleChange}
                  placeholder="Se rellenará al seleccionar o escribir manualmente"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModal(false)}>Cancelar</Button>
          <Button className="btn-ticketti" onClick={handleSubmit} disabled={cargando}>
            {cargando ? 'Creando...' : 'Crear Evento'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DashboardOrganizador;