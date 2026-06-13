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
  Nav,
  Spinner,
  Tab,
  Table,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';

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

  useEffect(() => {
    cargarNotificaciones();
  }, [cargarNotificaciones]);

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

                  {/* ── DONACIONES ── pendiente MSDonaciones */}
                  <Tab.Pane eventKey="donaciones">
                    <Alert variant="info" className="text-center py-4">
                      <Heart size={24} className="mb-2 text-ticketti" />
                      <p className="mb-1 fw-semibold">
                        Historial de donaciones próximamente
                      </p>
                      <p className="text-muted small mb-0">
                        MSDonaciones — GET
                        /api/donaciones/usuario/&#123;id&#125;
                      </p>
                    </Alert>
                  </Tab.Pane>

                  {/* ── PERFIL ── pendiente MSUsuarios */}
                  <Tab.Pane eventKey="perfil">
                    <Alert variant="info" className="text-center py-4">
                      <User size={24} className="mb-2" />
                      <p className="mb-1 fw-semibold">
                        Edición de perfil próximamente
                      </p>
                      <p className="text-muted small mb-0">
                        MSUsuarios — PUT /api/v1/usuarios/&#123;id&#125;
                      </p>
                    </Alert>
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

  const cargarCompras = useCallback(async () => {
    if (!usuarioId) return;
    setCargando(true);
    setError('');
    try {
      const res = await api.get('/Carrito/listar', {
        headers: { 'X-Usuario-Id': usuarioId },
      });
      const carritos = res.data?.data || [];
      // Filtrar solo carritos con estado PAGADO
      const carritosPagados = carritos.filter(
        (c) =>
          (c.estadoCarrito || c.estado || '').toString().toUpperCase() ===
          'PAGADO'
      );
      // Ordenar por fecha de creación (ascendente) para asignar número secuencial
      const carritosOrdenados = carritosPagados.sort((a, b) => {
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

  // Cada carrito se convierte en una fila con el resumen de ítems
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
                  <Button
                    as={Link}
                    to={`/carrito/${idCarrito}`}
                    variant="outline-primary"
                    size="sm"
                  >
                    Ver detalle
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}

export default PerfilCliente;
