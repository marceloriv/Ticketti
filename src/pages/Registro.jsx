import Header from '@/components/layout/Header';
import api from '@api/api';
import { useRef, useState, useEffect } from 'react';
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

// clave para que se puedan guardar los datos del formulario en sessionStorage y recueperarlos si el usuario recarga la página o vuelve después de leer los documentos legales, evitando que pierda lo que ya había ingresado
const REGISTRO_DRAFT_KEY = 'registroFormData';

// función para extraer mensajes de error específicos del registro, manejando casos comunes de errores en APIs REST
const getRegistroErrorMessage = (error) => {
  const data = error.response?.data;

  if (Array.isArray(data)) {
    return data.join('\n');
  }

  const raw =
    typeof data === 'string'
      ? data
      : data?.mensaje || data?.message;

  if (!raw || typeof raw !== 'string') {
    return 'Error en el registro. Intenta nuevamente.';
  }

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

  return raw;
};

// componente de registro de usuario
//con validaciones para contraseñas, aceptación de términos y manejo de errores específicos del proceso de registro
export default function Registro() {
  const navigate = useNavigate();

  //para que se mantengan los estados de aceptación de términos y privacidad aunque el usuario recargue la página o vuelva después de leer los documentos legales,
  //se inicializan a partir de sessionStorage, que se actualiza cuando el usuario confirma que ha leído cada documento
  const [formData, setFormData] = useState(() => {
    const draft = JSON.parse(sessionStorage.getItem(REGISTRO_DRAFT_KEY) || '{}');

    return {
      ...initialFormData,
      ...draft,
      aceptaTerminos: sessionStorage.getItem('aceptaTerminos') === 'true',
      aceptaPrivacidad: sessionStorage.getItem('aceptaPrivacidad') === 'true',
    };
  });

  const [mensaje, setMensaje] = useState({ tipo: null, texto: '' });
  const [cargando, setCargando] = useState(false);

  // referencia para el mensaje de error
  const mensajeRef = useRef(null);

  // estado para saber si el usuario ya leyó los documentos legales antes de permitir aceptar los checkbox
  const [documentosLeidos] = useState({
    terminos: sessionStorage.getItem('terminosLeidos') === 'true',
    privacidad: sessionStorage.getItem('privacidadLeida') === 'true',
  });

  // guarda temporalmente los datos del registro mientras el usuario revisa los documentos legales
  const guardarBorradorRegistro = (datosFormulario) => {
    const datosTemporales = {
      nombre: datosFormulario.nombre,
      correo: datosFormulario.correo,
      contrasena: datosFormulario.contrasena,
      confirmarContrasena: datosFormulario.confirmarContrasena,
      direccion: datosFormulario.direccion,
      telefono: datosFormulario.telefono,
    };

    sessionStorage.setItem(REGISTRO_DRAFT_KEY, JSON.stringify(datosTemporales));
  };

  // lleva al usuario hacia la alerta cuando aparece un mensaje de error o advertencia
  useEffect(() => {
    if (mensaje.texto && (mensaje.tipo === 'danger' || mensaje.tipo === 'warning')) {
      setTimeout(() => {
        mensajeRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }
  }, [mensaje]);

  // función para manejar cambios en los campos del formulario, actualizando el estado formData
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      sessionStorage.setItem(name, checked ? 'true' : 'false');
    }

    setFormData((prev) => {
      const nuevosDatos = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      guardarBorradorRegistro(nuevosDatos);

      return nuevosDatos;
    });
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

    // intento de registro del usuario a través de la API, con manejo de errores específicos para el usuario
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

      sessionStorage.removeItem(REGISTRO_DRAFT_KEY);
      sessionStorage.removeItem('terminosLeidos');
      sessionStorage.removeItem('privacidadLeida');
      sessionStorage.removeItem('aceptaTerminos');
      sessionStorage.removeItem('aceptaPrivacidad');

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
    <div>
      <main className="registro-page">
        <Container className="containerRegistro py-5">
          <Row className="justify-content-center">
            <Col xs={12} md={9} lg={6} xl={5} className="mx-auto">
              <Card className="registro-card shadow">
                <Card.Body>
                  <h2 className="text-center mb-4">Registro</h2>

                  {mensaje.texto && (
                    <Alert
                      ref={mensajeRef}
                      variant={mensaje.tipo}
                      className="mb-3"
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
                        <li>
                          La contraseña debe tener mínimo 8 caracteres, una mayúscula,
                          una minúscula y un número.
                        </li>
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
      </main >
    </div>
  );
}
