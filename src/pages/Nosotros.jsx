import '@styles/brand.css';

const Nosotros = () => {
  const valores = [
    {
      icono: '🎟️',
      titulo: 'Acceso',
      descripcion:
        'Buscamos acercar eventos culturales, sociales y comunitarios a más personas, facilitando su difusión y participación.',
    },
    {
      icono: '🤝',
      titulo: 'Comunidad',
      descripcion:
        'Creemos en los eventos como espacios de encuentro, colaboración y fortalecimiento de vínculos entre personas y organizaciones.',
    },
    {
      icono: '🌍',
      titulo: 'Impacto social',
      descripcion:
        'Promovemos actividades que generen valor para la comunidad, apoyando iniciativas con propósito social y cultural.',
    },
    {
      icono: '✨',
      titulo: 'Transparencia',
      descripcion:
        'Queremos entregar una experiencia clara y confiable para usuarios, organizadores y participantes.',
    },
  ];

  return (
    <>
      <section className="Nosotros-header py-5">
        <div className="container text-center">
          <h1>Sobre Ticketti</h1>
          <p>Conectamos personas con eventos que generan impacto social</p>
        </div>
      </section>

      <section className="Nosotros-content py-5">
        <div className="container">
          <div className="row mb-5">
            <div className="col-md-6">
              <h2 className="mb-4">Nuestra Historia</h2>
              <p>
                Ticketti nace como una plataforma pensada para facilitar la
                organización, difusión y participación en eventos con enfoque
                social. Nuestro propósito es conectar a las personas con
                actividades culturales, comunitarias, solidarias y educativas
                que aporten valor a la sociedad.
              </p>
              <p>
                Sabemos que muchos eventos importantes no siempre logran llegar
                a todas las personas que podrían participar o colaborar. Por
                eso, buscamos entregar una herramienta simple y accesible para
                que organizadores puedan publicar sus eventos y los usuarios
                puedan descubrir nuevas oportunidades de participación.
              </p>
              <p>
                A través de Ticketti, queremos apoyar la creación de espacios
                donde la cultura, la solidaridad, la comunidad y la
                participación ciudadana sean protagonistas.
              </p>
            </div>
            <div className="col-md-6">
              <img
                src="/public/img/listicle_1686140315148_74ycs_1040x500.jpg"
                alt="Eventos con enfoque social"
                className="img-fluid rounded shadow"
              />
            </div>
          </div>

          <div className="row mb-5">
            <div className="col-12 text-center mb-4">
              <h2>Misión y Visión</h2>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body text-center">
                  <h3 className="card-title">Misión</h3>
                  <p className="card-text">
                    Facilitar la gestión, difusión y acceso a eventos con
                    impacto social, permitiendo que organizadores y comunidades
                    se conecten de manera simple, segura y eficiente.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body text-center">
                  <h3 className="card-title">Visión</h3>
                  <p className="card-text">
                    Ser una plataforma referente en la promoción de eventos
                    sociales, culturales y comunitarios, impulsando la
                    participación ciudadana y el desarrollo de iniciativas con
                    propósito.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-5">
            <div className="col-12 text-center mb-4">
              <h2>Nuestros Valores</h2>
            </div>

            {valores.map((valor, index) => (
              <div key={index} className="col-md-3 col-sm-6 mb-4">
                <div className="card h-100 text-center">
                  <div className="card-body">
                    <div className="value-icon mb-3">{valor.icono}</div>
                    <h5>{valor.titulo}</h5>
                    <p>{valor.descripcion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Nosotros;
