import { CheckCircle, CreditCard, Heart } from 'lucide-react';
import { useState } from 'react';
import { Alert, Badge, Button, Card, Form } from 'react-bootstrap';
import '../styles/components/ResumenCarrito.css';

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

/**
 * Componente que muestra el resumen del carrito de compras
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.resumen - Objeto con los datos del resumen del carrito
 * @param {Function} props.onCheckout - Función para manejar el checkout
 * @param {boolean} props.loading - Indica si está cargando
 * @param {boolean} [props.isGuest=false] - Indica si el usuario es un invitado (no autenticado)
 */
const ResumenCarrito = ({ resumen, onCheckout, loading, isGuest = false }) => {
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
    if (!causaSocialId && !isGuest) {
      setError('Por favor selecciona una causa social');
      return;
    }
    if (cantidadTotal === 0) {
      setError('El carrito esta vacio');
      return;
    }
    if (onCheckout) {
      onCheckout(isGuest ? null : causaSocialId);
    }
  };

  return (
    <Card className="resumen-carrito-container">
      <Card.Body>
        <div className="resumen-carrito-header">
          <CreditCard className="resumen-carrito-header-icon" size={24} />
          <h4 className="resumen-carrito-titulo">Resumen de Compra</h4>
        </div>

        {error && (
          <Alert variant="danger" className="resumen-carrito-alerta mb-3 d-flex align-items-center">
            <span className="me-2">⚠️</span>
            {error}
          </Alert>
        )}

        {estadoCarrito && (
          <div className="resumen-carrito-estados mb-3">
            <Badge bg={ESTADO_CARRITO_VARIANT[estadoCarrito] || 'secondary'} className="resumen-carrito-estado-badge">
              {estadoCarrito}
            </Badge>
            {estadoPago && (
              <Badge bg="light" text="dark" className="resumen-carrito-estado-badge">
                Pago: {estadoPago}
              </Badge>
            )}
          </div>
        )}

        <div className="resumen-carrito-detalles mb-4">
          <div className="resumen-carrito-fila">
            <span className="resumen-carrito-etiqueta">Subtotal</span>
            <span className="resumen-carrito-valor">{formatearMoneda(subtotal)}</span>
          </div>
          <div className="resumen-carrito-fila">
            <span className="resumen-carrito-etiqueta">Donación (10%)</span>
            <span className="resumen-carrito-valor">{formatearMoneda(donacion)}</span>
          </div>

          <div className="resumen-carrito-donacion">
            <div className="d-flex align-items-start gap-2">
              <Heart className="resumen-carrito-donacion-icon" size={16} />
              <p className="resumen-carrito-donacion-texto mb-0">
                Tu donación ayuda a causas sociales importantes
              </p>
            </div>
          </div>

          <div className="resumen-carrito-total">
            <span className="resumen-carrito-total-etiqueta">Total</span>
            <span className="resumen-carrito-total-valor">{formatearMoneda(total)}</span>
          </div>
        </div>

        {puedePagar && (
          <Form onSubmit={handleSubmit}>
            {!isGuest && (
              <Form.Group className="mb-3">
                <Form.Label className="resumen-carrito-label">
                  <Heart size={16} className="me-2" />
                  Causa Social
                </Form.Label>
                <Form.Select
                  name="causaSocial"
                  value={causaSocialId}
                  onChange={(e) => setCausaSocialId(e.target.value)}
                  required
                  disabled={loading || esReservado}
                  className="resumen-carrito-select"
                >
                  <option value="">Selecciona una causa social...</option>
                  <option value="1">🎓 Fundación Educación para Todos</option>
                  <option value="2">🐾 Asociación Protección Animal</option>
                  <option value="3">🌱 Organización Medio Ambiente</option>
                  <option value="4">🏥 Fundación Salud Comunitaria</option>
                </Form.Select>
              </Form.Group>
            )}

            <Button
              type="submit"
              variant="primary"
              className={`resumen-carrito-boton-checkout ${isGuest ? 'resumen-carrito-boton-checkout-invitado' : ''}`}
              disabled={loading || esReservado || (!isGuest && !causaSocialId)}
            >
              {isGuest ? (
                <>
                  <span className="me-2">🔐</span>
                  Inicia sesión para comprar
                </>
              ) : esReservado ? (
                <>
                  <span className="me-2">⏰</span>
                  Reserva activa
                </>
              ) : loading ? (
                <>
                  <span className="me-2">⏳</span>
                  Procesando...
                </>
              ) : (
                <>
                  <span className="me-2">💳</span>
                  Ir a Pagar
                </>
              )}
            </Button>
          </Form>
        )}

        {yaPagado && (
          <Alert variant="success" className="resumen-carrito-alerta text-center mb-0 d-flex align-items-center justify-content-center">
            <CheckCircle className="me-2" size={20} />
            <span>Pago confirmado</span>
          </Alert>
        )}

        {cantidadTotal > 0 && (
          <div className="resumen-carrito-footer">
            <Badge bg="light" text="dark" className="resumen-carrito-items-badge">
              {cantidadTotal} {cantidadTotal === 1 ? 'entrada' : 'entradas'}
            </Badge>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ResumenCarrito;
