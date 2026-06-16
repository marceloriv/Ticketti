import Header from '@components/layout/Header';
import Footer from '@components/layout/Footer';
import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@utils/routes';
import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Row,
  Spinner,
} from 'react-bootstrap';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Si ya está autenticado, mandarlo al home
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.INICIO);
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({
        email,
        password,
      });

      // Después del login, todos van al home
      navigate(ROUTES.INICIO);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
      setPassword(''); // Limpia el input de contraseña ante fallos por buenas prácticas de seguridad
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 d-flex align-items-center py-5">
        <Container className="loginContainer">
          <Row className="justify-content-center w-100 m-0">
            <Col md={10} lg={4} className="mx-auto">
              <Card className="login-card shadow">
                <Card.Body>
                  <h2 className="text-center mb-4">Iniciar Sesión</h2>

                  {error && (
                    <Alert variant="danger" className="mb-3">
                      {error}
                    </Alert>
                  )}

                  <Form onSubmit={handleLogin}>
                    <FloatingLabel
                      controlId="floatingInput"
                      label="Correo Electrónico"
                      className="mb-3"
                    >
                      <Form.Control
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </FloatingLabel>

                    <div className="text-center">
                      <Button
                        className="btn btn-ticketti"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Ingresando...
                          </>
                        ) : (
                          'Ingresar'
                        )}
                      </Button>
                    </div>
                  </Form>

                  <p className="text-center mt-3">
                    ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
