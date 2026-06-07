import { RefreshCw, Trash } from 'lucide-react';
import { Alert, Badge, Button, Card, Col, Row } from 'react-bootstrap';
import '../styles/components/ListaEntradasCarrito.css';

const ACCENT_COLOR = '#2CACAD';
const PRECIO_MONEDA = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  minimumFractionDigits: 0,
});

const formatearMoneda = (valor) => PRECIO_MONEDA.format(valor || 0);

/**
 * Componente que muestra una lista de entradas en el carrito
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array|Object} props.entradas - Array de entradas u objeto con propiedad items
 * @param {Function} props.onEliminar - Función para eliminar una entrada
 * @param {Function} props.onRenovar - Función para renovar la reserva
 * @param {boolean} props.puedeRenovar - Indica si se puede renovar la reserva
 * @param {boolean} props.loading - Indica si está cargando
 */
const ListaEntradasCarrito = ({ entradas, onEliminar, onRenovar, puedeRenovar, loading }) => {
  /** Items del carrito (array normalizado) */
  let items = [];
  if (Array.isArray(entradas)) {
    items = entradas;
  } else if (entradas && typeof entradas === 'object') {
    // El resumen usa la clave `items`; acepta ambos nombres.
    items = entradas.items || [];
  }

  if (!items || items.length === 0) {
    return (
      <Alert variant="info" className="text-center">
        Tu carrito está vacío. Agrega entradas para comenzar tu compra.
      </Alert>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {items.map((item, index) => {
        const detalleId = item.detalleId ?? item.idDetalleCarrito ?? item.id;
        const eventoId = item.eventoId ?? item.idEvento;
        const tipoEntrada = item.tipoEntrada ?? item.tipoEntradaNombre ?? 'General';
        const cantidad = item.cantidad ?? 0;
        const precioUnitario = item.precioUnitario ?? item.precio ?? 0;
        const subtotal = precioUnitario * cantidad;
        const eventoNombre = item.eventoNombre ?? item.nombreEvento ?? `Evento #${eventoId}`;
        /** Key único para el elemento (usa detalleId o índice como fallback) */
        const uniqueKey = detalleId || `${eventoId}-${tipoEntrada}-${index}`;

        return (
          <Card key={uniqueKey} className="lista-entradas-ticketti">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={6}>
                  <h6 className="lista-entradas-nombre">{eventoNombre}</h6>
                  <p className="lista-entradas-tipo">{tipoEntrada}</p>
                  <Badge className="lista-entradas-badge">
                    Cantidad: {cantidad}
                  </Badge>
                </Col>
                <Col md={3} className="text-center">
                  <div className="lista-entradas-precio">{formatearMoneda(precioUnitario)} c/u</div>
                  <div className="lista-entradas-subtotal">Subtotal: {formatearMoneda(subtotal)}</div>
                </Col>
                <Col md={3} className="text-end d-flex flex-column gap-2">
                  <div className="lista-entradas-total">
                    {formatearMoneda(subtotal)}
                  </div>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onEliminar && onEliminar(detalleId, item)}
                    disabled={loading}
                    className="lista-entradas-boton-eliminar"
                  >
                    <Trash size={14} />
                    Eliminar
                  </Button>
                  {onRenovar && puedeRenovar && (
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={onRenovar}
                      disabled={loading}
                      className="lista-entradas-boton-renovar"
                    >
                      <RefreshCw size={14} />
                      Renovar reserva
                    </Button>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
};

export default ListaEntradasCarrito;
