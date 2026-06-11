import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';

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
      <Header />
      <section className="py-5 text-center position-relative overflow-hidden nosotros-hero-ticketti">
        <div className="position-absolute w-100 h-100 nosotros-hero-ticketti__overlay" />
        <div className="container position-relative nosotros-hero-ticketti__content">
          <h1 className="display-4 fw-bold mb-3">Sobre Ticketti</h1>
          <p className="lead mb-0 opacity-90">
            Conectamos personas con eventos que generan impacto social
          </p>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          <div className="row align-items-center mb-5">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h2 className="display-6 fw-bold mb-4">Nuestra Historia</h2>
              <p className="mb-3">
                Ticketti nace como una plataforma pensada para facilitar la
                organización, difusión y participación en eventos con enfoque
                social. Nuestro propósito es conectar a las personas con
                actividades culturales, comunitarias, solidarias y educativas
                que aporten valor a la sociedad.
              </p>
              <p className="mb-3">
                Sabemos que muchos eventos importantes no siempre logran llegar
                a todas las personas que podrían participar o colaborar. Por
                eso, buscamos entregar una herramienta simple y accesible para
                que organizadores puedan publicar sus eventos y los usuarios
                puedan descubrir nuevas oportunidades de participación.
              </p>
              <p className="mb-0">
                A través de Ticketti, queremos apoyar la creación de espacios
                donde la cultura, la solidaridad, la comunidad y la
                participación ciudadana sean protagonistas.
              </p>
            </div>
            <div className="col-lg-6">
              <div className="position-relative">
                <img
                  src="/public/img/listicle_1686140315148_74ycs_1040x500.jpg"
                  alt="Eventos con enfoque social"
                  className="img-fluid rounded-4 shadow-lg"
                />
                <div className="position-absolute rounded-4 nosotros-frame-ticketti" />
              </div>
            </div>
          </div>

          <div className="row mb-5">
            <div className="col-12 text-center mb-4">
              <h2 className="display-6 fw-bold">Misión y Visión</h2>
              <div className="nosotros-divider-ticketti" />
            </div>

            <div className="col-md-6 mb-4">
              <div className="card h-100 border-0 rounded-4 shadow-sm hover-lift">
                <div className="card-body text-center p-4 p-lg-5">
                  <div className="mb-3 mx-auto rounded-3 d-flex align-items-center justify-content-center nosotros-icon-ticketti">
                    <span className="nosotros-emoji-ticketti">🎯</span>
                  </div>
                  <h3 className="fw-bold mb-3">Misión</h3>
                  <p className="mb-0">
                    Facilitar la gestión, difusión y acceso a eventos con
                    impacto social, permitiendo que organizadores y comunidades
                    se conecten de manera simple, segura y eficiente.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card h-100 border-0 rounded-4 shadow-sm hover-lift">
                <div className="card-body text-center p-4 p-lg-5">
                  <div className="mb-3 mx-auto rounded-3 d-flex align-items-center justify-content-center nosotros-icon-ticketti nosotros-icon-ticketti--alt">
                    <span className="nosotros-emoji-ticketti">🔭</span>
                  </div>
                  <h3 className="fw-bold mb-3">Visión</h3>
                  <p className="mb-0">
                    Ser una plataforma referente en la promoción de eventos
                    sociales, culturales y comunitarios, impulsando la
                    participación ciudadana y el desarrollo de iniciativas con
                    propósito.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12 text-center mb-4">
              <h2 className="display-6 fw-bold">Nuestros Valores</h2>
              <div className="nosotros-divider-ticketti" />
            </div>

            {valores.map((valor, index) => (
              <div key={index} className="col-md-3 col-sm-6 mb-4">
                <div className="card h-100 text-center border-0 rounded-4 shadow-sm hover-lift">
                  <div className="card-body p-4">
                    <div className="mb-3 mx-auto rounded-circle d-flex align-items-center justify-content-center nosotros-value-icon-ticketti">
                      {valor.icono}
                    </div>
                    <h5 className="fw-bold mb-2">{valor.titulo}</h5>
                    <p className="text-muted small mb-0">{valor.descripcion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Nosotros;
