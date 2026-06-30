import api from '@api/api';
import Footer from '@components/layout/Footer';
import Header from '@components/layout/Header';
import { useAuth } from '@hooks/useAuth';
import { Heart, Mail, RefreshCw, ShoppingBag, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Form,
  Modal,
  Nav,
  Spinner,
  Tab,
  Table,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { obtenerUsuario, actualizarUsuario } from '@api/usuariosApi';
import { solicitarDevolucion, obtenerCarrito } from '@api/carritoApi';
import { getMisDonaciones } from '@api/donacionesApi';

const estadoLabelMap = {
  CREADO: 'Creado',
  RESERVADO: 'Reserva activa',
  PAGADO: 'Pagado',
  FALLIDO: 'Fallido',
  CANCELADO: 'Cancelado',
  REEMBOLSADO: 'Reembolsado',
};

const estadoVariantMap = {
  CREADO: 'secondary',
  RESERVADO: 'warning',
  PAGADO: 'success',
  FALLIDO: 'danger',
  CANCELADO: 'dark',
  REEMBOLSADO: 'info',
};

const formatearFecha = (f) => {
  if (!f) return '—';
  const d = new Date(f);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatearMoneda = (v) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(v ?? 0);

const TIPO_LABELS = {
  CONFIRMACION_COMPRA: 'Confirmacion',
  RECOMENDACION: 'Recomendacion',
  DEVOLUCION: 'Devolucion',
  RECORDATORIO_EVENTO: 'Recordatorio',
};

const ESTADO_VARIANT = {
  ENVIADO: 'success',
  PENDIENTE: 'warning',
  FALLIDO: 'danger',
  CANCELADO: 'secondary',
};

const estadoDonacionLabelMap = {
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
};

const estadoDonacionVariantMap = {
  PENDIENTE: 'warning',
  APROBADA: 'success',
  RECHAZADA: 'danger',
};

const PerfilCliente = () => {
  const { usuario, actualizarContextoUsuario } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Estados del Formulario de Perfil
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    direccion: '',
  });
  const [cargandoPerfil, setCargandoPerfil] = useState(false);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState('');
  const [exitoPerfil, setExitoPerfil] = useState('');

  const idUsuario = usuario?.id || localStorage.getItem('idUsuario');

  const cargarNotificaciones = useCallback(async (signal) => {
    if (!idUsuario) return;
    setCargando(true);
    setError('');
    try {
      const res = await api.get(`/notificaciones/historial/${idUsuario}`, { signal });
      setNotificaciones(res.data || []);
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
      setError('No se pudieron cargar las notificaciones.');
    } finally {
      setCargando(false);
    }
  }, [idUsuario]);

  const cargarPerfilCompleto = useCallback(async (signal) => {
    if (!idUsuario) return;
    setCargandoPerfil(true);
    setErrorPerfil('');
    try {
      const data = await obtenerUsuario(idUsuario, { signal });
      setFormData({
        nombre: data.nombre || '',
        correo: data.correo || '',
        telefono: data.telefono || '',
        direccion: data.direccion || '',
      });
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
      setErrorPerfil('No se pudieron cargar los datos de perfil.');
    } finally {
      setCargandoPerfil(false);
    }
  }, [idUsuario]);

  useEffect(() => {
    const controller = new AbortController();
    cargarNotificaciones(controller.signal);
    cargarPerfilCompleto(controller.signal);
    return () => controller.abort();
  }, [cargarNotificaciones, cargarPerfilCompleto]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorPerfil('');
    setExitoPerfil('');

    if (!formData.nombre.trim()) {
      setErrorPerfil('El nombre es obligatorio.');
      return;
    }
    if (!formData.correo.trim()) {
      setErrorPerfil('El correo es obligatorio.');
      return;
    }

    setGuardandoPerfil(true);
    try {
      const usuarioActualizado = await actualizarUsuario(idUsuario, {
        nombre: formData.nombre.trim(),
        correo: formData.correo.trim(),
        telefono: formData.telefono ? formData.telefono.trim() : '',
        direccion: formData.direccion ? formData.direccion.trim() : '',
        rol: usuario?.rol || 'CLIENTE',
      });

      actualizarContextoUsuario({
        nombre: usuarioActualizado.nombre,
        correo: usuarioActualizado.correo,
      });

      setExitoPerfil('Perfil actualizado exitosamente.');
    } catch (err) {
      setErrorPerfil(
        err.response?.data?.mensaje ||
          err.message ||
          'Error al actualizar el perfil.'
      );
    } finally {
      setGuardandoPerfil(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="grow py-4 perfil-cliente-main">
        <Container fluid="lg">
          {/* Cabecera del perfil */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="d-flex align-items-center gap-4 p-4">
              <div className="perfil-cliente-avatar">
                <User size={36} className="perfil-cliente-icon" />
              </div>
              <div>
                <h4 className="fw-bold mb-1">
                  {usuario?.nombre || 'Mi perfil'}
                </h4>
                <Badge className="badge-ticketti">CLIENTE</Badge>
              </div>
            </Card.Body>
          </Card>

          {/* Tabs */}
          <Tab.Container defaultActiveKey="notificaciones">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <Nav variant="tabs" className="border-0">
                  <Nav.Item>
                    <Nav.Link
                      eventKey="notificaciones"
                      className="d-flex align-items-center gap-2"
                    >
                      <Mail size={16} /> Mis Correos
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="compras"
                      className="d-flex align-items-center gap-2"
                    >
                      <ShoppingBag size={16} /> Mis Compras
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="donaciones"
                      className="d-flex align-items-center gap-2"
                    >
                      <Heart size={16} /> Mis Donaciones
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="perfil"
                      className="d-flex align-items-center gap-2"
                    >
                      <User size={16} /> Editar Perfil
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>
              <Card.Body>
                <Tab.Content>
                  {/* ── NOTIFICACIONES ── */}
                  <Tab.Pane eventKey="notificaciones">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="fw-bold mb-0">Historial de correos</h5>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={cargarNotificaciones}
                        className="d-flex align-items-center gap-1"
                      >
                        <RefreshCw size={14} /> Actualizar
                      </Button>
                    </div>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {cargando ? (
                      <div className="text-center py-4">
                        <Spinner className="spinner-ticketti" />
                      </div>
                    ) : notificaciones.length === 0 ? (
                      <Alert variant="info">
                        No tienes notificaciones todavía.
                      </Alert>
                    ) : (
                      <Table hover responsive size="sm">
                        <thead className="table-light">
                          <tr>
                            <th>Tipo</th>
                            <th>Asunto</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                          </tr>
                        </thead>
                        <tbody>
                          {notificaciones.map((n) => (
                            <tr key={n.idNotificacion}>
                              <td>
                                <Badge
                                  bg="light"
                                  text="dark"
                                  className="badge-ticketti-border"
                                >
                                  {TIPO_LABELS[n.tipo] || n.tipo}
                                </Badge>
                              </td>
                              <td className="text-muted small">{n.asunto}</td>
                              <td>
                                <Badge
                                  bg={ESTADO_VARIANT[n.estado] || 'secondary'}
                                >
                                  {n.estado}
                                </Badge>
                              </td>
                              <td className="text-muted small">
                                {formatearFecha(n.fechaEnvio)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </Tab.Pane>

                  {/* ── MIS COMPRAS — conectado a ms-carrito ── */}
                  <Tab.Pane eventKey="compras">
                    <MisComprasTab usuarioId={usuario?.id} />
                  </Tab.Pane>

                  {/* ── MIS DONACIONES — conectado a ms-donaciones ── */}
                  <Tab.Pane eventKey="donaciones">
                    <MisDonacionesTab />
                  </Tab.Pane>

                  {/* ── PERFIL ── */}
                  <Tab.Pane eventKey="perfil">
                    <div className="mb-3">
                      <h5 className="fw-bold mb-3">Información Personal</h5>
                    </div>
                    {cargandoPerfil ? (
                      <div className="text-center py-4">
                        <Spinner className="spinner-ticketti" />
                      </div>
                    ) : (
                      <Form onSubmit={handleSubmit} className="perfil-cliente-form">
                        {errorPerfil && <Alert variant="danger">{errorPerfil}</Alert>}
                        {exitoPerfil && <Alert variant="success">{exitoPerfil}</Alert>}

                        <Form.Group className="mb-3" controlId="formNombre">
                          <Form.Label className="fw-semibold">Nombre Completo</Form.Label>
                          <Form.Control
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            placeholder="Tu nombre completo"
                            required
                          />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formCorreo">
                          <Form.Label className="fw-semibold">Correo Electrónico</Form.Label>
                          <Form.Control
                            type="email"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            placeholder="nombre@correo.com"
                            required
                          />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formTelefono">
                          <Form.Label className="fw-semibold">Teléfono de Contacto</Form.Label>
                          <Form.Control
                            type="text"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            placeholder="Ej: +56912345678"
                          />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formDireccion">
                          <Form.Label className="fw-semibold">Dirección</Form.Label>
                          <Form.Control
                            type="text"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            placeholder="Tu dirección física"
                          />
                        </Form.Group>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                          <Button
                            variant="outline-secondary"
                            type="button"
                            onClick={cargarPerfilCompleto}
                            disabled={guardandoPerfil}
                          >
                            Descartar Cambios
                          </Button>
                          <Button
                            className="btn-ticketti"
                            type="submit"
                            disabled={guardandoPerfil}
                            style={{
                              backgroundColor: '#a370f7',
                              borderColor: '#a370f7',
                            }}
                          >
                            {guardandoPerfil ? (
                              <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Guardando...
                              </>
                            ) : (
                              'Guardar Cambios'
                            )}
                          </Button>
                        </div>
                      </Form>
                    )}
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Card>
          </Tab.Container>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

// Componente separado para Mis Compras — se aísla para que su estado de carga
// y datos no interfiera con el resto del PerfilCliente
function MisComprasTab({ usuarioId }) {
  const [carritos, setCarritos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const [showDevolucionModal, setShowDevolucionModal] = useState(false);
  const [carritoSeleccionado, setCarritoSeleccionado] = useState(null);
  const [razonDevolucion, setRazonDevolucion] = useState('');
  const [procesandoDevolucion, setProcesandoDevolucion] = useState(false);
  const [resultadoDevolucion, setResultadoDevolucion] = useState(null);
  const [errorDevolucion, setErrorDevolucion] = useState('');

  const cargarCompras = useCallback(async () => {
    if (!usuarioId) return;
    setCargando(true);
    setError('');
    try {
      const res = await api.get('/Carrito/listar', {
        headers: { 'X-Usuario-Id': usuarioId },
      });
      const carritos = res.data?.data || [];
      const carritosPermitidos = carritos.filter((c) => {
        const estado = (c.estadoCarrito || c.estado || '')
          .toString()
          .toUpperCase();
        return estado === 'PAGADO' || estado === 'REEMBOLSADO';
      });
      const carritosOrdenados = carritosPermitidos.sort((a, b) => {
        const fechaA = new Date(a.fechaCreacion || a.createdAt || 0);
        const fechaB = new Date(b.fechaCreacion || b.createdAt || 0);
        return fechaA - fechaB;
      });
      setCarritos(carritosOrdenados);
    } catch {
      setError('No se pudieron cargar las compras.');
    } finally {
      setCargando(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    cargarCompras();
  }, [cargarCompras]);

  const handleSolicitarDevolucion = async () => {
    if (!carritoSeleccionado) return;
    setProcesandoDevolucion(true);
    setErrorDevolucion('');
    try {
      const id = carritoSeleccionado.idCarrito || carritoSeleccionado.id;

      const carritoActual = await obtenerCarrito(id);
      const estadoActual = (carritoActual?.estadoCarrito || carritoActual?.estado || '')
        .toString()
        .toUpperCase();
      if (estadoActual !== 'PAGADO') {
        setErrorDevolucion(
          'Esta compra ya no está en estado pagado. Actualiza el historial para ver el estado actual.'
        );
        cargarCompras();
        return;
      }

      const resultado = await solicitarDevolucion(id, {
        razon: razonDevolucion,
      });
      setResultadoDevolucion(resultado);
      cargarCompras();
    } catch (err) {
      setErrorDevolucion(
        err.response?.data?.mensaje ||
          err.message ||
          'Error al procesar la devolución.'
      );
    } finally {
      setProcesandoDevolucion(false);
    }
  };

  const abrirModalDevolucion = (carrito) => {
    setCarritoSeleccionado(carrito);
    setRazonDevolucion('');
    setResultadoDevolucion(null);
    setErrorDevolucion('');
    setShowDevolucionModal(true);
  };

  if (cargando)
    return (
      <div className="text-center py-4">
        <Spinner className="spinner-ticketti" />
      </div>
    );

  if (error)
    return (
      <Alert variant="danger" className="d-flex align-items-center gap-2">
        {error}
      </Alert>
    );

  if (carritos.length === 0)
    return <Alert variant="info">Todavía no tienes compras registradas.</Alert>;

  const formatearItems = (carrito) => {
    const items = carrito.items || carrito.detalles || [];
    if (items.length === 0) return '—';
    return items
      .map(
        (i) =>
          `${i.tipoEntrada || i.tipoEntradaNombre || 'General'} x ${i.cantidad}`
      )
      .join(', ');
  };

  const totalEntradas = (carrito) =>
    (carrito.items || carrito.detalles || []).reduce(
      (sum, i) => sum + (i.cantidad || 0),
      0
    );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Historial de compras</h5>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={cargarCompras}
          className="d-flex align-items-center gap-1"
        >
          <RefreshCw size={14} /> Actualizar
        </Button>
      </div>

      <Table hover responsive>
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>Entradas</th>
            <th>Tipo</th>
            <th>Total</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {carritos.map((carrito, index) => {
            const idCarrito = carrito.idCarrito || carrito.id;
            const estado =
              (carrito.estadoCarrito || carrito.estado || '—')
                .toString()
                .toUpperCase() || 'CREADO';
            const numeroCompra = index + 1;
            return (
              <tr key={idCarrito}>
                <td className="fw-semibold">Compra #{numeroCompra}</td>
                <td className="text-muted small">
                  {formatearFecha(carrito.fechaCreacion || carrito.createdAt)}
                </td>
                <td>{totalEntradas(carrito)}</td>
                <td className="small">{formatearItems(carrito)}</td>
                <td className="fw-semibold">
                  {formatearMoneda(carrito.total || 0)}
                </td>
                <td>
                  <Badge
                    bg={estadoVariantMap[estado] || 'secondary'}
                    text={
                      estadoVariantMap[estado] === 'light' ? 'dark' : undefined
                    }
                  >
                    {estadoLabelMap[estado] || estado}
                  </Badge>
                </td>
                <td>
                  {estado === 'PAGADO' ? (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => abrirModalDevolucion(carrito)}
                    >
                      Solicitar devolución
                    </Button>
                  ) : estado === 'REEMBOLSADO' ? (
                    <Badge bg="info">Reembolsado</Badge>
                  ) : (
                    <Button
                      as={Link}
                      to={`/carrito/${idCarrito}`}
                      variant="outline-primary"
                      size="sm"
                    >
                      Ver detalle
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {/* Modal de solicitud de devolución */}
      <Modal
        show={showDevolucionModal}
        onHide={() => setShowDevolucionModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Solicitar devolución</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {resultadoDevolucion ? (
            <div>
              <Alert variant="success">
                Devolución procesada exitosamente
              </Alert>
              <p className="mb-1">
                <strong>Monto total:</strong>{' '}
                {formatearMoneda(resultadoDevolucion.montoTotal)}
              </p>
              <p className="mb-1">
                <strong>Monto reembolsado (85%):</strong>{' '}
                {formatearMoneda(resultadoDevolucion.montoDevolucion)}
              </p>
              <p className="mb-1">
                <strong>Donación no reembolsable (10%):</strong>{' '}
                {formatearMoneda(
                  resultadoDevolucion.montoDonacionNoReembolsable
                )}
              </p>
              <p className="text-muted small mb-0 mt-2">
                {resultadoDevolucion.mensaje}
              </p>
            </div>
          ) : (
            <div>
              <p>
                ¿Estás seguro de que deseas solicitar la devolución de esta
                compra?
              </p>
              <p className="text-muted small">
                Se reembolsará el 85% del monto pagado. El 10% donado no es
                reembolsable.
              </p>
              {errorDevolucion && (
                <Alert variant="danger">{errorDevolucion}</Alert>
              )}
              <Form.Group>
                <Form.Label>Motivo de la devolución (opcional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  maxLength={500}
                  value={razonDevolucion}
                  onChange={(e) => setRazonDevolucion(e.target.value)}
                  placeholder="Describe el motivo de tu devolución..."
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {resultadoDevolucion ? (
            <Button
              variant="primary"
              onClick={() => setShowDevolucionModal(false)}
            >
              Cerrar
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() => setShowDevolucionModal(false)}
                disabled={procesandoDevolucion}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleSolicitarDevolucion}
                disabled={procesandoDevolucion}
              >
                {procesandoDevolucion ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Procesando...
                  </>
                ) : (
                  'Confirmar devolución'
                )}
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}

// Componente separado para Mis Donaciones — conectado a GET /donaciones/me
function MisDonacionesTab() {
  const [donaciones, setDonaciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const cargarDonaciones = useCallback(async (signal) => {
    setCargando(true);
    setError('');
    try {
      const data = await getMisDonaciones({ signal });
      setDonaciones(data || []);
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
      setError('No se pudieron cargar las donaciones.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    cargarDonaciones(controller.signal);
    return () => controller.abort();
  }, [cargarDonaciones]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Historial de donaciones</h5>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => cargarDonaciones()}
          className="d-flex align-items-center gap-1"
        >
          <RefreshCw size={14} /> Actualizar
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {cargando ? (
        <div className="text-center py-4">
          <Spinner className="spinner-ticketti" />
        </div>
      ) : donaciones.length === 0 ? (
        <Alert variant="info">Todavía no tienes donaciones registradas.</Alert>
      ) : (
        <Table hover responsive size="sm">
          <thead className="table-light">
            <tr>
              <th>Causa</th>
              <th>Organización</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {donaciones.map((d) => (
              <tr key={d.idDonacion}>
                <td>{d.nombreCausa || '—'}</td>
                <td className="text-muted small">
                  {d.nombreOrganizacion || '—'}
                </td>
                <td className="fw-semibold">{formatearMoneda(d.monto)}</td>
                <td className="text-muted small">
                  {formatearFecha(d.fecha)}
                </td>
                <td>
                  <Badge bg={estadoDonacionVariantMap[d.estado] || 'secondary'}>
                    {estadoDonacionLabelMap[d.estado] || d.estado}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

export default PerfilCliente;
