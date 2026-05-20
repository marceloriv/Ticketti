import '@styles/brand.css';

const Contacto = () => {
  return (
    <>
      <section className="Contacto-header py-5">
        <div className="container text-center">
          <h1>Contacto</h1>
          <p>Estamos aquí para ayudarte</p>
        </div>
      </section>

      <section className="Contacto-content py-5">
        <div className="container">
          <div className="row mb-5">
            <div className="col-md-6">
              <h2 className="mb-4">Ponte en contacto con nosotros</h2>
              <p>
                ¿Tienes alguna pregunta, sugerencia o necesitas ayuda con algo?
                Completa el formulario y nos pondremos en contacto contigo lo
                antes posible.
              </p>

              <div className="mb-4">
                <h5>Información de contacto</h5>
                <p>
                  <strong>Email:</strong> contacto@ticketti.org
                </p>
                <p>
                  <strong>Teléfono:</strong> +56 9 1234 5678
                </p>
                <p>
                  <strong>Dirección:</strong> Santiago, Chile
                </p>
              </div>

              <div>
                <h5>Horario de atención</h5>
                <p>Lunes a Viernes: 9:00 - 18:00</p>
                <p>Sábados y Domingos: 10:00 - 14:00</p>
              </div>
            </div>

            <div className="col-md-6">
              <form className="p-4 border rounded">
                <div className="mb-3">
                  <label htmlFor="nombre" className="form-label">
                    Nombre
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="nombre"
                    placeholder="Tu nombre"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="asunto" className="form-label">
                    Asunto
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="asunto"
                    placeholder="Asunto del mensaje"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="mensaje" className="form-label">
                    Mensaje
                  </label>
                  <textarea
                    className="form-control"
                    id="mensaje"
                    rows="5"
                    placeholder="Tu mensaje"
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary">
                  Enviar mensaje
                </button>
              </form>
            </div>
          </div>

          <div className="row">
            <div className="col-12 text-center mb-4">
              <h2>Preguntas Frecuentes</h2>
            </div>

            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">¿Cómo creo un evento?</h5>
                  <p className="card-text">
                    Regístrate como organizador, completa tu perfil y utiliza
                    la herramienta de creación de eventos desde tu dashboard.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">¿Los eventos son gratuitos?</h5>
                  <p className="card-text">
                    Depende del organizador. Algunos eventos son gratuitos y
                    otros tienen costo de entrada que debe ser especificado al
                    crear el evento.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">¿Cómo me registro?</h5>
                  <p className="card-text">
                    Haz clic en el botón de Registro en la página principal,
                    completa tus datos y confirma tu cuenta vía email.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contacto;