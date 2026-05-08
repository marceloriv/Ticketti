import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/brand.css';


export default function Login() {
  const navigate = useNavigate();

  return (
    
    <Container className="loginContainer py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={4} className='mx-auto'>
          <Card className="login-card shadow">
            <Card.Body>
              <h2 className="text-center mb-4">Iniciar Sesión</h2>

              <FloatingLabel 
                controlId="floatingInput"
                label="Correo Electrónico"
                className="mb-3"
              >
              <Form.Control type="email" placeholder="name@example.com" />
              </FloatingLabel>

              <FloatingLabel
                controlId="floatingPassword"
                label="Contraseña"
                className="mb-3"
              >
                <Form.Control type="password" placeholder="Contraseña" />
              </FloatingLabel>

              <div className="text-center">
                <Button className="btn btn-ticketti">Ingresar</Button>
              </div>

              <p className="boton->registro">¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link></p>       
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}


