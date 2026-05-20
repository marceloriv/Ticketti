import { Card, Button, Row, Col, Badge, Alert } from 'react-bootstrap';
import { Trash, RefreshCw } from 'lucide-react';

const ACCENT_COLOR = '#2CACAD';
const PRECIO_MONEDA = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  minimumFractionDigits: 0,
});

const formatearMoneda = (valor) => PRECIO_MONEDA.format(valor || 0);

const ListaEntradasCarrito = ({ entradas, onEliminar, onRenovar, puedeRenovar, loading }) => {
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
      {items.map((item) => {
        const detalleId = item.detalleId ?? item.idDetalleCarrito ?? item.id;
        const eventoId = item.eventoId ?? item.idEvento;
        const tipoEntrada = item.tipoEntrada ?? item.tipoEntradaNombre ?? 'General';
        const cantidad = item.cantidad ?? 0;
        const precioUnitario = item.precioUnitario ?? item.precio ?? 0;
        const subtotal = precioUnitario * cantidad;
        const eventoNombre = item.eventoNombre ?? item.nombreEvento ?? `Evento #${eventoId}`;

        return (
          <Card key={detalleId} className="shadow-sm" style={{ borderColor: ACCENT_COLOR }}>
            <Card.Body className="bg-light">
              <Row className="align-items-center">
                <Col md={6}>
                  <h6 className="fw-bold mb-1">{eventoNombre}</h6>
                  <p className="text-muted mb-1 small">{tipoEntrada}</p>
                  <Badge bg="light" text="dark" className="border">
                    Cantidad: {cantidad}
                  </Badge>
                </Col>
                <Col md={3} className="text-center">
                  <div className="fw-semibold">{formatearMoneda(precioUnitario)} c/u</div>
                  <div className="text-muted small">Subtotal: {formatearMoneda(subtotal)}</div>
                </Col>
                <Col md={3} className="text-end d-flex flex-column gap-2">
                  <div className="fw-bold" style={{ color: ACCENT_COLOR }}>
                    {formatearMoneda(subtotal)}
                  </div>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onEliminar && onEliminar(detalleId)}
                    disabled={loading}
                    className="d-flex align-items-center gap-1 ms-auto"
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
                      className="d-flex align-items-center gap-1 ms-auto"
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
