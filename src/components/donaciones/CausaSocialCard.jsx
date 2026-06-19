import { Heart, Target, CalendarDays, ImageOff } from 'lucide-react';
import PropTypes from 'prop-types';
import { Badge, Card, Button } from 'react-bootstrap';

const DEFAULT_IMAGE = '/assets/hero.png';

const estadoVariant = {
	ACTIVA: 'success',
	PENDIENTE: 'warning',
	INACTIVA: 'secondary',
};

const CausaSocialCard = ({ causa, onVerDetalle, imagePlaceholder = DEFAULT_IMAGE }) => {
	const item = causa ?? {};
	const imagen = item.imagenUrl || imagePlaceholder;

	return (
		<Card className="h-100 border-0 shadow-sm donaciones-card">
			<div className="position-relative overflow-hidden">
				<Card.Img
					variant="top"
					src={imagen}
					alt={item.nombre || 'Causa social'}
					className="w-100"
					style={{ height: '180px', objectFit: 'cover' }}
				/>
				{!item.imagenUrl && (
					<Badge bg="dark" className="position-absolute top-0 start-0 m-3">
						<ImageOff size={12} className="me-1" />
						Sin imagen
					</Badge>
				)}
				<Badge
					bg={estadoVariant[item.estado] || 'secondary'}
					className="position-absolute top-0 end-0 m-3"
				>
					{item.estado || 'SIN ESTADO'}
				</Badge>
			</div>

			<Card.Body className="p-4 d-flex flex-column">
				<div className="d-flex align-items-center gap-2 mb-2">
					<Heart size={20} className="text-ticketti" />
					<Card.Title className="fw-bold mb-0 fs-6">
						{item.nombre || 'Causa social sin nombre'}
					</Card.Title>
				</div>

				<p className="text-muted small mb-2">
					{item.descripcion || 'Sin descripción disponible.'}
				</p>

				<p className="text-muted small mb-1">
					<CalendarDays size={14} className="me-1" />
					Inicio: {item.fechaInicio || '—'}
				</p>
				<p className="text-muted small mb-3">
					<Target size={14} className="me-1" />
					Objetivo:{' '}
					{item.objetivoMonto
						? new Intl.NumberFormat('es-CL', {
								style: 'currency',
								currency: 'CLP',
								minimumFractionDigits: 0,
							}).format(item.objetivoMonto)
						: '—'}
				</p>

				<div className="mt-auto">
					<Button
						variant="outline-primary"
						size="sm"
						className="w-100 btn-outline-ticketti"
						onClick={() => onVerDetalle?.(item)}
					>
						Ver detalle
					</Button>
				</div>
			</Card.Body>
		</Card>
	);
};

CausaSocialCard.propTypes = {
	causa: PropTypes.shape({
		imagenUrl: PropTypes.string,
		nombre: PropTypes.string,
		descripcion: PropTypes.string,
		fechaInicio: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
		objetivoMonto: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		estado: PropTypes.string,
	}),
	onVerDetalle: PropTypes.func,
	imagePlaceholder: PropTypes.string,
};

export default CausaSocialCard;
