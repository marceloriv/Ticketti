import { Building2, Eye, FileText, MapPin, Phone, Mail } from 'lucide-react';
import PropTypes from 'prop-types';
import { Button, Card, Badge } from 'react-bootstrap';

const DEFAULT_IMAGE = '/assets/hero.png';

const estadoVariant = {
  ACTIVA: 'success',
  PENDIENTE: 'warning',
  INACTIVA: 'secondary',
};

const OrganizacionCard = ({
  organizacion,
  onVerDetalle,
  onEditar,
  onActivar,
  onDesactivar,
  imagePlaceholder = DEFAULT_IMAGE,
}) => {
  const org = organizacion ?? {};
  const imagen = org.imagenUrl || imagePlaceholder;

  return (
    <Card className="h-100 border-0 shadow-sm donaciones-card">
      <div className="position-relative overflow-hidden">
        <Card.Img
          variant="top"
          src={imagen}
          alt={org.nombre || 'Organización'}
          className="w-100"
          style={{ height: '180px', objectFit: 'cover' }}
        />
        <Badge
          bg={estadoVariant[org.estado] || 'secondary'}
          className="position-absolute top-0 end-0 m-3"
        >
          {org.estado || 'SIN ESTADO'}
        </Badge>
      </div>

      <Card.Body className="p-4 d-flex flex-column">
        <div className="d-flex align-items-center gap-2 mb-3">
          <Building2 size={22} className="text-ticketti" />
          <Card.Title className="fw-bold mb-0 fs-6">
            {org.nombre || 'Organización sin nombre'}
          </Card.Title>
        </div>

        <p className="text-muted small mb-1">
          <FileText size={14} className="me-1" />
          RUT: {org.rut || '—'}
        </p>
        <p className="text-muted small mb-1">
          <Mail size={14} className="me-1" />
          {org.email || '—'}
        </p>
        <p className="text-muted small mb-1">
          <Phone size={14} className="me-1" />
          {org.telefono || '—'}
        </p>
        <p className="text-muted small mb-3">
          <MapPin size={14} className="me-1" />
          {org.direccion || '—'}
        </p>

        {org.documentoConvenio && (
          <p className="text-muted small mb-3">
            Documento: {org.documentoConvenio}
          </p>
        )}

        <div className="mt-auto d-grid gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            className="d-flex align-items-center justify-content-center gap-2 btn-outline-ticketti"
            onClick={() => onVerDetalle?.(org)}
          >
            <Eye size={16} /> Ver detalle
          </Button>

          {(onEditar || onActivar || onDesactivar) && (
            <div className="d-flex gap-2">
              {onEditar && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="flex-fill"
                  onClick={() => onEditar?.(org)}
                >
                  Editar
                </Button>
              )}

              {org.estado === 'PENDIENTE' && onActivar && (
                <Button
                  variant="success"
                  size="sm"
                  className="flex-fill"
                  onClick={() => onActivar?.(org)}
                >
                  Activar
                </Button>
              )}

              {org.estado === 'ACTIVA' && onDesactivar && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="flex-fill"
                  onClick={() => onDesactivar?.(org)}
                >
                  Desactivar
                </Button>
              )}
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default OrganizacionCard;

OrganizacionCard.propTypes = {
  organizacion: PropTypes.shape({
    imagenUrl: PropTypes.string,
    nombre: PropTypes.string,
    rut: PropTypes.string,
    email: PropTypes.string,
    telefono: PropTypes.string,
    direccion: PropTypes.string,
    documentoConvenio: PropTypes.string,
    estado: PropTypes.string,
  }),
  onVerDetalle: PropTypes.func,
  onEditar: PropTypes.func,
  onActivar: PropTypes.func,
  onDesactivar: PropTypes.func,
  imagePlaceholder: PropTypes.string,
};
