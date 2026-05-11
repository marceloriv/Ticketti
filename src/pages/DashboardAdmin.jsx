import { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Nav, Tab,
  Table, Badge, Button, Spinner, Alert, Modal, Form
} from 'react-bootstrap';
import {
  Building2, Heart, TrendingUp, Users,
  ShoppingBag, Plus, Eye
} from 'lucide-react';
import Header from '@components/layout/Header';
import Footer from '@components/layout/Footer';
import {
  getOrganizaciones, getCausasActivas,
  getTotalPorOrganizacion, crearOrganizacion, crearCausa,
  getCausasPorOrganizacion
} from '@services/donacionesApi';

const BRAND_COLOR = '#5ad4e6';

// Tarjeta de estadística reutilizable
const StatCard = ({ icon: Icon, titulo, valor, color, cargando }) => (
  <Card className="border-0 shadow-sm h-100">
    <Card.Body className="d-flex align-items-center gap-3 p-4">
      <div style={{
        background: `${color}20`, borderRadius: '50%',
        width: 52, height: 52, display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div>
        <p className="text-muted small mb-1">{titulo}</p>
        {cargando
          ? <Spinner size="sm" />
          : <h4 className="fw-bold mb-0">{valor}</h4>}
      </div>
    </Card.Body>
  </Card>
);

// Placeholder para secciones de otros microservicios
const Placeholder = ({ ms, descripcion }) => (
  <Card className="border-0 border-dashed shadow-sm"
    style={{ border: '2px dashed #dee2e6 !important' }}>
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

  const [formOrg, setFormOrg] = useState({
    nombre:'', rut:'', email:'', telefono:'', direccion:'',
    banco:'', tipoCuenta:'', numeroCuenta:'',
    titularCuenta:'', rutTitular:'', metodoPagoPreferido:'TRANSFERENCIA'
  });
  const [formCausa, setFormCausa] = useState({
    idOrganizacion:'', nombre:'', descripcion:'',
    objetivoMonto:'', fechaInicio:''
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
      await Promise.all(orgs.map(async o => {
        try {
          tots[o.idOrganizacion] = await getTotalPorOrganizacion(o.idOrganizacion);
        } catch { tots[o.idOrganizacion] = 0; }
      }));
      setTotales(tots);
    } catch { setError('Error cargando datos.'); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const totalRecaudado = Object.values(totales).reduce((a, b) => a + Number(b || 0), 0);

  const handleCrearOrg = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await crearOrganizacion(formOrg);
      setExito('Organización creada.');
      setShowModalOrg(false);
      cargar();
      setTimeout(() => setExito(''), 3000);
    } catch { setError('Error al crear organización.'); }
    finally { setGuardando(false); }
  };

  const handleCrearCausa = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await crearCausa({ ...formCausa, idOrganizacion: Number(formCausa.idOrganizacion) });
      setExito('Causa social creada.');
      setShowModalCausa(false);
      cargar();
      setTimeout(() => setExito(''), 3000);
    } catch { setError('Error al crear causa.'); }
    finally { setGuardando(false); }
  };

  const fmt = (n) => new Intl.NumberFormat('es-CL', {
    style:'currency', currency:'CLP', minimumFractionDigits:0
  }).format(n || 0);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 py-4" style={{ background:'#f8f9fa' }}>
        <Container fluid="lg">
          <h2 className="fw-bold mb-4">Panel Administrador</h2>

          {exito && <Alert variant="success" dismissible onClose={() => setExito('')}>{exito}</Alert>}
          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

          {/* Estadísticas */}
          <Row className="g-3 mb-4">
            <Col xs={6} lg={3}>
              <StatCard icon={Building2} titulo="Organizaciones" valor={organizaciones.length} color={BRAND_COLOR} cargando={cargando} />
            </Col>
            <Col xs={6} lg={3}>
              <StatCard icon={Heart} titulo="Causas activas" valor={causas.length} color="#e83e8c" cargando={cargando} />
            </Col>
            <Col xs={6} lg={3}>
              <StatCard icon={TrendingUp} titulo="Total donado" valor={fmt(totalRecaudado)} color="#28a745" cargando={cargando} />
            </Col>
            <Col xs={6} lg={3}>
              {/* Placeholder ventas — MSCarrito */}
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="d-flex align-items-center gap-3 p-4">
                  <div style={{ background:'#ffc10720', borderRadius:'50%', width:52, height:52, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <ShoppingBag size={24} style={{ color:'#ffc107' }} />
                  </div>
                  <div>
                    <p className="text-muted small mb-1">Total ventas</p>
                    <p className="text-muted small mb-0 fst-italic">Pendiente MSCarrito</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Tabs de gestión */}
          <Tab.Container defaultActiveKey="organizaciones">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <Nav variant="tabs" className="border-0">
                  <Nav.Item><Nav.Link eventKey="organizaciones">Organizaciones</Nav.Link></Nav.Item>
                  <Nav.Item><Nav.Link eventKey="causas">Causas Sociales</Nav.Link></Nav.Item>
                  <Nav.Item><Nav.Link eventKey="ventas">Ventas</Nav.Link></Nav.Item>
                  <Nav.Item><Nav.Link eventKey="usuarios">Usuarios</Nav.Link></Nav.Item>
                </Nav>
              </Card.Header>
              <Card.Body>
                <Tab.Content>

                  {/* ORGANIZACIONES */}
                  <Tab.Pane eventKey="organizaciones">
                    <div className="d-flex justify-content-between mb-3">
                      <h5 className="fw-bold mb-0">Organizaciones beneficiarias</h5>
                      <Button size="sm" onClick={() => setShowModalOrg(true)}
                        style={{ backgroundColor:BRAND_COLOR, borderColor:BRAND_COLOR, color:'#000' }}>
                        <Plus size={16} /> Nueva
                      </Button>
                    </div>
                    {cargando ? <div className="text-center py-4"><Spinner style={{ color:BRAND_COLOR }} /></div> : (
                      <Table hover responsive size="sm">
                        <thead className="table-light">
                          <tr><th>Nombre</th><th>RUT</th><th>Email</th><th>Estado</th><th>Total donado</th></tr>
                        </thead>
                        <tbody>
                          {organizaciones.map(o => (
                            <tr key={o.idOrganizacion}>
                              <td className="fw-semibold">{o.nombre}</td>
                              <td className="text-muted small">{o.rut}</td>
                              <td className="text-muted small">{o.email}</td>
                              <td><Badge bg={o.estado==='ACTIVA'?'success':'secondary'}>{o.estado}</Badge></td>
                              <td className="fw-semibold" style={{ color:'#28a745' }}>
                                {fmt(totales[o.idOrganizacion])}
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
                      <Button size="sm" onClick={() => setShowModalCausa(true)}
                        style={{ backgroundColor:BRAND_COLOR, borderColor:BRAND_COLOR, color:'#000' }}>
                        <Plus size={16} /> Nueva causa
                      </Button>
                    </div>
                    {cargando ? <div className="text-center py-4"><Spinner style={{ color:BRAND_COLOR }} /></div> : (
                      <Table hover responsive size="sm">
                        <thead className="table-light">
                          <tr><th>Causa</th><th>Organización</th><th>Objetivo</th><th>Estado</th></tr>
                        </thead>
                        <tbody>
                          {causas.map(c => (
                            <tr key={c.idCausa}>
                              <td className="fw-semibold">{c.nombre}</td>
                              <td className="text-muted small">{c.organizacion?.nombre || '—'}</td>
                              <td className="text-muted small">
                                {c.objetivoMonto ? fmt(c.objetivoMonto) : 'Sin límite'}
                              </td>
                              <td><Badge bg={c.estado==='ACTIVA'?'success':'secondary'}>{c.estado}</Badge></td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </Tab.Pane>

                  {/* VENTAS — placeholder MSCarrito */}
                  <Tab.Pane eventKey="ventas">
                    <Placeholder ms="MSCarrito" descripcion="Historial de ventas y pagos — implementar con endpoint de MSCarrito" />
                  </Tab.Pane>

                  {/* USUARIOS — placeholder MSUsuarios */}
                  <Tab.Pane eventKey="usuarios">
                    <Placeholder ms="MSUsuarios" descripcion="Gestión de usuarios y roles — implementar con endpoint de MSUsuarios (Ingrid)" />
                  </Tab.Pane>

                </Tab.Content>
              </Card.Body>
            </Card>
          </Tab.Container>
        </Container>
      </main>

      {/* Modal nueva organización */}
      <Modal show={showModalOrg} onHide={() => setShowModalOrg(false)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title>Nueva Organización</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCrearOrg}>
            <Row className="g-3">
              {['nombre','rut','email','telefono','direccion','banco','tipoCuenta','numeroCuenta','titularCuenta','rutTitular'].map(f => (
                <Col md={6} key={f}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-capitalize">{f}</Form.Label>
                    <Form.Control type={f==='email'?'email':'text'} value={formOrg[f]}
                      onChange={e => setFormOrg({...formOrg,[f]:e.target.value})} required />
                  </Form.Group>
                </Col>
              ))}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Método de pago</Form.Label>
                  <Form.Select value={formOrg.metodoPagoPreferido}
                    onChange={e => setFormOrg({...formOrg,metodoPagoPreferido:e.target.value})}>
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="DEPOSITO">Depósito</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="outline-secondary" onClick={() => setShowModalOrg(false)}>Cancelar</Button>
              <Button type="submit" disabled={guardando}
                style={{ backgroundColor:BRAND_COLOR, borderColor:BRAND_COLOR, color:'#000' }}>
                {guardando ? <Spinner size="sm" /> : 'Guardar'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal nueva causa */}
      <Modal show={showModalCausa} onHide={() => setShowModalCausa(false)} centered>
        <Modal.Header closeButton><Modal.Title>Nueva Causa Social</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCrearCausa}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Organización</Form.Label>
              <Form.Select value={formCausa.idOrganizacion}
                onChange={e => setFormCausa({...formCausa,idOrganizacion:e.target.value})} required>
                <option value="">Selecciona una organización</option>
                {organizaciones.map(o => (
                  <option key={o.idOrganizacion} value={o.idOrganizacion}>{o.nombre}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Nombre de la causa</Form.Label>
              <Form.Control value={formCausa.nombre}
                onChange={e => setFormCausa({...formCausa,nombre:e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Descripción</Form.Label>
              <Form.Control as="textarea" rows={2} value={formCausa.descripcion}
                onChange={e => setFormCausa({...formCausa,descripcion:e.target.value})} />
            </Form.Group>
            <Row className="g-2">
              <Col>
                <Form.Group>
                  <Form.Label className="fw-semibold">Objetivo (CLP)</Form.Label>
                  <Form.Control type="number" value={formCausa.objetivoMonto}
                    onChange={e => setFormCausa({...formCausa,objetivoMonto:e.target.value})} />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label className="fw-semibold">Fecha inicio</Form.Label>
                  <Form.Control type="date" value={formCausa.fechaInicio}
                    onChange={e => setFormCausa({...formCausa,fechaInicio:e.target.value})} required />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="outline-secondary" onClick={() => setShowModalCausa(false)}>Cancelar</Button>
              <Button type="submit" disabled={guardando}
                style={{ backgroundColor:BRAND_COLOR, borderColor:BRAND_COLOR, color:'#000' }}>
                {guardando ? <Spinner size="sm" /> : 'Guardar'}
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