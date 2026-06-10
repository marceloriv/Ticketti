import { RefreshCw, Ticket, Trash } from 'lucide-react';
import { Badge, Button, Card } from 'react-bootstrap';
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
      <Card className="lista-entradas-vacio">
        <Card.Body className="text-center py-5">
          <Ticket size={48} className="text-muted mb-3" />
          <h5 className="text-muted">Tu carrito está vacío</h5>
          <p className="text-muted small">Agrega entradas para comenzar tu compra.</p>
        </Card.Body>
      </Card>
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
              <div className="lista-entradas-row">
                <div className="lista-entradas-col lista-entradas-col-info">
                  <div className="d-flex align-items-center gap-3">
                    <div className="lista-entradas-icono">
                      <Ticket size={24} className="text-primary" />
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="lista-entradas-nombre">{eventoNombre}</h6>
                      <div className="d-flex align-items-center gap-2">
                        <Badge className="lista-entradas-badge">
                          {tipoEntrada}
                        </Badge>
                        <Badge bg="light" text="dark" className="lista-entradas-cantidad-badge">
                          x{cantidad}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lista-entradas-col lista-entradas-col-precio">
                  <div className="lista-entradas-precio-container">
                    <div className="lista-entradas-precio">{formatearMoneda(precioUnitario)}</div>
                    <small className="text-muted">c/u</small>
                  </div>
                </div>
                <div className="lista-entradas-col lista-entradas-col-total">
                  <div className="d-flex flex-column align-items-end gap-2">
                    <div className="lista-entradas-total">
                      {formatearMoneda(subtotal)}
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => onEliminar && onEliminar(detalleId, item)}
                        disabled={loading}
                        className="lista-entradas-boton-eliminar"
                      >
                        <Trash size={14} />
                      </Button>
                      {onRenovar && puedeRenovar && (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={onRenovar}
                          disabled={loading}
                          className="lista-entradas-boton-renovar"
                          title="Renovar reserva"
                        >
                          <RefreshCw size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
};

export default ListaEntradasCarrito;
