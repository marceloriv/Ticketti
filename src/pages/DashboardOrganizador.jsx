import Footer from '@components/layout/Footer';
import Header from '@components/layout/Header';
import { useAuth } from '@hooks/useAuth';
import { BarChart2, Calendar, Plus, TrendingUp } from 'lucide-react';
import { Button, Card, Col, Container, Nav, Row, Tab } from 'react-bootstrap';

// Placeholder visible para el equipo
const Placeholder = ({ ms, descripcion, altura = 200 }) => (
  <div
    className={`d-flex flex-column align-items-center justify-content-center text-center rounded dashboard-organizador-placeholder dashboard-organizador-placeholder--${altura}`}
  >
    <p className="text-muted fw-semibold mb-1">🔧 Pendiente — {ms}</p>
    <p className="text-muted small mb-0">{descripcion}</p>
  </div>
);

const DashboardOrganizador = () => {
  const { usuario } = useAuth();

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
            {/* MSEventos: conectar botón con modal/página de crear evento */}
            <Button className="d-flex align-items-center gap-2 btn-ticketti">
              <Plus size={18} /> Crear evento
            </Button>
          </div>

          {/* Estadísticas — todas placeholders MSEventos/MSCarrito */}
          <Row className="g-3 mb-4">
            <Col xs={6} md={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="d-flex align-items-center gap-3 p-4">
                  <div className="dashboard-stat-icon dashboard-stat-icon-brand">
                    <Calendar size={22} />
                  </div>
                  <div>
                    <p className="text-muted small mb-1">Mis eventos</p>
                    <p className="text-muted small fst-italic mb-0">
                      Pendiente MSEventos
                    </p>
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
                    <p className="text-muted small fst-italic mb-0">
                      Pendiente MSCarrito
                    </p>
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
                    <p className="text-muted small fst-italic mb-0">
                      Pendiente MSCarrito
                    </p>
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
                    <p className="text-muted small mb-1">
                      Donaciones generadas
                    </p>
                    <p className="text-muted small fst-italic mb-0">
                      Pendiente MSDonaciones
                    </p>
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
                  <Nav.Item>
                    <Nav.Link eventKey="eventos">Mis Eventos</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="ventas">Ventas por Evento</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="reportes">Reportes</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>
              <Card.Body>
                <Tab.Content>
                  <Tab.Pane eventKey="eventos">
                    <Placeholder
                      ms="MSEventos"
                      descripcion="Listar eventos del organizador — GET /api/v1/eventos/listarEventos?organizadorId={id}"
                      altura={250}
                    />
                  </Tab.Pane>
                  <Tab.Pane eventKey="ventas">
                    <Placeholder
                      ms="MSCarrito"
                      descripcion="Ventas por evento — endpoint de MSCarrito por implementar"
                      altura={250}
                    />
                  </Tab.Pane>
                  <Tab.Pane eventKey="reportes">
                    <Placeholder
                      ms="MSEventos + MSCarrito"
                      descripcion="Reportes de asistencia e ingresos por evento"
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

export default DashboardOrganizador;
