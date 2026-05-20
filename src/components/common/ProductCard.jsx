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
import { Card, Button } from 'react-bootstrap';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';

// ── Constantes ─────────────────────────────────────────────────────────
const BRAND_COLOR    = '#5ad4e6';
const BRAND_HOVER    = '#4ac3d5';
const IMG_HEIGHT     = '200px';
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

// ── Estilos CSS-in-JS (constantes de objeto, reutilizadas en cada render) ──
const CARD_STYLE = {
  transition: 'all 0.3s ease',
  cursor: 'pointer',
};

const IMG_STYLE = {
  objectFit: 'cover',
  transition: 'transform 0.3s ease',
};

// ── CSS de clase (inyectado una sola vez en <head>) ───────────────────────
const CSS_ID = 'product-card-styles';
injectGlobalStyles();

function injectGlobalStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(CSS_ID)) return;
  const el = document.createElement('style');
  el.id = CSS_ID;
  el.textContent = `
    /* ── ProductCard hover effects ── */
    .product-card:hover:not([disabled]) {
      box-shadow: 0 8px 25px rgba(90, 212, 230, 0.25) !important;
      transform: translateY(-4px);
    }
    .product-card__img {
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .product-card:hover .product-card__img {
      transform: scale(1.05);
    }
    .product-card__icon   { flex-shrink: 0; }
    .product-card__price  { white-space: nowrap; }
    .product-card__buy    { white-space: nowrap; }
  `;
  document.head.appendChild(el);
}

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
  const imgSrc = (imagen && !imgError) ? imagen : imagenPlaceholder;

  const handleCardClick = useCallback(() => {
    if (id != null) navigate(`/evento/${id}`);
  }, [id, navigate]);

  const handleComprar = useCallback((e) => {
    e?.stopPropagation();
    if (onComprar) {
      onComprar(id);
    } else if (id != null) {
      navigate(`/evento/${id}`);
    }
  }, [id, navigate, onComprar]);

  return (
    <Card
      className="product-card h-100 border-0 shadow-sm"
      onClick={handleCardClick}
      style={CARD_STYLE}
      data-testid="product-card"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleCardClick();
      }}
      aria-label={`Ver detalle de ${titulo}`}
    >
      {/* Imagen del evento con fallback */}
      <div
        className="position-relative overflow-hidden"
        style={{ height: IMG_HEIGHT }}
      >
        <Card.Img
          variant="top"
          src={imgSrc}
          alt={titulo}
          className="product-card__img w-100 h-100"
          style={IMG_STYLE}
          loading="lazy"
          data-testid="product-card-img"
          onError={() => setImgError(true)}
        />

      </div>

      {/* Contenido */}
      <Card.Body className="d-flex flex-column p-4">
        <Card.Title
          className="fw-bold mb-3 fs-5"
          style={{ lineHeight: '1.3', minHeight: '2.6em' }}
          data-testid="product-card-title"
        >
          {titulo}
        </Card.Title>

        <div className="mb-2 text-muted d-flex align-items-center">
          <Calendar
            size={16}
            className="me-2 product-card__icon"
            style={{ stroke: BRAND_COLOR }}
            aria-hidden="true"
          />
          <small data-testid="product-card-date">{formatDate(fecha)}</small>
        </div>

        <div className="mb-3 text-muted d-flex align-items-center">
          <MapPin
            size={16}
            className="me-2 product-card__icon"
            style={{ stroke: BRAND_COLOR }}
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
            style={{ color: '#2c3e50' }}
            data-testid="product-card-price"
          >
            {formatPrice(precio)}
          </span>

          <Button
            variant="primary"
            size="sm"
            onClick={handleComprar}
            className="d-flex align-items-center gap-2 product-card__buy"
            style={{
              backgroundColor: BRAND_COLOR,
              borderColor: BRAND_COLOR,
              color: '#000',
            }}
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
