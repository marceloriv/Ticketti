import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/brand.css';

export default function TerminosCondiciones() {
  const navigate = useNavigate();

  // Función para confirmar que el usuario ha leído los términos y condiciones
  const confirmarLectura = () => {
    sessionStorage.setItem('terminosLeidos', 'true');
    navigate('/registro');
  };

  return (
    <main className="legal-page">
      <Container className="py-5">
        <section className="legal-hero">
          <span className="legal-badge">Condiciones de uso</span>

          <h1>Términos y Condiciones</h1>

          <p>
            En Ticketti queremos que cada usuario conozca las reglas de uso de la
            plataforma antes de registrarse, comprar entradas, participar en
            eventos o realizar donaciones.
          </p>
        </section>

        <Card className="legal-card">
          <Card.Body>
            <div className="legal-intro">
              <h2>Términos y Condiciones de Uso</h2>

              <p>
                Los presentes Términos y Condiciones regulan el uso de Ticketti
                por parte de usuarios registrados y visitantes. Al crear una
                cuenta o utilizar los servicios disponibles, el usuario declara
                haber leído y aceptado estas condiciones.
              </p>
            </div>

            <Row className="g-4">
              <Col md={6}>
                <section className="legal-section">
                  <span className="legal-number">01</span>
                  <h3>Uso de la plataforma</h3>
                  <p>
                    Ticketti permite acceder a servicios relacionados con
                    eventos, entradas, donaciones y otras funcionalidades
                    disponibles en la plataforma. El usuario se compromete a
                    utilizar el sitio de forma responsable, lícita y respetando
                    las normas establecidas.
                  </p>
                </section>
              </Col>

              <Col md={6}>
                <section className="legal-section">
                  <span className="legal-number">02</span>
                  <h3>Registro de usuario</h3>
                  <p>
                    Para acceder a ciertas funcionalidades, el usuario deberá
                    crear una cuenta entregando información verdadera,
                    actualizada y completa. También será responsable de mantener
                    la confidencialidad de sus datos de acceso.
                  </p>
                </section>
              </Col>

              <Col md={6}>
                <section className="legal-section">
                  <span className="legal-number">03</span>
                  <h3>Responsabilidades del usuario</h3>
                  <p>
                    El usuario se compromete a no utilizar Ticketti para fines
                    ilícitos, fraudulentos o que puedan afectar el correcto
                    funcionamiento de la plataforma, la seguridad de otros
                    usuarios o los servicios ofrecidos.
                  </p>
                </section>
              </Col>

              <Col md={6}>
                <section className="legal-section">
                  <span className="legal-number">04</span>
                  <h3>Información entregada</h3>
                  <p>
                    El usuario declara que la información ingresada en la
                    plataforma es correcta y se compromete a mantenerla
                    actualizada. Ticketti no será responsable por errores
                    derivados de información falsa, incompleta o desactualizada.
                  </p>
                </section>
              </Col>

              <Col md={6}>
                <section className="legal-section">
                  <span className="legal-number">05</span>
                  <h3>Eventos, compras y donaciones</h3>
                  <p>
                    Las compras, reservas, inscripciones o donaciones realizadas
                    a través de Ticketti estarán sujetas a las condiciones
                    específicas informadas en cada caso. El usuario deberá revisar
                    cuidadosamente la información antes de confirmar cualquier
                    operación.
                  </p>
                </section>
              </Col>

              <Col md={6}>
                <section className="legal-section">
                  <span className="legal-number">06</span>
                  <h3>Suspensión de cuentas</h3>
                  <p>
                    Ticketti podrá suspender, limitar o eliminar cuentas cuando
                    se detecte uso indebido de la plataforma, entrega de
                    información falsa, acciones fraudulentas o conductas que
                    afecten la seguridad o continuidad del servicio.
                  </p>
                </section>
              </Col>

              <Col md={6}>
                <section className="legal-section">
                  <span className="legal-number">07</span>
                  <h3>Disponibilidad del servicio</h3>
                  <p>
                    Ticketti procurará mantener la plataforma disponible y
                    funcionando correctamente. Sin embargo, podrían existir
                    interrupciones temporales por mantenimiento, actualizaciones,
                    problemas técnicos o causas externas.
                  </p>
                </section>
              </Col>

              <Col md={6}>
                <section className="legal-section">
                  <span className="legal-number">08</span>
                  <h3>Protección de datos personales</h3>
                  <p>
                    El tratamiento de los datos personales entregados por el
                    usuario se regula en la Política de Privacidad de Ticketti,
                    disponible para su consulta en la plataforma.
                  </p>
                </section>
              </Col>
            </Row>

            <section className="legal-highlight">
              <h3>Modificación y aceptación de los términos</h3>
              <p>
                Ticketti podrá actualizar estos Términos y Condiciones cuando sea
                necesario para adaptarlos a cambios legales, técnicos o
                funcionales. Al registrarse en la plataforma, el usuario declara
                haber leído y aceptado estos términos, comprometiéndose a
                respetarlos mientras utilice Ticketti.
              </p>
            </section>

            <div className="legal-actions">
              <Button
                variant="primary"
                className="legal-button"
                onClick={confirmarLectura}
              >
                Leí los Términos y Condiciones
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </main>
  );
}