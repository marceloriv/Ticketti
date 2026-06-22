import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/brand.css';

export default function PoliticaPrivacidad() {
  const navigate = useNavigate();

  // Función para confirmar que el usuario ha leído la política de privacidad
  const confirmarLectura = () => {
    sessionStorage.setItem('privacidadLeida', 'true');
    navigate('/registro');
  };

  return (
    <main className="legal-page">
      <Container className="py-5">
        <section className="legal-hero">
          <span className="legal-badge">Protección de datos personales</span>

          <h1>Política de Privacidad</h1>

          <p>
            En Ticketti protegemos la información personal de nuestros usuarios y
            explicamos de forma clara cómo recopilamos, usamos y resguardamos sus
            datos personales dentro de nuestra plataforma de eventos.
          </p>
        </section>

        <Card className="legal-card">
          <Card.Body>
            <div className="legal-intro">
              <h2>Política de Privacidad y Protección de Datos Personales</h2>

              <p>
                Esta política informa cómo Ticketti trata los datos personales de
                los usuarios que se registran o utilizan la plataforma, conforme
                a la normativa chilena sobre protección de datos personales,
                incluyendo la Ley N° 21.719.
              </p>
            </div>

            <Row className="g-4">
              <Col md={6}>
                <section className="legal-section">
                  <span className="legal-number">01</span>
                  <h3>Datos personales que recopilamos</h3>
                  <p>
                    Durante el registro, Ticketti recopila datos entregados
                    directamente por el usuario, tales como nombre, correo
                    electrónico, contraseña, dirección y teléfono.
                  </p>
                </section>
              </Col>

              <Col md={6}>
                <section className="legal-section">
                  <span className="legal-number">02</span>
                  <h3>Finalidad del tratamiento</h3>
                  <p>
                    Los datos serán utilizados para crear y gestionar la cuenta,
                    permitir el acceso a la plataforma, validar la identidad del
                    usuario y entregar servicios relacionados con eventos,
                    compras, donaciones u otras funcionalidades de Ticketti.
                  </p>
                </section>
              </Col>

              <Col md={6}>
                <section className="legal-section">
                  <span className="legal-number">03</span>
                  <h3>Consentimiento del usuario</h3>
                  <p>
                    Al registrarse, el usuario declara haber leído y aceptado
                    esta Política de Privacidad, autorizando el tratamiento de sus
                    datos personales para los fines informados.
                  </p>
                </section>
              </Col>

              <Col md={6}>
                <section className="legal-section">
                  <span className="legal-number">04</span>
                  <h3>Uso limitado de la información</h3>
                  <p>
                    Los datos personales no serán utilizados para finalidades
                    distintas a las informadas, salvo que exista autorización
                    previa del usuario o una obligación legal aplicable.
                  </p>
                </section>
              </Col>

              <Col md={6}>
                <section className="legal-section">
                  <span className="legal-number">05</span>
                  <h3>Seguridad y confidencialidad</h3>
                  <p>
                    Ticketti adoptará medidas razonables de seguridad para
                    proteger la confidencialidad, integridad y disponibilidad de
                    los datos personales, evitando accesos no autorizados, uso
                    indebido, pérdida o alteración de la información.
                  </p>
                </section>
              </Col>

              <Col md={6}>
                <section className="legal-section">
                  <span className="legal-number">06</span>
                  <h3>Conservación de los datos</h3>
                  <p>
                    Los datos personales serán conservados solo durante el tiempo
                    necesario para cumplir con las finalidades para las que fueron
                    recopilados o mientras exista una obligación legal que
                    justifique su almacenamiento.
                  </p>
                </section>
              </Col>

              <Col md={6}>
                <section className="legal-section">
                  <span className="legal-number">07</span>
                  <h3>Comunicación a terceros</h3>
                  <p>
                    Ticketti no venderá ni entregará datos personales a terceros
                    para fines ajenos al funcionamiento de la plataforma. La
                    información solo podrá ser comunicada cuando sea necesario
                    para prestar el servicio, cumplir una obligación legal o
                    responder a una autoridad competente.
                  </p>
                </section>
              </Col>

              <Col md={6}>
                <section className="legal-section">
                  <span className="legal-number">08</span>
                  <h3>Derechos del usuario</h3>
                  <p>
                    El usuario podrá solicitar acceso, rectificación, eliminación,
                    oposición o suspensión del tratamiento de sus datos
                    personales, conforme a la normativa chilena aplicable.
                  </p>
                </section>
              </Col>
            </Row>

            <section className="legal-highlight">
              <h3>Actualización de la política</h3>
              <p>
                Ticketti podrá actualizar esta Política de Privacidad cuando sea
                necesario para adecuarla a cambios legales, técnicos o
                funcionales de la plataforma. La versión vigente estará disponible
                para consulta de los usuarios.
              </p>
            </section>

            <div className="legal-actions">
              <Button
                variant="primary"
                className="legal-button"
                onClick={confirmarLectura}
              >
                Leí la Política de Privacidad
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </main>
  );
}