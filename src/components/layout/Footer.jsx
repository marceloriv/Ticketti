import { Container, Row, Col } from 'react-bootstrap';
import { Ticket, Mail, Phone, MapPin, Globe } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const enlacesRapidos = [
    { nombre: 'Inicio', href: '#home' },
    { nombre: 'Eventos', href: '#events' },
    { nombre: 'Sobre Nosotros', href: '#about' },
    { nombre: 'Contacto', href: '#contact' },
    { nombre: 'Términos y Condiciones', href: '#terms' },
    { nombre: 'Política de Privacidad', href: '#privacy' },
  ];

  const redesSociales = [
    { nombre: 'Facebook', href: '#' },
    { nombre: 'Twitter', href: '#' },
    { nombre: 'Instagram', href: '#' },
    { nombre: 'LinkedIn', href: '#' },
  ];

  return (
    <footer className="bg-dark text-white py-5 mt-auto">
      <Container>
        <Row className="g-4">
          <Col md={4}>
            <div className="mb-3 d-flex align-items-center gap-2">
              <Ticket size={28} className="footer-brand-icon" />
              <span className="fw-bold fs-4">Ticketti</span>
            </div>
            <p className="text-white-50 mb-4">
              Tu plataforma de confianza para la compra de entradas a los
              mejores eventos. Con cada compra, apoyas causas sociales que
              transforman vidas.
            </p>
            <div className="d-flex gap-3">
              {redesSociales.map((red) => (
                <a
                  key={red.nombre}
                  href={red.href}
                  className="text-white-50 text-decoration-none d-flex align-items-center gap-1 footer-social-link"
                  aria-label={red.nombre}
                >
                  <Globe size={16} />
                  {red.nombre}
                </a>
              ))}
            </div>
          </Col>

          <Col md={4}>
            <h5 className="fw-bold mb-3 footer-heading-ticketti">
              Contacto
            </h5>
            <ul className="list-unstyled">
              <li className="mb-3 d-flex align-items-start">
                <MapPin
                  size={18}
                  className="me-2 mt-1 shrink-0 footer-contact-icon"
                />
                <span className="text-white-50">
                  Av. Los Conquistadores 1234, Oficina 502
                  <br />
                  Providencia, Santiago, Chile
                </span>
              </li>
              <li className="mb-3 d-flex align-items-center">
                <Phone
                  size={18}
                  className="me-2 shrink-0 footer-contact-icon"
                />
                <span className="text-white-50">+56 2 2345 6789</span>
              </li>
              <li className="mb-3 d-flex align-items-center">
                <Mail
                  size={18}
                  className="me-2 shrink-0 footer-contact-icon"
                />
                <span className="text-white-50">contacto@ticketti.cl</span>
              </li>
            </ul>
          </Col>

          <Col md={4}>
            <h5 className="fw-bold mb-3 footer-heading-ticketti">
              Enlaces
            </h5>
            <ul className="list-unstyled">
              {enlacesRapidos.map((enlace) => (
                <li key={enlace.nombre} className="mb-2">
                  <a
                    href={enlace.href}
                    className="text-white-50 text-decoration-none footer-quick-link"
                  >
                    {enlace.nombre}
                  </a>
                </li>
              ))}
            </ul>
          </Col>
        </Row>

        <hr className="my-4 border-secondary" />

        <Row>
          <Col className="text-center text-white-50">
            <p className="mb-0">
              &copy; {currentYear} Ticketti. Todos los derechos reservados.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
