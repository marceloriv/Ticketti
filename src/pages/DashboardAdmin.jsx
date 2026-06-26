import Footer from '@components/layout/Footer';
import Header from '@components/layout/Header';
import DashAdminUsuarios from '@/components/admin/DashAdminUsuarios';
import { Building2, Heart, Plus, ShoppingBag, TrendingUp } from 'lucide-react';
import { listarEventos } from '@api/eventosApi';
import { obtenerEstadisticasEventos } from '@api/carritoApi';
import { listarUsuarios } from '@api/usuariosApi';
import { useCallback, useEffect, useState } from 'react';

import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Nav,
  Row,
  Spinner,
  Tab,
  Table,
} from 'react-bootstrap';
import {
  getOrganizaciones,
  getCausasActivas,
  getTotalPorOrganizacion,
  crearOrganizacionActiva,
  crearCausaActiva,
  activarOrganizacion,
} from '@api/donacionesApi';

const STAT_VARIANTS = {
  brand: 'dashboard-stat-icon-brand',
  pink: 'dashboard-stat-icon-pink',
  success: 'dashboard-stat-icon-success',
  warning: 'dashboard-stat-icon-warning',
};

// Tarjeta de estadística reutilizable
const StatCard = ({
  icon: Icon,
  titulo,
  valor,
  variant = 'brand',
  cargando,
}) => (
  <Card className="border-0 shadow-sm h-100">
    <Card.Body className="d-flex align-items-center gap-3 p-4">
      <div
        className={`dashboard-stat-icon ${STAT_VARIANTS[variant] || STAT_VARIANTS.brand}`}
      >
        {Icon ? <Icon size={24} /> : null}
      </div>
      <div>
        <p className="text-muted small mb-1">{titulo}</p>
        {cargando ? (
          <Spinner size="sm" className="spinner-ticketti" />
        ) : (
          <h4 className="fw-bold mb-0">{valor}</h4>
        )}
      </div>
    </Card.Body>
  </Card>
);

// Placeholder para secciones de otros microservicios
const Placeholder = ({ ms, descripcion }) => (
  <Card className="border-0 border-dashed shadow-sm dashboard-placeholder-card">
    <Card.Body className="text-center py-5">
      <p className="text-muted mb-1 fw-semibold">🔧 Pendiente — {ms}</p>
      <p className="text-muted small mb-0">{descripcion}</p>
    </Card.Body>
  </Card>
);

