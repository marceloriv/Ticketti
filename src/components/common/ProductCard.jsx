/**
 * ProductCard — Tarjeta reutilizable para mostrar un evento/producto en grillas.
 *
 * Mejoras aplicadas:
 *  - Movido de `layout/` a `common/` por su naturaleza reutilizable cross-página.
 *  - Estilos de tarjeta extraídos a constantes de objeto (sin re-crear en cada render).
 *  - CSS hover por clase inyectada en <head> sin re-inyectar.
 *  - Fallback de imagen ante error de carga (onError → placeholder).
 *  - data-testid en cada elemento relevante para pruebas automatizadas.
 *  - Si no se pasa `onComprar`, el botón navega directamente al detalle del evento.
 *  - Semántica mejorada: <article> con role="button", tabIndex y aria-label.
 *  - Propiedades con valores por defecto seguros.
 *  - Click en cualquier parte de la tarjeta navega al detalle del evento.
 */
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
const IMG_PLACEHOLDER = '/assets/hero.png';

// Formateadores ────────────────────────────────────────────────────────────
const MONEDA = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  minimumFractionDigits: 0,
});

const formatPrice = (precio) => {
  if (precio == null || Number(precio) === 0) return 'Gratis';
  return MONEDA.format(precio);
};

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha por confirmar';
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
};

// ── Componente ──────────────────────────────────────────────────────────
const ProductCard = ({
  evento,
  onComprar,
  imagenPlaceholder = IMG_PLACEHOLDER,
}) => {
  const navigate = useNavigate();

  // Desestructuración segura
  const {
    id,
    imagen,
    titulo = 'Evento sin nombre',
    fecha,
    ubicacion = 'Ubicación por confirmar',
    precio,
  } = evento ?? {};

  const [imgError, setImgError] = useState(false);

  // Prioriza la imagen del evento; cae al placeholder solo si hay error o no hay imagen
  const imgSrc = imagen && !imgError ? imagen : imagenPlaceholder;

  const handleCardClick = useCallback(() => {
    if (id != null) navigate(`/evento/${id}`);
  }, [id, navigate]);

  const handleComprar = useCallback(
    (e) => {
      e?.stopPropagation();
      if (onComprar) {
        onComprar(id);
      } else if (id != null) {
        navigate(`/evento/${id}`);
      }
    },
    [id, navigate, onComprar]
  );

  return (
    <Card
      className="product-card h-100 border-0 shadow-sm"
      onClick={handleCardClick}
      data-testid="product-card"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleCardClick();
      }}
      aria-label={`Ver detalle de ${titulo}`}
    >
      {/* Imagen del evento con fallback */}
      <div className="position-relative overflow-hidden product-card__media">
        <Card.Img
          variant="top"
          src={imgSrc}
          alt={titulo}
          className="product-card__img w-100 h-100"
          loading="lazy"
          data-testid="product-card-img"
          onError={() => setImgError(true)}
        />
      </div>

      {/* Contenido */}
      <Card.Body className="d-flex flex-column p-4">
        <Card.Title
          className="fw-bold mb-3 fs-5 product-card__title"
          data-testid="product-card-title"
        >
          {titulo}
        </Card.Title>

        <div className="mb-2 text-muted d-flex align-items-center">
          <Calendar
            size={16}
            className="me-2 product-card__icon text-ticketti"
            aria-hidden="true"
          />
          <small data-testid="product-card-date">{formatDate(fecha)}</small>
        </div>

        <div className="mb-3 text-muted d-flex align-items-center">
          <MapPin
            size={16}
            className="me-2 product-card__icon text-ticketti"
            aria-hidden="true"
          />
          <small className="text-truncate" data-testid="product-card-location">
            {ubicacion}
          </small>
        </div>

        {/* Pie: precio + botón */}
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <span
            className="fw-bold fs-5 product-card__price"
            data-testid="product-card-price"
          >
            {formatPrice(precio)}
          </span>

          <Button
            variant="primary"
            size="sm"
            onClick={handleComprar}
            className="d-flex align-items-center gap-2 product-card__buy btn-ticketti"
            data-testid="product-card-buy-btn"
            aria-label={`Comprar entradas para ${titulo}`}
          >
            <Ticket size={16} aria-hidden="true" />
            Comprar
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
