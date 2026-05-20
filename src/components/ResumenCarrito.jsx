import { Card, Button, Form, Alert, Badge } from 'react-bootstrap';
import { useState } from 'react';

const ACCENT_COLOR = '#2CACAD';
const PRECIO_MONEDA = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  minimumFractionDigits: 0,
});

const formatearMoneda = (valor) => PRECIO_MONEDA.format(valor || 0);

const ESTADO_CARRITO_VARIANT = {
  CREADO: 'secondary',
  RESERVADO: 'warning',
  PAGADO: 'success',
  FALLIDO: 'danger',
  CANCELADO: 'dark',
  REEMBOLSADO: 'info',
};

const ResumenCarrito = ({ resumen, onCheckout, loading }) => {
  const [causaSocialId, setCausaSocialId] = useState('');
  const [error, setError] = useState('');

  // El resumen usa `items` (no `entradas`)
  const items = resumen?.items || [];
  const subtotal = resumen?.subtotal || 0;
  const donacion = resumen?.montoDonacion ?? subtotal * 0.1;
  const total = resumen?.total ?? subtotal + donacion;
  const cantidadTotal = items.reduce((sum, item) => sum + (item.cantidad || 0), 0);
  const estadoCarrito = resumen?.estadoCarrito;
  const estadoPago = resumen?.estadoPago;

  const esReservado = estadoCarrito === 'RESERVADO';
  const yaPagado = estadoCarrito === 'PAGADO';
  const puedePagar = !yaPagado && cantidadTotal > 0 && !loading;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!causaSocialId) {
      setError('Por favor selecciona una causa social');
      return;
    }
    if (cantidadTotal === 0) {
      setError('El carrito esta vacio');
      return;
    }
    if (onCheckout) {
      onCheckout(causaSocialId);
    }
  };

  return (
    <Card className="shadow-sm" style={{ borderColor: ACCENT_COLOR }}>
      <Card.Header className="bg-white" style={{ borderBottomColor: ACCENT_COLOR }}>
        <h5 className="mb-0 fw-bold">Resumen de Compra</h5>
      </Card.Header>
      <Card.Body className="bg-light">
        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

        {estadoCarrito && (
          <div className="d-flex gap-2 mb-3 flex-wrap">
            <Badge bg={ESTADO_CARRITO_VARIANT[estadoCarrito] || 'secondary'}>
              {estadoCarrito}
            </Badge>
            {estadoPago && (
              <Badge bg="light" text="dark" className="border">
                Pago: {estadoPago}
              </Badge>
            )}
          </div>
        )}

        <div className="mb-4">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Subtotal:</span>
            <span className="fw-semibold">{formatearMoneda(subtotal)}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Donacion (10%):</span>
            <span className="fw-semibold" style={{ color: ACCENT_COLOR }}>
              {formatearMoneda(donacion)}
            </span>
          </div>
          <hr />
          <div className="d-flex justify-content-between">
            <span className="fw-bold">Total:</span>
            <span className="fw-bold fs-5" style={{ color: ACCENT_COLOR }}>
              {formatearMoneda(total)}
            </span>
          </div>
        </div>

        {puedePagar && (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Causa Social</Form.Label>
              <Form.Select
                name="causaSocial"
                value={causaSocialId}
                onChange={(e) => setCausaSocialId(e.target.value)}
                required
                disabled={loading || esReservado}
              >
                <option value="">Selecciona una causa social...</option>
                <option value="1">Fundacion Educacion para Todos</option>
                <option value="2">Asociacion Proteccion Animal</option>
                <option value="3">Organizacion Medio Ambiente</option>
                <option value="4">Fundacion Salud Comunitaria</option>
              </Form.Select>
            </Form.Group>

            <Button
              type="submit"
              variant="primary"
              className="w-100 fw-semibold"
              style={{ backgroundColor: ACCENT_COLOR, borderColor: ACCENT_COLOR }}
              disabled={loading || esReservado || !causaSocialId}
            >
              {esReservado
                ? 'Reserva activa'
                : loading
                  ? 'Procesando...'
                  : 'Ir a Pagar'}
            </Button>
          </Form>
        )}

        {yaPagado && (
          <Alert variant="success" className="text-center mb-0">
            Pago confirmado ✓
          </Alert>
        )}

        {cantidadTotal > 0 && (
          <div className="mt-3 text-center">
            <small className="text-muted">
              {cantidadTotal} {cantidadTotal === 1 ? 'entrada' : 'entradas'} en el carrito
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ResumenCarrito;
