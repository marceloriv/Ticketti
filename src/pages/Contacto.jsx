import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import {
  Clock,
  HelpCircle,
  Mail,
  MapPin,
  Phone,
  Send,
} from 'lucide-react';
import { useState } from 'react';
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';
import '@/styles/components/Contacto.css';
/**
 * Página de contacto de la plataforma Ticketti.
 * Proporciona un formulario para consultas y muestra información de contacto
 * del soporte junto con una sección de Preguntas Frecuentes (FAQ).
 *
 * @returns {React.JSX.Element} Componente de la página de contacto.
 */
const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: '',
  });
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setEnviado(true);
    setFormData({ nombre: '', email: '', asunto: '', mensaje: '' });
    setTimeout(() => setEnviado(false), 3000);
  };
  return (
    <div className="contacto-page">
      <Header />
      {/* Hero Section */}
      <section className="contacto-hero-ticketti text-center py-5">
        <div className="container py-3">
          <h1>Contacto</h1>
          <p>
            ¿Tienes dudas o necesitas ayuda? Nuestro equipo está a tu disposición
            para resolver cualquier consulta.
          </p>
        </div>
      </section>
      {/* Main Content Section */}
      <section className="py-5 grow">
        <div className="container">
          <div className="row g-4 mb-5">
            {/* Contact Information & Hours */}
            <div className="col-lg-5">
              <div className="d-flex flex-column gap-4 h-100">
                <div>
                  <h2 className="fw-bold mb-3" style={{ color: '#0f1b3d' }}>
                    Ponte en contacto con nosotros
                  </h2>
                  <p className="text-muted">
                    Completa el formulario y nos pondremos en contacto contigo lo
                    antes posible para ayudarte con tus entradas, eventos o soporte.
                  </p>
                </div>
                {/* Contact Info Card */}
                <div className="contacto-info-card p-4 shadow-sm">
                  <h5 className="fw-bold mb-3 text-dark">Información de contacto</h5>
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="contacto-icon-wrapper">
                        <Mail size={18} />
                      </div>
                      <div>
                        <span className="text-muted small d-block">Escríbenos</span>
                        <strong className="text-dark">contacto@ticketti.org</strong>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <div className="contacto-icon-wrapper">
                        <Phone size={18} />
                      </div>
                      <div>
                        <span className="text-muted small d-block">Llámanos</span>
                        <strong className="text-dark">+56 9 1234 5678</strong>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <div className="contacto-icon-wrapper">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <span className="text-muted small d-block">Ubicación</span>
                        <strong className="text-dark">Santiago, Chile</strong>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Working Hours Card */}
                <div className="contacto-info-card p-4 shadow-sm">
                  <h5 className="fw-bold mb-3 text-dark">Horario de atención</h5>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="contacto-icon-wrapper">
                      <Clock size={18} />
                    </div>
                    <div>
                      <span className="text-muted small d-block">Lunes a Viernes</span>
                      <strong className="text-dark">9:00 - 18:00 hrs</strong>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <div className="contacto-icon-wrapper">
                      <Clock size={18} />
                    </div>
                    <div>
                      <span className="text-muted small d-block">Sábado y Domingo</span>
                      <strong className="text-dark">10:00 - 14:00 hrs</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Contact Form Card */}
            <div className="col-lg-7">
              <div className="contacto-form-card p-4 p-md-5 shadow-sm h-100">
                <h3 className="fw-bold mb-4 text-dark">Enviar Mensaje</h3>
                {enviado && (
                  <Alert variant="success" className="mb-3">
                    Mensaje enviado correctamente. Nos contactaremos pronto.
                  </Alert>
                )}
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group controlId="contactoNombre">
                        <Form.Label>Nombre completo</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Ej. Juan Pérez"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group controlId="contactoEmail">
                        <Form.Label>Correo electrónico</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="tu@email.com"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3" controlId="contactoAsunto">
                    <Form.Label>Asunto</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Motivo de tu mensaje"
                      name="asunto"
                      value={formData.asunto}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-4" controlId="contactoMensaje">
                    <Form.Label>Mensaje</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      placeholder="Escribe aquí tu consulta en detalle..."
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <div className="text-end">
                    <Button type="submit" className="btn-enviar-contacto d-flex align-items-center gap-2 ms-auto">
                      <Send size={16} />
                      Enviar mensaje
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
          {/* FAQs Section */}
          <div className="pt-4">
            <h2 className="text-center faq-section-title">Preguntas Frecuentes</h2>
            <div className="row g-4">
              <div className="col-md-4">
                <div className="faq-card p-4 shadow-sm">
                  <div className="card-body p-0">
                    <h5 className="card-title">
                      <HelpCircle size={18} className="faq-icon" />
                      ¿Cómo creo un evento?
                    </h5>
                    <p className="card-text">
                      Regístrate como organizador, completa tu perfil y utiliza la
                      herramienta de creación de eventos desde tu dashboard.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="faq-card p-4 shadow-sm">
                  <div className="card-body p-0">
                    <h5 className="card-title">
                      <HelpCircle size={18} className="faq-icon" />
                      ¿Los eventos son gratuitos?
                    </h5>
                    <p className="card-text">
                      Depende del organizador. Algunos eventos son gratuitos y
                      otros tienen costo de entrada que debe ser especificado al
                      crear el evento.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="faq-card p-4 shadow-sm">
                  <div className="card-body p-0">
                    <h5 className="card-title">
                      <HelpCircle size={18} className="faq-icon" />
                      ¿Cómo compro entradas?
                    </h5>
                    <p className="card-text">
                      Explora la lista de eventos, selecciona las entradas que
                      desees añadir a tu carrito y realiza el pago con tu medio preferido.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};
export default Contacto;
