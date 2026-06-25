import api from '@api/api';
import Footer from '@components/layout/Footer';
import Header from '@components/layout/Header';
import { Mail, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Container,
  Spinner,
  Table,
} from 'react-bootstrap';

const TIPO_LABELS = {
  CONFIRMACION_COMPRA: 'Confirmación de compra',
  RECOMENDACION: 'Recomendación',
  DEVOLUCION: 'Devolución',
  RECORDATORIO_EVENTO: 'Recordatorio',
};

const ESTADO_VARIANT = {
  ENVIADO: 'success',
  PENDIENTE: 'warning',
  FALLIDO: 'danger',
  CANCELADO: 'secondary',
};

const formatFecha = (fecha) => {
  if (!fecha) return '—';
  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(fecha));
};

const HistorialNotificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Obtener idUsuario del token guardado en localStorage
  const obtenerIdUsuario = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.sub || null;
    } catch {
      return null;
    }
  };

  const cargar = useCallback(async () => {
    const idUsuario = obtenerIdUsuario();
    if (!idUsuario) {
      setError('Debes iniciar sesión para ver tu historial.');
      setCargando(false);
      return;
    }
    setCargando(true);
    setError(null);
    try {
      const response = await api.get(`/notificaciones/historial/${idUsuario}`);
      setNotificaciones(response.data || []);
    } catch {
      setError('No se pudo cargar el historial de notificaciones.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="grow py-5">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-2">
              <Mail size={28} className="historial-notificaciones-icon" />
              <h2 className="fw-bold mb-0">Mis Notificaciones</h2>
            </div>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={cargar}
              className="d-flex align-items-center gap-2"
            >
              <RefreshCw size={16} /> Actualizar
            </Button>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          {cargando ? (
            <div className="text-center py-5">
              <Spinner
                animation="border"
                className="historial-notificaciones-spinner"
              />
            </div>
          ) : notificaciones.length === 0 ? (
            <Alert variant="info">
              No tienes notificaciones registradas todavía.
            </Alert>
          ) : (
            <Table hover responsive className="shadow-sm rounded">
              <thead className="table-light">
                <tr>
                  <th>Tipo</th>
                  <th>Asunto</th>
                  <th>Estado</th>
                  <th>Fecha envío</th>
                </tr>
              </thead>
              <tbody>
                {notificaciones.map((n) => (
                  <tr key={n.idNotificacion}>
                    <td>
                      <Badge
                        bg="light"
                        text="dark"
                        className="historial-notificaciones-badge"
                      >
                        {TIPO_LABELS[n.tipo] || n.tipo}
                      </Badge>
                    </td>
                    <td className="text-muted small">{n.asunto}</td>
                    <td>
                      <Badge bg={ESTADO_VARIANT[n.estado] || 'secondary'}>
                        {n.estado}
                      </Badge>
                    </td>
                    <td className="text-muted small">
                      {formatFecha(n.fechaEnvio)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default HistorialNotificaciones;
