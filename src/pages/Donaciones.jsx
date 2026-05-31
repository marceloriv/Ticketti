import Footer from '@components/layout/Footer';
import Header from '@components/layout/Header';
import {
  crearOrganizacion,
  getCausasPorOrganizacion,
  getOrganizaciones,
  getTotalPorOrganizacion,
} from '@services/donacionesApi';
import { Building2, Eye, Heart, Plus, TrendingUp } from 'lucide-react';
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
  Row,
  Spinner,
  Tab,
  Table,
  Tabs,
} from 'react-bootstrap';

const Donaciones = () => {
  const [organizaciones, setOrganizaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [orgSeleccionada, setOrgSeleccionada] = useState(null);
  const [causas, setCausas] = useState([]);
  const [total, setTotal] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const [form, setForm] = useState({
    nombre: '',
    rut: '',
    direccion: '',
    telefono: '',
    email: '',
    banco: '',
    tipoCuenta: '',
    numeroCuenta: '',
    titularCuenta: '',
    rutTitular: '',
    metodoPagoPreferido: 'TRANSFERENCIA',
  });
  const [showCrear, setShowCrear] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await getOrganizaciones();
      setOrganizaciones(data);
    } catch {
      setError('No se pudieron cargar las organizaciones.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const verDetalle = async (org) => {
    setOrgSeleccionada(org);
    setCargandoDetalle(true);
    setShowModal(true);
    try {
      const [causasData, totalData] = await Promise.all([
        getCausasPorOrganizacion(org.idOrganizacion),
        getTotalPorOrganizacion(org.idOrganizacion),
      ]);
      setCausas(causasData);
      setTotal(totalData);
    } catch {
      setCausas([]);
      setTotal(0);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await crearOrganizacion(form);
      setMensajeExito('Organización creada exitosamente.');
      setShowCrear(false);
      setForm({
        nombre: '',
        rut: '',
        direccion: '',
        telefono: '',
        email: '',
        banco: '',
        tipoCuenta: '',
        numeroCuenta: '',
        titularCuenta: '',
        rutTitular: '',
        metodoPagoPreferido: 'TRANSFERENCIA',
      });
      cargar();
      setTimeout(() => setMensajeExito(''), 4000);
    } catch {
      setError('Error al crear la organización.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="grow py-5">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-2">
              <Heart size={28} className="text-ticketti" />
              <h2 className="fw-bold mb-0">Organizaciones Beneficiarias</h2>
            </div>
            <Button
              onClick={() => setShowCrear(true)}
              className="d-flex align-items-center gap-2 btn-ticketti"
            >
              <Plus size={18} /> Nueva organización
            </Button>
          </div>

          {mensajeExito && <Alert variant="success">{mensajeExito}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          {cargando && (
            <div className="text-center py-5">
              <Spinner animation="border" className="spinner-ticketti" />
            </div>
          )}

          {!cargando && organizaciones.length === 0 && (
            <Alert variant="info">No hay organizaciones registradas aún.</Alert>
          )}

          <Row xs={1} md={2} lg={3} className="g-4">
            {organizaciones.map((org) => (
              <Col key={org.idOrganizacion}>
                <Card
                  className="h-100 border-0 shadow-sm donaciones-card"
                >
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <Building2 size={22} className="text-ticketti" />
                      <Card.Title className="fw-bold mb-0 fs-6">
                        {org.nombre}
                      </Card.Title>
                    </div>
                    <p className="text-muted small mb-1">RUT: {org.rut}</p>
                    <p className="text-muted small mb-1">{org.email}</p>
                    <p className="text-muted small mb-3">{org.telefono}</p>
                    <Badge
                      bg={org.estado === 'ACTIVA' ? 'success' : 'secondary'}
                      className="mb-3"
                    >
                      {org.estado}
                    </Badge>
                    <div className="mt-auto">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="w-100 d-flex align-items-center justify-content-center gap-2 btn-outline-ticketti"
                        onClick={() => verDetalle(org)}
                      >
                        <Eye size={16} /> Ver detalle y causas
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </main>

      {/* Modal detalle organización */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <Building2 size={22} className="text-ticketti" />
            {orgSeleccionada?.nombre}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cargandoDetalle ? (
            <div className="text-center py-4">
              <Spinner animation="border" className="spinner-ticketti" />
            </div>
          ) : (
            <Tabs defaultActiveKey="causas" className="mb-3">
              <Tab eventKey="causas" title="Causas Sociales">
                {causas.length === 0 ? (
                  <Alert variant="info">
                    Esta organización no tiene causas activas.
                  </Alert>
                ) : (
                  <Table hover size="sm">
                    <thead>
                      <tr>
                        <th>Causa</th>
                        <th>Estado</th>
                        <th>Objetivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {causas.map((c) => (
                        <tr key={c.idCausa}>
                          <td>{c.nombre}</td>
                          <td>
                            <Badge
                              bg={
                                c.estado === 'ACTIVA' ? 'success' : 'secondary'
                              }
                            >
                              {c.estado}
                            </Badge>
                          </td>
                          <td>
                            {c.objetivoMonto
                              ? new Intl.NumberFormat('es-CL', {
                                  style: 'currency',
                                  currency: 'CLP',
                                  minimumFractionDigits: 0,
                                }).format(c.objetivoMonto)
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Tab>
              <Tab eventKey="total" title="Monto Recaudado">
                <div className="text-center py-4">
                  <TrendingUp
                    size={48}
                    className="text-ticketti mb-3"
                  />
                  <h3 className="fw-bold">
                    {total !== null
                      ? new Intl.NumberFormat('es-CL', {
                          style: 'currency',
                          currency: 'CLP',
                          minimumFractionDigits: 0,
                        }).format(total)
                      : '—'}
                  </h3>
                  <p className="text-muted">
                    Total recaudado (donaciones aprobadas)
                  </p>
                </div>
              </Tab>
            </Tabs>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal crear organización */}
      <Modal
        show={showCrear}
        onHide={() => setShowCrear(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Nueva Organización</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCrear}>
            <Row className="g-3">
              {[
                { name: 'nombre', label: 'Nombre', required: true },
                { name: 'rut', label: 'RUT', required: true },
                {
                  name: 'email',
                  label: 'Email',
                  required: true,
                  type: 'email',
                },
                { name: 'telefono', label: 'Teléfono', required: true },
                { name: 'direccion', label: 'Dirección', required: true },
                { name: 'banco', label: 'Banco', required: true },
                { name: 'tipoCuenta', label: 'Tipo de Cuenta', required: true },
                { name: 'numeroCuenta', label: 'N° Cuenta', required: true },
                {
                  name: 'titularCuenta',
                  label: 'Titular Cuenta',
                  required: true,
                },
                { name: 'rutTitular', label: 'RUT Titular', required: true },
              ].map((f) => (
                <Col md={6} key={f.name}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">{f.label}</Form.Label>
                    <Form.Control
                      type={f.type || 'text'}
                      name={f.name}
                      value={form[f.name]}
                      onChange={handleFormChange}
                      required={f.required}
                    />
                  </Form.Group>
                </Col>
              ))}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Método de Pago
                  </Form.Label>
                  <Form.Select
                    name="metodoPagoPreferido"
                    value={form.metodoPagoPreferido}
                    onChange={handleFormChange}
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
                onClick={() => setShowCrear(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={guardando}
                className="btn-ticketti"
              >
                {guardando ? <Spinner size="sm" className="spinner-ticketti" /> : 'Guardar'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Footer />
    </div>
  );
};

export default Donaciones;
