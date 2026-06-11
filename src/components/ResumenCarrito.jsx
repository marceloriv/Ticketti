import { CheckCircle, CreditCard, Heart } from 'lucide-react';
import { useState } from 'react';
import { Alert, Badge, Button, Card, Form } from 'react-bootstrap';
import '../styles/components/ResumenCarrito.css';

/**
 * Formateador de moneda local para pesos chilenos.
 */
const PRECIO_MONEDA = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  minimumFractionDigits: 0,
});

/**
 * Convierte un número a formato de pesos chilenos.
 *
 * @param {number} valor - Valor a formatear.
 * @returns {string} Valor formateado.
 */
const formatearMoneda = (valor) => PRECIO_MONEDA.format(valor || 0);

/** Mapeo de variantes de badges bootstrap según el estado del carrito */
const ESTADO_CARRITO_VARIANT = {
  CREADO: 'secondary',
  RESERVADO: 'warning',
  PAGADO: 'success',
  FALLIDO: 'danger',
  CANCELADO: 'dark',
  REEMBOLSADO: 'info',
};

/**
 * Componente que muestra el panel con el desglose final y el checkout del carrito de compras.
 * Permite seleccionar la causa benéfica a la cual destinar el 10% del monto total de la entrada.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {Object} props.resumen - Estructura de resumen que contiene subtotal, donación, total e ítems.
 * @param {Function} props.onCheckout - Callback invocado para ejecutar la orden de pago.
 * @param {boolean} props.loading - Indica si hay peticiones activas.
 * @param {boolean} [props.isGuest=false] - Define si el flujo corresponde a un invitado.
 * @returns {React.JSX.Element} Panel de resumen del carrito.
 */
const ResumenCarrito = ({ resumen, onCheckout, loading, isGuest = false }) => {
  const [causaSocialId, setCausaSocialId] = useState('');
  const [error, setError] = useState('');

  const items = resumen?.items || [];
  const subtotal = resumen?.subtotal || 0;
  const donacion = resumen?.montoDonacion ?? subtotal * 0.1;
  const total = resumen?.total ?? subtotal + donacion;
  const cantidadTotal = items.reduce(
    (sum, item) => sum + (item.cantidad || 0),
    0
  );
  const estadoCarrito = resumen?.estadoCarrito;
  const estadoPago = resumen?.estadoPago;

  const esReservado = estadoCarrito === 'RESERVADO';
  const yaPagado = estadoCarrito === 'PAGADO';
  const puedePagar = !yaPagado && cantidadTotal > 0 && !loading;

  /**
   * Valida la selección de causa social (para autenticados) antes de invocar el checkout.
   *
   * @param {React.FormEvent} e - Evento de envío del formulario.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!causaSocialId && !isGuest) {
      setError('Por favor selecciona una causa social');
      return;
    }
    if (cantidadTotal === 0) {
      setError('El carrito está vacío');
      return;
    }
    if (onCheckout) {
      onCheckout(isGuest ? null : causaSocialId);
    }
  };

  return (
    <Card className="resumen-carrito-container border-0 shadow-sm">
      <Card.Body className="p-4">
        <div className="resumen-carrito-header d-flex align-items-center gap-2 mb-4 pb-3 border-bottom">
          <CreditCard
            className="resumen-carrito-header-icon text-primary"
            size={24}
          />
          <h5 className="resumen-carrito-titulo fw-bold mb-0 text-dark">
            Resumen de Compra
          </h5>
        </div>

        {error && (
          <Alert
            variant="danger"
            className="resumen-carrito-alerta mb-3 py-2 small"
          >
            ⚠️ {error}
          </Alert>
        )}

        {estadoCarrito && (
          <div className="resumen-carrito-estados d-flex gap-2 mb-4 flex-wrap">
            <Badge
              bg={ESTADO_CARRITO_VARIANT[estadoCarrito] || 'secondary'}
              className="px-3 py-2 rounded-pill"
            >
              Carrito: {estadoCarrito}
            </Badge>
            {estadoPago && (
              <Badge
                bg="light"
                text="dark"
                className="border px-3 py-2 rounded-pill"
              >
                Pago: {estadoPago}
              </Badge>
            )}
          </div>
        )}

        <div className="resumen-carrito-detalles p-3 bg-light rounded-3 mb-4">
          <div className="resumen-carrito-fila d-flex justify-content-between mb-2">
            <span className="resumen-carrito-etiqueta text-muted small">
              Subtotal
            </span>
            <span className="resumen-carrito-valor fw-semibold">
              {formatearMoneda(subtotal)}
            </span>
          </div>
          <div className="resumen-carrito-fila d-flex justify-content-between mb-2">
            <span className="resumen-carrito-etiqueta text-muted small">
              Donación social (10%)
            </span>
            <span className="resumen-carrito-valor fw-semibold text-primary">
              {formatearMoneda(donacion)}
            </span>
          </div>

          <div className="resumen-carrito-donacion-info p-3 bg-white border-start border-primary border-3 rounded-2 my-3">
            <div className="d-flex align-items-start gap-2">
              <Heart className="text-primary mt-1 flex-shrink-0" size={16} />
              <p
                className="mb-0 text-muted small"
                style={{ lineHeight: '1.3' }}
              >
                El 10% de tu entrada financia directamente la causa que elijas,
                sin costo adicional para ti.
              </p>
            </div>
          </div>

          <div className="resumen-carrito-total d-flex justify-content-between align-items-center pt-3 border-top border-2">
            <span className="resumen-carrito-total-etiqueta fw-bold text-dark">
              Total
            </span>
            <span className="resumen-carrito-total-valor fw-bold text-primary fs-4">
              {formatearMoneda(total)}
            </span>
          </div>
        </div>

        {puedePagar && (
          <Form onSubmit={handleSubmit}>
            {!isGuest && (
              <Form.Group className="mb-4">
                <Form.Label className="resumen-carrito-label fw-bold text-dark small">
                  Elige una causa benéfica
                </Form.Label>
                <Form.Select
                  name="causaSocial"
                  value={causaSocialId}
                  onChange={(e) => setCausaSocialId(e.target.value)}
                  required
                  disabled={loading || esReservado}
                  className="resumen-carrito-select py-2"
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
              className={`resumen-carrito-boton-checkout w-100 py-3 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 ${
                isGuest ? 'resumen-carrito-boton-checkout-invitado' : ''
              }`}
              disabled={loading || esReservado || (!isGuest && !causaSocialId)}
            >
              {isGuest ? (
                <>
                  <span>Iniciar sesión para comprar</span>
                </>
              ) : esReservado ? (
                <>
                  <span>Reserva activa</span>
                </>
              ) : loading ? (
                <>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <span>Proceder al pago</span>
                </>
              )}
            </Button>
          </Form>
        )}

        {yaPagado && (
          <Alert
            variant="success"
            className="text-center mb-0 d-flex align-items-center justify-content-center gap-2 py-3 rounded-3 shadow-sm"
          >
            <CheckCircle size={20} />
            <span className="fw-bold">Pago confirmado ✓</span>
          </Alert>
        )}

        {cantidadTotal > 0 && (
          <div className="resumen-carrito-footer text-center mt-3 pt-3 border-top">
            <small className="text-muted">
              Tienes {cantidadTotal}{' '}
              {cantidadTotal === 1 ? 'entrada' : 'entradas'} en tu orden.
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ResumenCarrito;
