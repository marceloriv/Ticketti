import { RefreshCw, Ticket, Trash } from 'lucide-react';
import { Badge, Button, Card } from 'react-bootstrap';
import '../styles/components/ListaEntradasCarrito.css';

/**
 * Formateador de moneda local para pesos chilenos.
 */
const PRECIO_MONEDA = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  minimumFractionDigits: 0,
});

/**
 * Formatea un valor numérico a formato CLP.
 *
 * @param {number} valor - Valor numérico.
 * @returns {string} Valor formateado en pesos chilenos.
 */
const formatearMoneda = (valor) => PRECIO_MONEDA.format(valor || 0);

/**
 * Componente que renderiza el desglose en formato lista de los ítems de reserva.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {Array|Object} props.entradas - Lista de entradas a mostrar.
 * @param {Function} props.onEliminar - Handler para procesar la eliminación.
 * @param {Function} [props.onRenovar] - Handler para solicitar la extensión de bloqueo de las entradas.
 * @param {boolean} [props.puedeRenovar=false] - Define si la renovación es elegible actualmente.
 * @param {boolean} props.loading - Indica si hay procesos HTTP ejecutándose en segundo plano.
 * @returns {React.JSX.Element} Lista de elementos del carrito.
 */
const ListaEntradasCarrito = ({
  entradas,
  onEliminar,
  onRenovar,
  puedeRenovar,
  loading,
}) => {
  /** Items normalizados del carrito */
  let items = [];
  if (Array.isArray(entradas)) {
    items = entradas;
  } else if (entradas && typeof entradas === 'object') {
    items = entradas.items || [];
  }

  if (!items || items.length === 0) {
    return (
      <Card className="lista-entradas-vacio border-0 shadow-sm">
        <Card.Body className="text-center py-5">
          <div className="p-3 bg-light rounded-circle d-inline-block mb-3">
            <Ticket size={48} className="text-muted" />
          </div>
          <h5 className="text-dark fw-bold">Tu carrito está vacío</h5>
          <p className="text-muted small mb-0">
            Agrega entradas para comenzar tu compra.
          </p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {items.map((item, index) => {
        const detalleId = item.detalleId ?? item.idDetalleCarrito ?? item.id;
        const eventoId = item.eventoId ?? item.idEvento;
        const tipoEntrada =
          item.tipoEntrada ?? item.tipoEntradaNombre ?? 'General';
        const cantidad = item.cantidad ?? 0;
        const precioUnitario = item.precioUnitario ?? item.precio ?? 0;
        const subtotal = precioUnitario * cantidad;
        const eventoNombre =
          item.eventoNombre ?? item.nombreEvento ?? `Evento #${eventoId}`;
        const uniqueKey = detalleId || `${eventoId}-${tipoEntrada}-${index}`;

        return (
          <Card
            key={uniqueKey}
            className="lista-entradas-ticketti border-0 shadow-sm"
          >
            <Card.Body className="p-4">
              <div className="lista-entradas-row d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                <div className="lista-entradas-col lista-entradas-col-info d-flex align-items-center gap-3">
                  <div className="lista-entradas-icono p-3 rounded-3 bg-light">
                    <Ticket size={24} className="text-primary" />
                  </div>
                  <div>
                    <h6 className="lista-entradas-nombre mb-1 fw-bold text-dark">
                      {eventoNombre}
                    </h6>
                    <div className="d-flex align-items-center gap-2">
                      <Badge
                        bg="light"
                        text="dark"
                        className="border px-2 py-1"
                      >
                        {tipoEntrada}
                      </Badge>
                      <Badge bg="primary" className="px-2 py-1">
                        Cant: {cantidad}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="lista-entradas-col lista-entradas-col-precio text-md-center">
                  <div className="lista-entradas-precio fw-semibold">
                    {formatearMoneda(precioUnitario)}
                  </div>
                  <small className="text-muted">precio unitario</small>
                </div>

                <div className="lista-entradas-col lista-entradas-col-total d-flex align-items-center justify-content-between justify-content-md-end gap-4">
                  <div className="text-end">
                    <div className="lista-entradas-total fw-bold text-primary fs-5">
                      {formatearMoneda(subtotal)}
                    </div>
                    <small className="text-muted d-block">subtotal</small>
                  </div>

                  <div className="d-flex gap-2">
                    {onRenovar && puedeRenovar && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={onRenovar}
                        disabled={loading}
                        className="lista-entradas-boton-renovar p-2 rounded-3"
                        title="Renovar reserva temporal"
                      >
                        <RefreshCw size={16} />
                      </Button>
                    )}
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onEliminar && onEliminar(detalleId, item)}
                      disabled={loading}
                      className="lista-entradas-boton-eliminar p-2 rounded-3"
                      title="Eliminar de carrito"
                    >
                      <Trash size={16} />
                    </Button>
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
