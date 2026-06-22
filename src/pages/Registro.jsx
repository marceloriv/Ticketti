import Header from '@/components/layout/Header';
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
  //para que se mantengan los estados de aceptación de términos y privacidad aunque el usuario recargue la página o vuelva después de leer los documentos legales,
  //se inicializan a partir de sessionStorage, que se actualiza cuando el usuario confirma que ha leído cada documento
  const [formData, setFormData] = useState(() => ({
    ...initialFormData,
    aceptaTerminos: sessionStorage.getItem('aceptaTerminos') === 'true',
    aceptaPrivacidad: sessionStorage.getItem('aceptaPrivacidad') === 'true',
  }));
  const [mensaje, setMensaje] = useState({ tipo: null, texto: '' });
  const [cargando, setCargando] = useState(false);

  // estado para saber si el usuario ya leyó los documentos legales antes de permitir aceptar los checkbox
  const [documentosLeidos] = useState({
    terminos: sessionStorage.getItem('terminosLeidos') === 'true',
    privacidad: sessionStorage.getItem('privacidadLeida') === 'true',
  });


  // función para manejar cambios en los campos del formulario, actualizando el estado formData
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      sessionStorage.setItem(name, checked ? 'true' : 'false');
    }

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

    if (!documentosLeidos.terminos) {
      setMensaje({
        tipo: 'warning',
        texto: 'Debes leer los Términos y Condiciones antes de aceptarlos.',
      });
      return;
    }

    if (!documentosLeidos.privacidad) {
      setMensaje({
        tipo: 'warning',
        texto: 'Debes leer la Política de Privacidad antes de aceptarla.',
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
          // Campos adicionales de checkbox para preferencias del usuario
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
        <Col xs={12} md={9} lg={6} xl={5} className="mx-auto">
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
              <Card className="registro-requisitos mb-4">
                <Card.Body>
                  <h6 className="mb-2">Requisitos mínimos para registrarte</h6>

                  <ul className="mb-0">
                    <li>El nombre debe tener entre 3 y 100 caracteres.</li>
                    <li>El correo debe ser válido y no estar registrado previamente.</li>
                    <li>El teléfono debe tener exactamente 9 dígitos.</li>
                    <li>La dirección debe tener entre 5 y 255 caracteres.</li>
                    <li>Debes leer y aceptar los Términos y la Política de Privacidad.</li>
                  </ul>
                </Card.Body>
              </Card>

              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formGridNombre">
                    <Form.Label>Nombre de usuario (*)</Form.Label>
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
                    <Form.Label>Email (*)</Form.Label>
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
                    <Form.Label>Contraseña (*)</Form.Label>
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
                  <Form.Label>Confirmar Contraseña (*)</Form.Label>
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
                  <Form.Label>Dirección (*)</Form.Label>
                  <Form.Control
                    placeholder="Ej: Calle 123"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formGridTelefono">
                  <Form.Label>Teléfono (*)</Form.Label>
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
                      id="aceptaTerminos"
                      type="checkbox"
                      name="aceptaTerminos"
                      checked={formData.aceptaTerminos}
                      onChange={handleChange}
                      disabled={!documentosLeidos.terminos}
                      required
                    />

                    <Form.Check.Label htmlFor="aceptaTerminos">
                      Acepto los Términos y Condiciones de uso de Ticketti.{' '}
                    </Form.Check.Label>
                    <Link className="legal-check-link" to="/terminos">
                      Ver términos
                    </Link>

                  </div>

                  {!documentosLeidos.terminos && (
                    <small className="d-block text-muted ms-4">
                      Debes leer los términos antes de aceptarlos.
                    </small>
                  )}

                  {documentosLeidos.terminos && (
                    <small className="d-block text-success ms-4">
                      Documento leído. Ya puedes aceptar los términos.
                    </small>
                  )}
                </Form.Group>

                <Form.Group className="mb-3" controlId="formGridPrivacidad">
                  <div className="form-check">
                    <Form.Check.Input
                      id="aceptaPrivacidad"
                      type="checkbox"
                      name="aceptaPrivacidad"
                      checked={formData.aceptaPrivacidad}
                      onChange={handleChange}
                      disabled={!documentosLeidos.privacidad}
                      required
                    />

                    <Form.Check.Label htmlFor="aceptaPrivacidad">
                      He leído y acepto la Política de Privacidad y autorizo el
                      tratamiento de mis datos personales para crear y gestionar
                      mi cuenta en Ticketti, conforme a la Ley N° 21.719.{' '}
                    </Form.Check.Label>
                    <Link className="legal-check-link" to="/privacidad">
                      Ver política
                    </Link>
                  </div>

                  {!documentosLeidos.privacidad && (
                    <small className="d-block text-muted ms-4">
                      Debes leer la política antes de aceptarla.
                    </small>
                  )}

                  {documentosLeidos.privacidad && (
                    <small className="d-block text-success ms-4">
                      Documento leído. Ya puedes aceptar la política.
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
                      !documentosLeidos.terminos ||
                      !documentosLeidos.privacidad ||
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
    </div>
  );
}