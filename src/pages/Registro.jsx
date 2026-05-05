import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import '../styles/brand.css';


export default function Registro() {
  return (



    <Container className="containerRegistro py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={4} className="mx-auto">
          <Card className="registro-card shadow">
            <Card.Body>
              <h2 className="text-center mb-4">Registro</h2>

              <Form>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formGridEmail">
                    <Form.Label>Nombre de usuario</Form.Label>
                    <Form.Control type="text" placeholder="Ingresa tu nombre de usuario" />
                  </Form.Group>

                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formGridEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" placeholder="Ingresa tu correo" />
                  </Form.Group>

                </Row>

                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formGridPassword">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control type="password" placeholder="Contraseña" />
                  </Form.Group>

                </Row>

                  <Form.Group as={Col} controlId="formGridPassword">
                    <Form.Label>Confirmar Contraseña</Form.Label>
                    <Form.Control type="password" placeholder="Confirmar Contraseña" />
                  </Form.Group>


                <Form.Group className="mb-3" controlId="formGridAddress1">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control placeholder="Ej: Calle 123" />
                </Form.Group>


                <Form.Group as={Col} controlId="formGridPassword">
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control type="tel" placeholder="Ingresa tu teléfono" />
                </Form.Group>

            
                <Form.Group className="mb-3" controlId="formGridCheckbox">
                  <Form.Check type="checkbox" label="Acepto los términos" />
                </Form.Group>

                <div className="text-center">
                  <Button variant="primary" type="submit" className="btn">
                    Registrarse
                  </Button>
                </div>

                
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}