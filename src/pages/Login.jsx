import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { Link } from 'react-router-dom';

const BRAND_COLOR = '#5ad4e6';

export default function Login() {


  return (
    <Container className="loginContainer py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={4} className="mx-auto">
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

              <p className="text-center mt-3">
                ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
