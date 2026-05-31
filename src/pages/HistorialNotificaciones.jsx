import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Table,
  Badge,
  Spinner,
  Alert,
  Button,
} from 'react-bootstrap';
import { Mail, RefreshCw } from 'lucide-react';
import Header from '@components/layout/Header';
import Footer from '@components/layout/Footer';
import api from '@services/api';
import { COLOR_MARCA } from '@utils/constantes';

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
      <main className="flex-grow-1 py-5">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-2">
              <Mail size={28} style={{ color: COLOR_MARCA }} />
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
              <Spinner animation="border" style={{ color: COLOR_MARCA }} />
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
                        style={{ borderLeft: `3px solid ${COLOR_MARCA}` }}
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
