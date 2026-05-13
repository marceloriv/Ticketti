import { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Nav, Tab,
  Table, Badge, Spinner, Alert, Button
} from 'react-bootstrap';
import { User, Mail, ShoppingBag, Heart, RefreshCw } from 'lucide-react';
import Header from '@components/layout/Header';
import Footer from '@components/layout/Footer';
import { useAuth } from '@hooks/useAuth';
import api from '@services/api';

const BRAND_COLOR = '#5ad4e6';

const Placeholder = ({ ms, descripcion, altura = 200 }) => (
  <div className="d-flex flex-column align-items-center justify-content-center text-center rounded"
    style={{ height: altura, border: '2px dashed #dee2e6', background: '#fafafa' }}>
    <p className="text-muted fw-semibold mb-1">🔧 Pendiente — {ms}</p>
    <p className="text-muted small mb-0">{descripcion}</p>
  </div>
);

const TIPO_LABELS = {
  CONFIRMACION_COMPRA: 'Confirmación',
  RECOMENDACION: 'Recomendación',
  DEVOLUCION: 'Devolución',
  RECORDATORIO_EVENTO: 'Recordatorio',
};

const ESTADO_VARIANT = {
  ENVIADO: 'success', PENDIENTE: 'warning',
  FALLIDO: 'danger', CANCELADO: 'secondary',
};

const formatFecha = (f) => f
  ? new Intl.DateTimeFormat('es-CL', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }).format(new Date(f))
  : '—';

const PerfilCliente = () => {
  const { usuario } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const idUsuario = usuario?.id || localStorage.getItem('idUsuario');

  const cargarNotificaciones = useCallback(async () => {
    if (!idUsuario) return;
    setCargando(true);
    setError('');
    try {
      const res = await api.get(`/notificaciones/historial/${idUsuario}`);
      setNotificaciones(res.data || []);
    } catch {
      setError('No se pudieron cargar las notificaciones.');
    } finally {
      setCargando(false);
    }
  }, [idUsuario]);

  useEffect(() => { cargarNotificaciones(); }, [cargarNotificaciones]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 py-4" style={{ background: '#f8f9fa' }}>
        <Container fluid="lg">

          {/* Cabecera del perfil */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="d-flex align-items-center gap-4 p-4">
              <div style={{
                background: `${BRAND_COLOR}20`, borderRadius: '50%',
                width: 72, height: 72, display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <User size={36} style={{ color: BRAND_COLOR }} />
              </div>
              <div>
                <h4 className="fw-bold mb-1">{usuario?.nombre || 'Mi perfil'}</h4>
                <Badge style={{ background: BRAND_COLOR, color: '#000' }}>CLIENTE</Badge>
              </div>
            </Card.Body>
          </Card>

          {/* Tabs */}
          <Tab.Container defaultActiveKey="notificaciones">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <Nav variant="tabs" className="border-0">
                  <Nav.Item>
                    <Nav.Link eventKey="notificaciones" className="d-flex align-items-center gap-2">
                      <Mail size={16} /> Mis Correos
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="compras" className="d-flex align-items-center gap-2">
                      <ShoppingBag size={16} /> Mis Compras
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="donaciones" className="d-flex align-items-center gap-2">
                      <Heart size={16} /> Mis Donaciones
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="perfil" className="d-flex align-items-center gap-2">
                      <User size={16} /> Editar Perfil
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>
              <Card.Body>
                <Tab.Content>

                  {/* NOTIFICACIONES — tuyo */}
                  <Tab.Pane eventKey="notificaciones">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="fw-bold mb-0">Historial de correos</h5>
                      <Button variant="outline-secondary" size="sm"
                        onClick={cargarNotificaciones}
                        className="d-flex align-items-center gap-1">
                        <RefreshCw size={14} /> Actualizar
                      </Button>
                    </div>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {cargando ? (
                      <div className="text-center py-4"><Spinner style={{ color: BRAND_COLOR }} /></div>
                    ) : notificaciones.length === 0 ? (
                      <Alert variant="info">No tienes notificaciones todavía.</Alert>
                    ) : (
                      <Table hover responsive size="sm">
                        <thead className="table-light">
                          <tr><th>Tipo</th><th>Asunto</th><th>Estado</th><th>Fecha</th></tr>
                        </thead>
                        <tbody>
                          {notificaciones.map(n => (
                            <tr key={n.idNotificacion}>
                              <td><Badge bg="light" text="dark" style={{ borderLeft: `3px solid ${BRAND_COLOR}` }}>{TIPO_LABELS[n.tipo] || n.tipo}</Badge></td>
                              <td className="text-muted small">{n.asunto}</td>
                              <td><Badge bg={ESTADO_VARIANT[n.estado] || 'secondary'}>{n.estado}</Badge></td>
                              <td className="text-muted small">{formatFecha(n.fechaEnvio)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </Tab.Pane>

                  {/* COMPRAS — placeholder MSCarrito */}
                  <Tab.Pane eventKey="compras">
                    <Placeholder
                      ms="MSCarrito"
                      descripcion="Historial de compras del usuario — GET /api/v1/Carrito/listar (Marcelo)"
                      altura={250}
                    />
                  </Tab.Pane>

                  {/* DONACIONES — placeholder MSDonaciones */}
                  <Tab.Pane eventKey="donaciones">
                    <Placeholder
                      ms="MSDonaciones"
                      descripcion="Donaciones del usuario — GET /api/donaciones/usuario/{id}"
                      altura={250}
                    />
                  </Tab.Pane>

                  {/* PERFIL — placeholder MSUsuarios */}
                  <Tab.Pane eventKey="perfil">
                    <Placeholder
                      ms="MSUsuarios"
                      descripcion="Editar datos del perfil — PUT /api/v1/usuarios/{id} (Ingrid)"
                      altura={250}
                    />
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

export default PerfilCliente;