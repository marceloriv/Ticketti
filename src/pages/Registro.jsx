import api from '@api/api';
import { useState } from 'react';
import { Alert, Button, Card, Col, Container, Row } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import { Link, useNavigate } from 'react-router-dom';

// se agrega un estado inicial para el formulario para facilitar el reseteo después del registro exitoso
const initialFormData = {
  nombre: '',
  correo: '',
  contrasena: '',
  confirmarContrasena: '',
  aceptaTerminos: false,
  aceptaPrivacidad: false,
  direccion: '',
  telefono: '',
};
// función para extraer mensajes de error específicos del registro, manejando casos comunes de errores en APIs REST

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
// componente de registro de usuario
//con validaciones para contraseñas, aceptación de términos y manejo de errores específicos del proceso de registro
export default function Registro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [mensaje, setMensaje] = useState({ tipo: null, texto: '' });
  const [cargando, setCargando] = useState(false);


  const [documentosLeidos, setDocumentosLeidos] = useState({
    terminos: localStorage.getItem('terminosLeidos') === 'true',
    privacidad: localStorage.getItem('privacidadLeidos') === 'true',
  });

  // función para manejar cambios en los campos del formulario, actualizando el estado formData

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // función para manejar el envío del formulario de registro, con validaciones y llamadas a la API

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: null, texto: '' });

    if (formData.contrasena !== formData.confirmarContrasena) {
      setMensaje({
        tipo: 'danger',
        texto: 'Las contraseñas no coinciden.',
      });
      return;
    }

    if (!formData.aceptaTerminos) {
      setMensaje({
        tipo: 'danger',
        texto: 'Debes aceptar los Términos y Condiciones para registrarte.',
      });
      return;
    }

    if (!formData.aceptaPrivacidad) {
      setMensaje({
        tipo: 'danger',
        texto:
          'Debes aceptar la Política de Privacidad y el tratamiento de datos personales para registrarte.',
      });
      return;
    }

    setCargando(true);

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
          // Campos adicionales de ckeckbox para preferencias del usuario
          aceptaTerminos: formData.aceptaTerminos,
          aceptaPrivacidad: formData.aceptaPrivacidad,

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
                <Alert
                  variant={mensaje.tipo}
                  className="mb-4"
                  style={{ whiteSpace: 'pre-line' }}
                >
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

                <Form.Group
                  className="mb-3"
                  controlId="formGridPasswordConfirm"
                >
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


                <Form.Group className="mb-2" controlId="formGridTerminos">
                  <div className="form-check">
                    <Form.Check.Input
                      type="checkbox"
                      name="aceptaTerminos"
                      checked={formData.aceptaTerminos}
                      onChange={handleChange}
                      disabled={!documentosLeidos.terminos}
                      required
                    />

                    <Form.Check.Label>
                      Acepto los Términos y Condiciones de uso de Ticketti.{' '}
                      <Link className="legal-check-link" to="/terminos">
                        Ver términos
                      </Link>
                    </Form.Check.Label>
                  </div>

                  {!documentosLeidos.terminos && (
                    <small className="d-block text-muted ms-4">
                      Debes leer los términos antes de aceptarlos.
                    </small>
                  )}
                </Form.Group>

                <Form.Group className="mb-3" controlId="formGridPrivacidad">
                  <div className="form-check">
                    <Form.Check.Input
                      type="checkbox"
                      name="aceptaPrivacidad"
                      checked={formData.aceptaPrivacidad}
                      onChange={handleChange}
                      disabled={!documentosLeidos.privacidad}
                      required
                    />

                    <Form.Check.Label>
                      He leído y acepto la Política de Privacidad y autorizo el tratamiento de
                      mis datos personales para crear y gestionar mi cuenta en Ticketti,
                      conforme a la Ley N° 21.719.{' '}
                      <Link className="legal-check-link" to="/privacidad">
                        Ver política
                      </Link>
                    </Form.Check.Label>
                  </div>

                  {!documentosLeidos.privacidad && (
                    <small className="d-block text-muted ms-4">
                      Debes leer la política antes de aceptarla.
                    </small>
                  )}
                </Form.Group>

                <div className="text-center">
                  <Button
                    variant="primary"
                    type="submit"
                    className="btn"
                    disabled={
                      cargando ||
                      !formData.aceptaTerminos ||
                      !formData.aceptaPrivacidad
                    }
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