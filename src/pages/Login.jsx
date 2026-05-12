import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthConext';
import '../styles/brand.css';


export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ correo: '', contrasena: '' });
  const [mensaje, setMensaje] = useState({ tipo: null, texto: '' });
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: null, texto: '' });
    setCargando(true);

    try {
      await login(formData);
      navigate('/home');
    } catch (error) {
      const mensajeError =
        error.message || 'No se pudo iniciar sesión. Intenta nuevamente.';
      setMensaje({ tipo: 'danger', texto: mensajeError });
    } finally {
      setCargando(false);
    }
  };

  return (
    
    <Container className="loginContainer py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={4} className='mx-auto'>
          <Card className="login-card shadow">
            <Card.Body>
              <h2 className="text-center mb-4">Iniciar Sesión</h2>

              {mensaje.texto && (
                <Alert variant={mensaje.tipo} className="mb-4">
                  {mensaje.texto}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
              <FloatingLabel 
                controlId="floatingInput"
                label="Correo Electrónico"
                className="mb-3"
              >
              <Form.Control
                type="email"
                placeholder="name@example.com"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                disabled={cargando}
              />
              </FloatingLabel>

              <FloatingLabel
                controlId="floatingPassword"
                label="Contraseña"
                className="mb-3"
              >
                <Form.Control
                  type="password"
                  placeholder="Contraseña"
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleChange}
                  disabled={cargando}
                />
              </FloatingLabel>

              <div className="text-center">
                <Button className="btn btn-ticketti" type="submit" disabled={cargando}>
                  {cargando ? 'Ingresando...' : 'Ingresar'}
                </Button>
              </div>
              </Form>

              <p className="boton->registro">¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link></p>       
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}


