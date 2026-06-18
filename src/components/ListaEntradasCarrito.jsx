import { RefreshCw, Ticket, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge, Button, Card } from 'react-bootstrap';
import { buscarEvento } from '../api/eventosApi';
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
 * Componente interno que representa un único ítem de entrada.
 * Resuelve de forma dinámica los detalles adicionales del evento desde la API de eventos si no están presentes.
 */
const ItemEntradaCarrito = ({
  item,
  index,
  onEliminar,
  onRenovar,
  puedeRenovar,
  loading,
  esCarritoPagado = false,
}) => {
  const [eventInfo, setEventInfo] = useState(null);

  const detalleId = item.detalleId ?? item.idDetalleCarrito ?? item.id;
  const eventoId = item.eventoId ?? item.idEvento;
  const tipoEntrada = item.tipoEntrada ?? item.tipoEntradaNombre ?? 'General';
  const cantidad = item.cantidad ?? 0;
  const precioUnitario = item.precioUnitario ?? item.precio ?? 0;

  // Cargar información faltante del evento desde el microservicio
  useEffect(() => {
    if (!item.eventoNombre || !item.imagenUrl) {
      buscarEvento(eventoId)
        .then((data) => {
          setEventInfo(data);
        })
        .catch((err) => {
          console.warn('[ListaEntradasCarrito] Error cargando info del evento:', err);
        });
    }
  }, [eventoId, item]);

  const eventoNombre = item.eventoNombre ?? eventInfo?.nombre ?? `Evento #${eventoId}`;
  const imagenUrl = item.imagenUrl ?? eventInfo?.imagenUrl ?? 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=300';
  const genero = eventInfo?.genero ?? 'CONCIERTO';
  const fecha = eventInfo?.fecha
    ? new Date(eventInfo.fecha).toLocaleDateString('es-CL', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Fecha por confirmar';
  const recintoNombre = eventInfo?.recinto?.nombre ?? 'Recinto por confirmar';
  const recintoUbicacion = eventInfo?.recinto?.ubicacion ?? 'Ubicación por confirmar';

  return (
    <Card className="lista-entradas-ticketti border-0 shadow-sm mb-3">
      <Card.Body className="p-3">
        <div className="lista-entradas-row d-flex gap-3 position-relative">
          {/* Imagen y Badge de Index */}
          <div className="lista-entradas-media-container">
            <img
              src={imagenUrl}
              alt={eventoNombre}
              className="lista-entradas-img"
            />
            <div className="lista-entradas-index-badge">{index + 1}</div>
          </div>

          {/* Información del Evento */}
          <div className="lista-entradas-info">
            <h6 className="lista-entradas-nombre fw-bold text-dark">
              {eventoNombre}
            </h6>
            <p className="lista-entradas-meta">
              {genero} · {fecha}
            </p>
            <p className="lista-entradas-recinto text-muted small">
              {recintoNombre} ({recintoUbicacion})
            </p>
            <Badge className="lista-entradas-tipo-badge mt-1">
              {tipoEntrada}
            </Badge>

            {/* Controles de Precio y Cantidad en Fila Inferior */}
            <div className="lista-entradas-footer">
              <div className="lista-entradas-precio">
                {formatearMoneda(precioUnitario)}
              </div>
              <div className="lista-entradas-qty-control">
                <span>Cant:</span>
                <div className="d-flex align-items-center gap-2">
                  <span className="lista-entradas-qty-val">{cantidad}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción flotantes en la esquina superior derecha */}
          <div className="d-flex gap-1">
            {onRenovar && puedeRenovar && (
              <Button
                variant="link"
                onClick={onRenovar}
                disabled={loading}
                className="lista-entradas-boton-renovar"
                title="Renovar reserva temporal"
              >
                <RefreshCw size={18} />
              </Button>
            )}
            {!esCarritoPagado && (
              <Button
                variant="link"
                onClick={() => onEliminar && onEliminar(detalleId, item)}
                disabled={loading}
                className="lista-entradas-boton-eliminar"
                title="Eliminar de carrito"
              >
                <Trash size={18} />
              </Button>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

/**
 * Componente que renderiza la lista de entradas agregadas al carrito.
 */
const ListaEntradasCarrito = ({
  entradas,
  onEliminar,
  onRenovar,
  puedeRenovar,
  loading,
  esCarritoPagado = false,
}) => {
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
    <div className="d-flex flex-column">
      {items.map((item, index) => {
        const detalleId = item.detalleId ?? item.idDetalleCarrito ?? item.id;
        const eventoId = item.eventoId ?? item.idEvento;
        const tipoEntrada = item.tipoEntrada ?? item.tipoEntradaNombre ?? 'General';
        const uniqueKey = detalleId || `${eventoId}-${tipoEntrada}-${index}`;

        return (
          <ItemEntradaCarrito
            key={uniqueKey}
            item={item}
            index={index}
            onEliminar={onEliminar}
            onRenovar={onRenovar}
            puedeRenovar={puedeRenovar}
            loading={loading}
            esCarritoPagado={esCarritoPagado}
          />
        );
      })}
    </div>
  );
};

export default ListaEntradasCarrito;