const DashboardAdmin = () => {
  const [organizaciones, setOrganizaciones] = useState([]);
  const [causas, setCausas] = useState([]);
  const [totales, setTotales] = useState({});
  const [cargando, setCargando] = useState(true);
  const [showModalOrg, setShowModalOrg] = useState(false);
  const [showModalCausa, setShowModalCausa] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState('');
  const [error, setError] = useState('');
  const [ventasStats, setVentasStats] = useState([]);
  const [cargandoVentas, setCargandoVentas] = useState(false);

  // Formulario "Nueva Organización" (admin crea desde cero -> queda ACTIVA)
  const [formOrg, setFormOrg] = useState({
    nombre: '',
    rut: '',
    email: '',
    telefono: '',
    direccion: '',
    banco: '',
    tipoCuenta: '',
    numeroCuenta: '',
    titularCuenta: '',
    rutTitular: '',
    metodoPagoPreferido: 'TRANSFERENCIA',
  });

  // Formulario "Activar Organización" (admin completa datos bancarios
  // de una organización PENDIENTE creada por el Organizador)
  const [formActivar, setFormActivar] = useState({
    banco: '',
    tipoCuenta: '',
    numeroCuenta: '',
    titularCuenta: '',
    rutTitular: '',
    metodoPagoPreferido: 'TRANSFERENCIA',
  });
  const [orgAActivar, setOrgAActivar] = useState(null);
  const [showModalActivar, setShowModalActivar] = useState(false);

  const [formCausa, setFormCausa] = useState({
    idOrganizacion: '',
    nombre: '',
    descripcion: '',
    objetivoMonto: '',
    fechaInicio: '',
  });

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [orgs, causasData] = await Promise.all([
        getOrganizaciones(),
        getCausasActivas(),
      ]);
      setOrganizaciones(orgs);
      setCausas(causasData);
      // Cargar totales por organización
      const tots = {};
      await Promise.all(
        orgs.map(async (o) => {
          try {
            tots[o.idOrganizacion] = await getTotalPorOrganizacion(
              o.idOrganizacion
            );
          } catch {
            tots[o.idOrganizacion] = 0;
          }
        })
      );
      setTotales(tots);

      // Cargar ventas globales
      setCargandoVentas(true);
      try {
        const [eventos, usuarios] = await Promise.all([
          listarEventos(),
          listarUsuarios(),
        ]);
        const userMap = Object.fromEntries(
          usuarios.map(u => [u.id, u.nombre])
        );
        const eventoIds = eventos.map(e => e.id);
        if (eventoIds.length > 0) {
          const stats = await obtenerEstadisticasEventos(eventoIds);
          const conNombres = stats.map(s => {
            const evento = eventos.find(e => e.id === s.eventoId);
            return {
              ...s,
              nombre: evento?.nombre || 'Desconocido',
              organizador: userMap[evento?.organizadorId] || '—',
            };
          });
          setVentasStats(conNombres);
        }
      } catch {
        // Silencioso — el retry 503 del interceptor ya se encarga
      } finally {
        setCargandoVentas(false);
      }
    } catch {
      setError('Error cargando datos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const totalRecaudado = Object.values(totales).reduce(
    (a, b) => a + Number(b || 0),
    0
  );

  const fmt = (n) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(n || 0);

  // ── Handlers: Organizaciones ──────────────────────────────

  const handleCrearOrg = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const {
        banco,
        tipoCuenta,
        numeroCuenta,
        titularCuenta,
        rutTitular,
        metodoPagoPreferido,
        ...datosBasicos
      } = formOrg;

      await crearOrganizacionActiva(datosBasicos, {
        banco,
        tipoCuenta,
        numeroCuenta,
        titularCuenta,
        rutTitular,
        metodoPagoPreferido,
      });

      setExito('Organización creada y activada.');
      setShowModalOrg(false);
      cargar();
      setTimeout(() => setExito(''), 3000);
    } catch {
      setError('Error al crear organización.');
    } finally {
      setGuardando(false);
    }
  };

  const abrirModalActivar = (org) => {
    setOrgAActivar(org);
    setShowModalActivar(true);
  };

  const handleActivarOrg = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await activarOrganizacion(orgAActivar.idOrganizacion, formActivar);
      setExito('Organización activada correctamente.');
      setShowModalActivar(false);
      setFormActivar({
        banco: '',
        tipoCuenta: '',
        numeroCuenta: '',
        titularCuenta: '',
        rutTitular: '',
        metodoPagoPreferido: 'TRANSFERENCIA',
      });
      cargar();
      setTimeout(() => setExito(''), 3000);
    } catch {
      setError('Error al activar la organización.');
    } finally {
      setGuardando(false);
    }
  };

  // ── Handlers: Causas Sociales ─────────────────────────────

  const handleCrearCausa = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await crearCausaActiva({
        ...formCausa,
        idOrganizacion: Number(formCausa.idOrganizacion),
      });
      setExito('Causa social creada y activada.');
      setShowModalCausa(false);
      cargar();
      setTimeout(() => setExito(''), 3000);
    } catch {
      setError('Error al crear causa.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="grow py-4 dashboard-admin-main">
        <Container fluid="lg">
          <h2 className="fw-bold mb-4">Panel Administrador</h2>

          {exito && (
            <Alert variant="success" dismissible onClose={() => setExito('')}>
              {exito}
            </Alert>
          )}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Estadísticas */}
          <Row className="g-3 mb-4">
            <Col xs={6} lg={3}>
              <StatCard
                icon={Building2}
                titulo="Organizaciones"
                valor={organizaciones.length}
                variant="brand"
                cargando={cargando}
              />
            </Col>
            <Col xs={6} lg={3}>
              <StatCard
                icon={Heart}
                titulo="Causas activas"
                valor={causas.length}
                variant="pink"
                cargando={cargando}
              />
            </Col>
            <Col xs={6} lg={3}>
              <StatCard
                icon={TrendingUp}
                titulo="Total donado"
                valor={fmt(totalRecaudado)}
                variant="success"
                cargando={cargando}
              />
            </Col>
            <Col xs={6} lg={3}>
              <StatCard
                icon={ShoppingBag}
                titulo="Total ventas"
                valor={fmt(ventasStats.reduce((sum, s) => sum + Number(s.ingresos || 0), 0))}
                variant="warning"
                cargando={cargandoVentas}
              />
            </Col>
          </Row>

          {/* Tabs de gestión */}
          <Tab.Container defaultActiveKey="organizaciones">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <Nav variant="tabs" className="border-0">
                  <Nav.Item>
                    <Nav.Link eventKey="organizaciones">
                      Organizaciones
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="causas">Causas Sociales</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="ventas">Ventas</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="usuarios">Usuarios</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>
              <Card.Body>
                <Tab.Content>
                  {/* ORGANIZACIONES */}
                  <Tab.Pane eventKey="organizaciones">
                    <div className="d-flex justify-content-between mb-3">
                      <h5 className="fw-bold mb-0">
                        Organizaciones beneficiarias
                      </h5>
                      <Button
                        size="sm"
                        onClick={() => setShowModalOrg(true)}
                        variant="primary"
                      >
                        <Plus size={16} /> Nueva
                      </Button>
                    </div>
                    {cargando ? (
                      <div className="text-center py-4">
                        <Spinner className="spinner-ticketti" />
                      </div>
                    ) : (
                      <Table hover responsive size="sm">
                        <thead className="table-light">
                          <tr>
                            <th>Nombre</th>
                            <th>RUT</th>
                            <th>Email</th>
                            <th>Estado</th>
                            <th>Total donado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {organizaciones.map((o) => (
                            <tr key={o.idOrganizacion}>
                              <td className="fw-semibold">{o.nombre}</td>
                              <td className="text-muted small">{o.rut}</td>
                              <td className="text-muted small">{o.email}</td>
                              <td>
                                <Badge
                                  bg={
                                    o.estado === 'ACTIVA'
                                      ? 'success'
                                      : 'secondary'
                                  }
                                >
                                  {o.estado}
                                </Badge>
                              </td>
                              <td className="fw-semibold text-success">
                                {fmt(totales[o.idOrganizacion])}
                              </td>
                              <td>
                                {o.estado === 'PENDIENTE' && (
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => abrirModalActivar(o)}
                                  >
                                    Activar
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </Tab.Pane>

                  {/* CAUSAS */}
                  <Tab.Pane eventKey="causas">
                    <div className="d-flex justify-content-between mb-3">
                      <h5 className="fw-bold mb-0">Causas sociales activas</h5>
                      <Button
                        size="sm"
                        onClick={() => setShowModalCausa(true)}
                        variant="primary"
                      >
                        <Plus size={16} /> Nueva causa
                      </Button>
                    </div>
                    {cargando ? (
                      <div className="text-center py-4">
                        <Spinner className="spinner-ticketti" />
                      </div>
                    ) : (
                      <Table hover responsive size="sm">
                        <thead className="table-light">
                          <tr>
                            <th>Causa</th>
                            <th>Organización</th>
                            <th>Objetivo</th>
                            <th>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {causas.map((c) => (
                            <tr key={c.idCausa}>
                              <td className="fw-semibold">{c.nombre}</td>
                              <td className="text-muted small">
                                {c.nombreOrganizacion || '—'}
                              </td>
                              <td className="text-muted small">
                                {c.objetivoMonto
                                  ? fmt(c.objetivoMonto)
                                  : 'Sin límite'}
                              </td>
                              <td>
                                <Badge
                                  bg={
                                    c.estado === 'ACTIVA'
                                      ? 'success'
                                      : 'secondary'
                                  }
                                >
                                  {c.estado}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </Tab.Pane>

                  {/* VENTAS */}
                  <Tab.Pane eventKey="ventas">
                    {cargandoVentas ? (
                      <div className="text-center py-4"><Spinner className="spinner-ticketti" /></div>
                    ) : ventasStats.length === 0 ? (
                      <p className="text-muted text-center py-4">No hay ventas registradas.</p>
                    ) : (
                      <Table hover responsive size="sm">
                        <thead className="table-light">
                          <tr>
                            <th>Evento</th>
                            <th>Organizador</th>
                            <th>Vendidas</th>
                            <th>Reembolsadas</th>
                            <th>Ingresos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ventasStats.map(s => (
                            <tr key={s.eventoId}>
                              <td className="fw-semibold">{s.nombre}</td>
                              <td>{s.organizador}</td>
                              <td>{s.entradasVendidas}</td>
                              <td>{s.entradasReembolsadas || 0}</td>
                              <td className="fw-semibold text-success">{fmt(s.ingresos)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="table-light fw-bold">
                          <tr>
                            <td>Total</td>
                            <td></td>
                            <td>{ventasStats.reduce((a, s) => a + Number(s.entradasVendidas || 0), 0)}</td>
                            <td>{ventasStats.reduce((a, s) => a + Number(s.entradasReembolsadas || 0), 0)}</td>
                            <td className="text-success">{fmt(ventasStats.reduce((a, s) => a + Number(s.ingresos || 0), 0))}</td>
                          </tr>
                        </tfoot>
                      </Table>
                    )}
                  </Tab.Pane>

                  {/* USUARIOS — placeholder MSUsuarios */}
                  <Tab.Pane eventKey="usuarios">
                    <DashAdminUsuarios />
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Card>
          </Tab.Container>
        </Container>
      </main>

      {/* Modal nueva organización (admin: crea y activa de inmediato) */}
      <Modal
        show={showModalOrg}
        onHide={() => setShowModalOrg(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Nueva Organización</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCrearOrg}>
            <Row className="g-3">
              {[
                'nombre',
                'rut',
                'email',
                'telefono',
                'direccion',
                'banco',
                'tipoCuenta',
                'numeroCuenta',
                'titularCuenta',
                'rutTitular',
              ].map((f) => (
                <Col md={6} key={f}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-capitalize">
                      {f}
                    </Form.Label>
                    <Form.Control
                      type={f === 'email' ? 'email' : 'text'}
                      value={formOrg[f]}
                      onChange={(e) =>
                        setFormOrg({ ...formOrg, [f]: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
              ))}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Método de pago
                  </Form.Label>
                  <Form.Select
                    value={formOrg.metodoPagoPreferido}
                    onChange={(e) =>
                      setFormOrg({
                        ...formOrg,
                        metodoPago: e.target.value,
                      })
                    }
                  >
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="DEPOSITO">Depósito</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button
                variant="outline-secondary"
                onClick={() => setShowModalOrg(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando} variant="primary">
                {guardando ? (
                  <Spinner size="sm" className="spinner-ticketti" />
                ) : (
                  'Guardar'
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal activar organización (admin completa datos bancarios de una PENDIENTE) */}
      <Modal
        show={showModalActivar}
        onHide={() => setShowModalActivar(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Activar Organización</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small">
            Completa los datos bancarios de{' '}
            <strong>{orgAActivar?.nombre}</strong> para activarla.
          </p>
          <Form onSubmit={handleActivarOrg}>
            <Row className="g-3">
              {['banco', 'tipoCuenta', 'numeroCuenta', 'titularCuenta', 'rutTitular'].map(
                (f) => (
                  <Col md={6} key={f}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-capitalize">
                        {f}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={formActivar[f]}
                        onChange={(e) =>
                          setFormActivar({ ...formActivar, [f]: e.target.value })
                        }
                        required
                      />
                    </Form.Group>
                  </Col>
                )
              )}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Método de pago</Form.Label>
                  <Form.Select
                    value={formActivar.metodoPagoPreferido}
                    onChange={(e) =>
                      setFormActivar({ ...formActivar, metodoPagoPreferido: e.target.value })
                    }
                  >
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="DEPOSITO">Depósito</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button
                variant="outline-secondary"
                onClick={() => setShowModalActivar(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando} variant="success">
                {guardando ? (
                  <Spinner size="sm" className="spinner-ticketti" />
                ) : (
                  'Activar'
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal nueva causa (admin: crea y activa de inmediato) */}
      <Modal
        show={showModalCausa}
        onHide={() => setShowModalCausa(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Nueva Causa Social</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCrearCausa}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Organización</Form.Label>
              <Form.Select
                value={formCausa.idOrganizacion}
                onChange={(e) =>
                  setFormCausa({ ...formCausa, idOrganizacion: e.target.value })
                }
                required
              >
                <option value="">Selecciona una organización</option>
                {organizaciones.map((o) => (
                  <option key={o.idOrganizacion} value={o.idOrganizacion}>
                    {o.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Nombre de la causa
              </Form.Label>
              <Form.Control
                value={formCausa.nombre}
                onChange={(e) =>
                  setFormCausa({ ...formCausa, nombre: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formCausa.descripcion}
                onChange={(e) =>
                  setFormCausa({ ...formCausa, descripcion: e.target.value })
                }
              />
            </Form.Group>
            <Row className="g-2">
              <Col>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Objetivo (CLP)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={formCausa.objetivoMonto}
                    onChange={(e) =>
                      setFormCausa({
                        ...formCausa,
                        objetivoMonto: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label className="fw-semibold">Fecha inicio</Form.Label>
                  <Form.Control
                    type="date"
                    value={formCausa.fechaInicio}
                    onChange={(e) =>
                      setFormCausa({
                        ...formCausa,
                        fechaInicio: e.target.value,
                      })
                    }
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button
                variant="outline-secondary"
                onClick={() => setShowModalCausa(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando} variant="primary">
                {guardando ? (
                  <Spinner size="sm" className="spinner-ticketti" />
                ) : (
                  'Guardar'
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Footer />
    </div>
  );
};

export default DashboardAdmin;
