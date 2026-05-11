import React, { use } from 'react';
import { Container, Row, Col, Card, Button, FloatingLabel, Form, Alert, Spinner, } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import api from '@services/api';
import '../styles/brand.css';

const BRAND_COLOR = '#5ad4e6';

export default function Login() {
  const navigate = useNavigate();
  const {Login} = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); 
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
  
  try{
    //Llama al BFF: POST /auth/login
    const response = await api.post('/auth/login', { username, password });

    const token = response.data.token;
    //rol viene cuando se agregue al LoginResponse @TODO
    //por ahora queda como CLIENTE si no viene
    const rol = response.data.rol || 'CLIENTE';
    const nombre = response.data.nombre || username;

    Login(token, rol, nombre);

    //Redirigir según rol
    if(rol === 'ADMIN') {
      navigate('/admin');
    } else if (rol === 'ORGANIZADOR'){
      navigate('/organizador');}
    else if (rol === 'CLIENTE'){
      navigate('/perfil');}
    else {
      navigate('/'); //Redirige a home si el rol no es reconocido
    }
  }catch (err){
    if (err.response?.status === 401) {
      setError('Credenciales inválidas. Por favor, inténtalo de nuevo.');
    } else {
      setError('Error de conexión. Por favor, inténtalo más tarde.');
    }
  }finally {
    setCargando(false);
  
  }
  };

  return (
    <Container className="loginContainer py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={4} className="mx-auto">
          <Card className="login-card shadow">
            <Card.Body>
              <h2 className="text-center mb-4">Iniciar Sesión</h2>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <FloatingLabel
                  controlId="floatingInput"
                  label="Usuario"
                  className="mb-3"
                >
                  <Form.Control
                    type="text"
                    placeholder="usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={cargando}
                  />
                </FloatingLabel>

                <div className="text-center">
                  <Button
                    type="submit"
                    className="btn btn-ticketti"
                    disabled={cargando}
                    style={{
                      backgroundColor: BRAND_COLOR,
                      borderColor: BRAND_COLOR,
                      color: '#000',
                      minWidth: '140px',
                    }}
                  >
                    {cargando
                      ? <Spinner size="sm" animation="border" />
                      : 'Ingresar'
                    }
                  </Button>
                </div>
              </Form>

              <p className="text-center mt-3">
                ¿No tienes cuenta?{' '}
                <Link to="/registro">Regístrate aquí</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}