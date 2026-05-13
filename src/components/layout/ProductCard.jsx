import { Card, Button } from 'react-bootstrap';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BRAND_COLOR = '#5ad4e6';

const formatPrice = (price) => {
  if (price === 0 || price === undefined || price === null) {
    return 'Gratis';
  }
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha por confirmar';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
};

const ProductCard = ({ evento, onComprar }) => {
  const navigate = useNavigate();
  const { imagen, titulo, fecha, ubicacion, precio, id } = evento;

  const handleComprar = () => {
    if (onComprar) {
      onComprar(id);
    }
  };

  return (
    <Card
      className="h-100 border-0 shadow-sm"
      onClick={() => navigate(`/evento/${id}`)}
      style={{
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 8px 25px rgba(90, 212, 230, 0.25)`;
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.transform = '';
      }}
    >
      <div
        className="position-relative overflow-hidden"
        style={{ height: '200px' }}
      >
        <Card.Img
          variant="top"
          src={imagen}
          alt={titulo}
          className="w-100 h-100"
          style={{
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
        />
      </div>

      <Card.Body className="d-flex flex-column p-4">
        <Card.Title className="fw-bold mb-3 fs-5" style={{ lineHeight: '1.3' }}>
          {titulo}
        </Card.Title>

        <div className="mb-2 text-muted d-flex align-items-center">
          <Calendar
            size={16}
            className="me-2 flex-shrink-0"
            style={{ stroke: BRAND_COLOR }}
          />
          <small>{formatDate(fecha)}</small>
        </div>

        <div className="mb-3 text-muted d-flex align-items-center">
          <MapPin
            size={16}
            className="me-2 flex-shrink-0"
            style={{ stroke: BRAND_COLOR }}
          />
          <small className="text-truncate">{ubicacion}</small>
        </div>

        <div className="mt-auto d-flex justify-content-between align-items-center">
          <span className="fw-bold fs-5" style={{ color: '#2c3e50' }}>
            {formatPrice(precio)}
          </span>
          <Button
            variant="primary"
            size="sm"
            onClick={handleComprar}
            className="d-flex align-items-center gap-2"
            style={{
              backgroundColor: BRAND_COLOR,
              borderColor: BRAND_COLOR,
              color: '#000',
              '--bs-btn-hover-bg': '#4ac3d5',
              '--bs-btn-hover-border-color': '#4ac3d5',
            }}
          >
            <Ticket size={16} />
            Comprar
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
