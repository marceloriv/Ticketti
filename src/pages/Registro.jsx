import { useState } from 'react';
import { Alert, Button, Card, Col, Container, Row } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const initialFormData = {
  nombre: '',
  correo: '',
  contrasena: '',
  confirmarContrasena: '',
  aceptaTerminos: false,
  direccion: '',
  telefono: '',
};

const getRegistroErrorMessage = (error) => {
  const raw = error.response?.data?.mensaje || error.response?.data?.message;

  if (!raw || typeof raw !== 'string') {
    return 'Error en el registro. Intenta nuevamente.';
  }

  if (raw.includes('ApiGateway error calling')) {
    const listMatch = raw.match(/\[[\s\S]*\]/);

    if (listMatch?.[0]) {
      try {
        const parsed = JSON.parse(listMatch[0]);

        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.join('\n');
        }
      } catch {
        return listMatch[0]
          .replace(/^\[|\]$/g, '')
          .replace(/","/g, '\n')
          .replace(/"/g, '')
          .replace(/^"|"$/g, '');
      }
    }
  }

  return raw;
};

export default function Registro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [mensaje, setMensaje] = useState({ tipo: null, texto: '' });
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: null, texto: '' });
    setCargando(true);

    if (formData.contrasena !== formData.confirmarContrasena) {
      setMensaje({
        tipo: 'danger',
        texto: 'Las contraseñas no coinciden.',
      });
      setCargando(false);
      return;
    }

    if (!formData.aceptaTerminos) {
      setMensaje({
        tipo: 'danger',
        texto: 'Debes aceptar los términos para registrarte.',
      });
      setCargando(false);
      return;
    }

    try {
      await api.post(
        '/usuarios',
        {
          nombre: formData.nombre,
          correo: formData.correo,
          contrasena: formData.contrasena,
          direccion: formData.direccion,
          telefono: formData.telefono,
          rol: 'CLIENTE',
        },
        { skipAuth: true }
      );

      setMensaje({
        tipo: 'success',
        texto: '¡Registro exitoso! Redirigiendo a login...',
      });

      setFormData(initialFormData);

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      const mensajeError = getRegistroErrorMessage(error);

      setMensaje({
        tipo: 'danger',
        texto: mensajeError,
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container className="containerRegistro py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={4} className="mx-auto">
          <Card className="registro-card shadow">
            <Card.Body>
              <h2 className="text-center mb-4">Registro</h2>

              {mensaje.texto && (
                <Alert variant={mensaje.tipo} className="mb-4">
                  {mensaje.texto}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formGridNombre">
                    <Form.Label>Nombre de usuario</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ingresa tu nombre de usuario"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Row>

                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formGridEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Ingresa tu correo"
                      name="correo"
                      value={formData.correo}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Row>

                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formGridPassword">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Contraseña"
                      name="contrasena"
                      value={formData.contrasena}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Row>

                <Form.Group className="mb-3" controlId="formGridPasswordConfirm">
                  <Form.Label>Confirmar Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirmar Contraseña"
                    name="confirmarContrasena"
                    value={formData.confirmarContrasena}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formGridAddress1">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control
                    placeholder="Ej: Calle 123"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formGridTelefono">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Ingresa tu teléfono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formGridCheckbox">
                  <Form.Check
                    type="checkbox"
                    label="Acepto los términos"
                    name="aceptaTerminos"
                    checked={formData.aceptaTerminos}
                    onChange={handleChange}
                  />
                </Form.Group>

                <div className="text-center">
                  <Button
                    variant="primary"
                    type="submit"
                    className="btn"
                    disabled={cargando}
                  >
                    {cargando ? 'Registrando...' : 'Registrarse'}
                  </Button>
                </div>

                <p className="mb-0 text-center mt-3">
                  ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                </p>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
