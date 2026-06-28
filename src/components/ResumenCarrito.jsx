import { ArrowRight, CheckCircle, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Form } from 'react-bootstrap';
import { getCausasActivas } from '@api/donacionesApi';
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
 * @returns {string} Valor de la moneda formateado.
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
 * La donación del 10% es OBLIGATORIA — no es opcional. Se calcula sobre el subtotal.
 */
const ResumenCarrito = ({ resumen, onCheckout, loading, isGuest = false, esCarritoPagado = false }) => {
  const [causaSocialId, setCausaSocialId] = useState('');
  const [error, setError] = useState('');
  const [causas, setCausas] = useState([]);
  const [cargandoCausas, setCargandoCausas] = useState(false);

  useEffect(() => {
    const cargarCausas = async () => {
      setCargandoCausas(true);
      try {
        const data = await getCausasActivas();
        setCausas(data || []);
      } catch {
        // Silencioso
      } finally {
        setCargandoCausas(false);
      }
    };
    cargarCausas();
  }, []);

  // Sincronizar causa social desde el resumen (por ejemplo, en reservas activas)
  useEffect(() => {
    if (resumen?.causaSocialId) {
      setCausaSocialId(String(resumen.causaSocialId));
    } else {
      setCausaSocialId('');
    }
  }, [resumen?.causaSocialId]);

  const items = resumen?.items || [];
  const subtotal = resumen?.subtotal || 0;

  // La donación siempre es el 10% del subtotal — es obligatoria en toda compra
  const donacion = subtotal * 0.1;

  // Total siempre incluye la donación obligatoria del 10%
  const total = subtotal + donacion;

  const cantidadTotal = items.reduce(
    (sum, item) => sum + (item.cantidad || 0),
    0
  );
  const estadoCarrito = resumen?.estadoCarrito;
  const estadoPago = resumen?.estadoPago;

  const esReservado = estadoCarrito === 'RESERVADO';
  const yaPagado = estadoCarrito === 'PAGADO';
  const pagoPendiente = estadoPago === 'PENDIENTE';
  // Puede pagar si no está pagado, tiene items, no está cargando, y si está reservado el pago debe estar pendiente
  const puedePagar = !yaPagado && cantidadTotal > 0 && !loading && (!esReservado || pagoPendiente);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!isGuest && !causaSocialId) {
      setError('Por favor selecciona una causa social para destinar tu donación');
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
    <div className="resumen-carrito-container card border-0 shadow-sm p-4">
      {/* Banner superior */}
      <div className="resumen-carrito-banner"></div>

      <h5 className="resumen-carrito-titulo fw-bold text-dark mb-3">
        Resumen de Compra
      </h5>

      {error && (
        <Alert variant="danger" className="resumen-carrito-alerta mb-3 py-2 small">
          ⚠️ {error}
        </Alert>
      )}

      {estadoCarrito && (
        <div className="resumen-carrito-estados d-flex gap-2 mb-3 flex-wrap">
          <Badge
            bg={ESTADO_CARRITO_VARIANT[estadoCarrito] || 'secondary'}
            className="px-2 py-1"
          >
            Carro: {estadoCarrito}
          </Badge>
          {estadoPago && (
            <Badge bg="light" text="dark" className="border px-2 py-1">
              Pago: {estadoPago}
            </Badge>
          )}
        </div>
      )}

      {/* Breakdown de precios */}
      <div className="resumen-carrito-breakdown">
        <div className="resumen-carrito-fila">
          <span className="resumen-carrito-etiqueta">Subtotal</span>
          <span className="resumen-carrito-valor">{formatearMoneda(subtotal)}</span>
        </div>
        <div className="resumen-carrito-fila">
          <span className="resumen-carrito-etiqueta">Cargo por Despacho</span>
          <span className="resumen-carrito-valor text-success">Gratis</span>
        </div>

        <div className="resumen-carrito-divider"></div>

        {/* ── Donación obligatoria del 10% ─────────────────────────────── */}
        <div className="resumen-carrito-seccion-donacion">
          <div className="resumen-carrito-donacion-header">
            <Heart size={16} className="resumen-carrito-donacion-icono" />
            <h6 className="resumen-carrito-donacion-titulo mb-0">
              Donación a Causa Social
              <span className="resumen-carrito-donacion-badge">Obligatoria</span>
            </h6>
          </div>

          <div className="resumen-carrito-donacion-monto">
            <div className="resumen-carrito-fila">
              <span className="resumen-carrito-etiqueta">10% del subtotal</span>
              <span className="resumen-carrito-valor resumen-carrito-donacion-valor">
                {formatearMoneda(donacion)}
              </span>
            </div>
            <p className="resumen-carrito-donacion-descripcion">
              Cada compra incluye una donación del 10% para apoyar causas
              sociales. Selecciona a quién deseas destinar tu aporte:
            </p>
          </div>

          {!isGuest && (
            <Form.Select
              value={causaSocialId}
              onChange={(e) => setCausaSocialId(e.target.value)}
              disabled={loading || esReservado || esCarritoPagado || cargandoCausas}
              className="resumen-carrito-select-causa"
              required
            >
              <option value="">{cargandoCausas ? 'Cargando causas...' : 'Seleccionar causa social...'}</option>
              {causas.map(c => (
                <option key={c.idCausa} value={c.idCausa}>{c.nombre}</option>
              ))}
            </Form.Select>
          )}
        </div>

        <div className="resumen-carrito-divider"></div>

        {/* Total Final (incluye donación obligatoria) */}
        <div className="resumen-carrito-total-row">
          <span
            className="resumen-carrito-total-etiqueta"
            style={{ fontSize: '1.25rem' }}
          >
            Total Final
          </span>
          <span
            className="resumen-carrito-total-valor"
            style={{ fontSize: '1.45rem' }}
          >
            {formatearMoneda(total)}
          </span>
        </div>
      </div>

      {puedePagar && (
        <Form onSubmit={handleSubmit}>
          <Button
            type="submit"
            disabled={loading || (esReservado && !pagoPendiente) || (!isGuest && !causaSocialId)}
            className="resumen-carrito-btn-checkout"
          >
            {isGuest ? (
              <span>Iniciar sesión para comprar</span>
            ) : loading ? (
              <span>Procesando...</span>
            ) : (
              <>
                <span>Proceder al Pago Seguro</span>
                <ArrowRight size={18} />
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
    </div>
  );
};

export default ResumenCarrito;
