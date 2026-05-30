import { useEffect, useState } from 'react';
import { Container, Row, Col, Alert, Spinner, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import ListaEntradasCarrito from '../components/ListaEntradasCarrito';
import ResumenCarrito from '../components/ResumenCarrito';
import { useCarrito } from '../hooks/useCarrito';
import ProtectedRoute from '../components/ProtectedRoute';

const PaginaCarrito = () => {
  const { carritoId } = useParams();
  const navigate = useNavigate();
  const {
    resumen,
    carritoCreado,
    loading,
    error,
    obtenerResumen,
    eliminarEntrada,
    renovarReserva,
    iniciarCheckout,
    limpiarError,
  } = useCarrito(carritoId);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  useEffect(() => {
    if (carritoId) {
      obtenerResumen().catch(() => {});
    }
  }, [carritoId, obtenerResumen]);

  const handleEliminarEntrada = async (detalleId) => {
    try {
      await eliminarEntrada(detalleId);
    } catch (err) {
      console.error('Error al eliminar entrada:', err);
    }
  };

  const handleRenovarReserva = async () => {
    try {
      await renovarReserva();
    } catch (err) {
      console.error('Error al renovar reserva:', err);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    limpiarError();
    const causaSocialId = e.target?.causaSocial?.value;
    if (!causaSocialId) return;
    try {
      await iniciarCheckout(causaSocialId);
      setCheckoutSuccess(true);
      setTimeout(() => {
        navigate('/perfil');
      }, 2500);
    } catch (err) {
      console.error('Error al iniciar checkout:', err);
    }
  };

  const items = resumen?.items || [];

  if (!carritoId) {
    return (
      <Container className="py-5">
        <Alert variant="warning">No se ha especificado un ID de carrito.</Alert>
      </Container>
    );
  }

  return (
    <ProtectedRoute>
      <Container className="py-5 bg-light" style={{ minHeight: '100vh' }}>
        <h2 className="fw-bold mb-4">Carrito de Compras</h2>

        {error && <Alert variant="danger">{error}</Alert>}

        {checkoutSuccess && (
          <Alert variant="success">
            Reserva iniciada exitosamente. Redirigiendo...
          </Alert>
        )}

        {loading && !resumen ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" style={{ color: '#2CACAD' }}>
              <span className="visually-hidden">Cargando...</span>
            </Spinner>
          </div>
        ) : (
          <Row>
            <Col lg={8} className="mb-4">
              <ListaEntradasCarrito
                entradas={items}
                onEliminar={handleEliminarEntrada}
                onRenovar={handleRenovarReserva}
                puedeRenovar={resumen?.puedeRenovarReserva}
                loading={loading}
              />
            </Col>
            <Col lg={4}>
              <ResumenCarrito
                resumen={resumen || carritoCreado}
                onCheckout={carritoCreado ? handleCheckout : undefined}
                loading={loading}
              />
            </Col>
          </Row>
        )}
      </Container>
    </ProtectedRoute>
  );
};

export default PaginaCarrito;
