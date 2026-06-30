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
import { crearCausa, subirDocumentoCausa } from '@api/donacionesApi';

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
  });

  // Causa social: usar una existente, o crear una nueva (sin organización
  // todavía — se asocia después, ver CausaSocialRequestDTO en ms-donaciones).
  const [creandoCausaNueva, setCreandoCausaNueva] = useState(false);
  const [nuevaCausa, setNuevaCausa] = useState({
    nombre: '', fechaInicio: '', descripcion: '', objetivoMonto: '',
  });
  // Documento de respaldo (PDF) de la causa nueva: requerido para que el
  // admin pueda validarla y activarla (ver CausaSocialService.enviarDocumento).
  const [documentoCausa, setDocumentoCausa] = useState(null);

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

  const causaSeleccionada = causasActivas.find(
    c => c.idCausa === parseInt(form.causaSocialId, 10)
  );

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

  const handleNuevaCausaChange = (e) => {
    const { name, value } = e.target;
    setNuevaCausa(prev => ({ ...prev, [name]: value }));
    setErrores(prev => ({ ...prev, [`causa_${name}`]: undefined }));
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

    // Todo evento debe tener una causa social: existente o recién creada.
    if (creandoCausaNueva) {
      if (!nuevaCausa.nombre.trim()) {
        nuevosErrores.causa_nombre = 'Nombre de la causa es obligatorio.';
      }
      if (!nuevaCausa.fechaInicio) {
        nuevosErrores.causa_fechaInicio = 'Fecha de inicio de la causa es obligatoria.';
      }
      if (!documentoCausa) {
        nuevosErrores.causa_documento = 'Sube el documento (PDF) que respalda la causa, para validación del equipo Ticketti.';
      }
    } else if (!form.causaSocialId) {
      nuevosErrores.causaSocialId = 'Selecciona una causa social, o crea una nueva.';
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

  const handleDocumentoCausa = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    setDocumentoCausa(archivo);
    setErrores(prev => ({ ...prev, causa_documento: undefined }));
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

      // Si el organizador eligió crear una causa nueva, se crea primero
      // (sin organización todavía) y se usa el id resultante en el evento.
      let causaSocialId = form.causaSocialId ? parseInt(form.causaSocialId, 10) : null;
      if (creandoCausaNueva) {
        const causaCreada = await crearCausa({
          nombre: nuevaCausa.nombre,
          descripcion: nuevaCausa.descripcion || undefined,
          objetivoMonto: nuevaCausa.objetivoMonto ? parseFloat(nuevaCausa.objetivoMonto) : undefined,
          fechaInicio: nuevaCausa.fechaInicio,
        });
        causaSocialId = causaCreada.idCausa;
        await subirDocumentoCausa(
          causaCreada.idCausa,
          documentoCausa,
          usuario?.nombre || usuario?.correo || 'Organizador'
        );
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
        causaSocialId,
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
          causaSocialId: null,
        });
        setCreandoCausaNueva(false);
        setNuevaCausa({ nombre: '', fechaInicio: '', descripcion: '', objetivoMonto: '' });
        setDocumentoCausa(null);
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
                <Form.Label>Seleccionar Causa Social</Form.Label>
                <Form.Select
                  name="causaSocialId"
                  value={form.causaSocialId || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, causaSocialId: e.target.value || null }))}
                  disabled={cargandoCausas || creandoCausaNueva}
                  isInvalid={!!errores.causaSocialId}
                >
                  <option value="">-- Selecciona una causa --</option>
                  {causasActivas.map(causa => (
                    <option key={causa.idCausa} value={causa.idCausa}>
                      {causa.nombre} ({causa.nombreOrganizacion || 'Sin organización'})
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errores.causaSocialId}
                </Form.Control.Feedback>
                {cargandoCausas && <p className="text-muted small mt-2 mb-0">Cargando causas...</p>}
                {causaSeleccionada?.nombreOrganizacion && (
                  <p className="text-muted small mt-2 mb-0">
                    Organización: {causaSeleccionada.nombreOrganizacion}
                  </p>
                )}
              </Form.Group>
            </Col>

            <Col md={12}>
              <hr />
              <Form.Check
                type="switch"
                id="switch-causa-nueva"
                label="No encuentro la causa que busco: crear una causa social nueva"
                checked={creandoCausaNueva}
                onChange={(e) => {
                  setCreandoCausaNueva(e.target.checked);
                  if (e.target.checked) {
                    setForm(prev => ({ ...prev, causaSocialId: null }));
                  } else {
                    setDocumentoCausa(null);
                  }
                  setErrores(prev => ({
                    ...prev,
                    causaSocialId: undefined,
                    causa_nombre: undefined,
                    causa_fechaInicio: undefined,
                    causa_documento: undefined,
                  }));
                }}
                className="mb-3"
              />
              {creandoCausaNueva && (
                <p className="text-muted small mb-3">
                  La causa se crea sin organización asociada — adminplataforma podrá vincularla más adelante.
                  Quedará en estado <strong>PENDIENTE</strong> hasta que el equipo Ticketti valide el documento
                  de respaldo y la active.
                </p>
              )}
            </Col>

            {creandoCausaNueva && (
              <>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Nombre de la causa</Form.Label>
                    <Form.Control
                      name="nombre"
                      value={nuevaCausa.nombre}
                      onChange={handleNuevaCausaChange}
                      placeholder="Ej: Reforestación Patagonia"
                      isInvalid={!!errores.causa_nombre}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errores.causa_nombre}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Fecha de inicio</Form.Label>
                    <Form.Control
                      type="date"
                      name="fechaInicio"
                      value={nuevaCausa.fechaInicio}
                      onChange={handleNuevaCausaChange}
                      isInvalid={!!errores.causa_fechaInicio}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errores.causa_fechaInicio}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={8}>
                  <Form.Group>
                    <Form.Label>Descripción (opcional)</Form.Label>
                    <Form.Control
                      name="descripcion"
                      value={nuevaCausa.descripcion}
                      onChange={handleNuevaCausaChange}
                      placeholder="Breve descripción de la causa"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Meta de recaudación (opcional)</Form.Label>
                    <Form.Control
                      type="number"
                      name="objetivoMonto"
                      value={nuevaCausa.objetivoMonto}
                      onChange={handleNuevaCausaChange}
                      min="0"
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Documento de respaldo (PDF)</Form.Label>
                    <Form.Control
                      type="file"
                      accept="application/pdf"
                      onChange={handleDocumentoCausa}
                      isInvalid={!!errores.causa_documento}
                    />
                    <Form.Text className="text-muted">
                      El equipo Ticketti lo revisará por correo antes de activar la causa.
                    </Form.Text>
                    <Form.Control.Feedback type="invalid">
                      {errores.causa_documento}
                    </Form.Control.Feedback>
                    {documentoCausa && (
                      <p className="text-success small mt-2 mb-0">
                        Archivo seleccionado: {documentoCausa.name}
                      </p>
                    )}
                  </Form.Group>
                </Col>
              </>
            )}
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