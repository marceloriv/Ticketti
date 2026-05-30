import { useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import Header from '@components/layout/Header';
import Footer from '@components/layout/Footer';


const BRAND_COLOR = '#5ad4e6';

const contactInfo = [
  {
    icon: '📍',
    title: 'Dirección',
    content: 'Av. Los Conquistadores 1234, Oficina 502\Viña del Mar, Valparaíso, Chile',
  },
  {
    icon: '📞',
    title: 'Teléfonos',
    content: '+56 2 2345 6789\n+56 9 8765 4321',
  },
  {
    icon: '✉️',
    title: 'Email',
    content: 'contacto@ticketti.cl\nsoporte@ticketti.cl',
  },
  {
    icon: '🕒',
    title: 'Horario de Atención',
    content: 'Lunes a Viernes: 9:00 - 20:00 hrs\nSábados: 10:00 - 18:00 hrs',
  },
];

const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    mensaje: '',
  });
  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMensajeError('');
    setMensajeExito('');

    if (!formData.nombre || !formData.correo || !formData.mensaje) {
      setMensajeError('Completa los campos obligatorios antes de enviar.');
      return;
    }

    setMensajeExito('Tu mensaje fue enviado correctamente. Te contactaremos pronto.');
    setFormData({ nombre: '', correo: '', telefono: '', mensaje: '' });
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-white">
      <Header />
      <main className="flex-grow-1">
        <section
          className="py-5"
          style={{
            background: `linear-gradient(135deg, ${BRAND_COLOR}20 0%, #f8f9fa 55%, #ffffff 100%)`,
          }}
        >
          <Container>
            <Row className="justify-content-center text-center mb-5">
              <Col lg={8}>
                <span
                  className="d-inline-block rounded-pill px-3 py-1 mb-3"
                  style={{ backgroundColor: '#fff', color: BRAND_COLOR, border: `1px solid ${BRAND_COLOR}40` }}
                >
                  Ticketti / Contacto
                </span>
                <h1 className="display-5 fw-bold mb-3">Hablemos de tu próximo evento</h1>
                <p className="lead text-muted mb-0">
                  Escríbenos para soporte, alianzas o consultas sobre entradas y eventos.
                </p>
              </Col>
            </Row>

            <Row className="g-4 align-items-start">
              <Col lg={5}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="p-4 p-lg-5">
                    <h2 className="h4 fw-bold mb-4">Información de contacto</h2>

                    {contactInfo.map((item) => (
                      <div key={item.title} className="d-flex gap-3 mb-4">
                        <div
                          className="flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle"
                          style={{ width: 42, height: 42, backgroundColor: `${BRAND_COLOR}20` }}
                        >
                          <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                        </div>
                        <div>
                          <h3 className="h6 fw-semibold mb-1">{item.title}</h3>
                          <p className="text-muted mb-0" style={{ whiteSpace: 'pre-line' }}>
                            {item.content}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="pt-2">
                      <h3 className="h6 fw-semibold mb-2">Síguenos</h3>
                      <div className="d-flex flex-wrap gap-2">
                        {['Facebook', 'Instagram', 'LinkedIn'].map((red) => (
                          <Button key={red} variant="outline-secondary" size="sm" href="#">
                            {red}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={7}>
                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-4 p-lg-5">
                    <h2 className="h4 fw-bold mb-4">Envíanos un mensaje</h2>

                    {mensajeError && (
                      <Alert variant="danger" className="mb-4">
                        {mensajeError}
                      </Alert>
                    )}

                    {mensajeExito && (
                      <Alert variant="success" className="mb-4">
                        {mensajeExito}
                      </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                      <Row className="g-3">
                        <Col md={6}>
                          <Form.Group controlId="nombre">
                            <Form.Label>Nombre completo *</Form.Label>
                            <Form.Control
                              type="text"
                              value={formData.nombre}
                              onChange={handleChange}
                              placeholder="Tu nombre"
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group controlId="correo">
                            <Form.Label>Correo electrónico *</Form.Label>
                            <Form.Control
                              type="email"
                              value={formData.correo}
                              onChange={handleChange}
                              placeholder="tu@email.com"
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group controlId="telefono">
                            <Form.Label>Teléfono</Form.Label>
                            <Form.Control
                              type="tel"
                              value={formData.telefono}
                              onChange={handleChange}
                              placeholder="+56 9 1234 5678"
                            />
                          </Form.Group>
                        </Col>

                        <Col xs={12}>
                          <Form.Group controlId="mensaje">
                            <Form.Label>Mensaje *</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={6}
                              value={formData.mensaje}
                              onChange={handleChange}
                              placeholder="Cuéntanos en qué podemos ayudarte"
                            />
                          </Form.Group>
                        </Col>

                        <Col xs={12}>
                          <Button
                            type="submit"
                            className="px-4"
                            style={{ backgroundColor: BRAND_COLOR, borderColor: BRAND_COLOR, color: '#000' }}
                          >
                            Enviar mensaje
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contacto;
