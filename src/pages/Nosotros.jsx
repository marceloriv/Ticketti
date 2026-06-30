import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import '@styles/components/Nosotros.css';

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

const Nosotros = () => {
  return (
    <>
      <Header />

      <section className="nosotros-hero">
        <div className="nosotros-hero__pattern" />
        <div className="container">
          <div className="nosotros-hero__content">
            <span className="nosotros-hero__badge">Quiénes somos</span>
            <h1 className="nosotros-hero__title">Sobre Ticketti</h1>
            <p className="nosotros-hero__subtitle">
              Conectamos personas con eventos que generan impacto social
            </p>
          </div>
        </div>
      </section>

      <section className="nosotros-stats">
        <div className="container">
          <div className="row g-4">
            <div className="col-6 col-md-3">
              <div className="nosotros-stat">
                <div className="nosotros-stat__number">+500</div>
                <div className="nosotros-stat__label">Eventos publicados</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="nosotros-stat">
                <div className="nosotros-stat__number">+10K</div>
                <div className="nosotros-stat__label">Usuarios registrados</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="nosotros-stat">
                <div className="nosotros-stat__number">+50</div>
                <div className="nosotros-stat__label">Organizaciones aliadas</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="nosotros-stat">
                <div className="nosotros-stat__number">+30</div>
                <div className="nosotros-stat__label">Causas apoyadas</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="nosotros-historia">
        <div className="container">
          <div className="nosotros-historia__grid">
            <div className="nosotros-historia__text">
              <h2 className="nosotros-section-title">Nuestra Historia</h2>
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
            <div className="nosotros-historia__media">
              <div className="nosotros-historia__frame" />
              <img
                src="/img/listicle_1686140315148_74ycs_1040x500.jpg"
                alt="Eventos con enfoque social"
                className="nosotros-historia__img"
                width="600"
                height="400"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="nosotros-mv">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="nosotros-section-title">Misión y Visión</h2>
            <div className="nosotros-divider" />
          </div>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="nosotros-card">
                <div className="nosotros-card__icon">🎯</div>
                <h3>Misión</h3>
                <p>
                  Facilitar la gestión, difusión y acceso a eventos con
                  impacto social, permitiendo que organizadores y comunidades
                  se conecten de manera simple, segura y eficiente.
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="nosotros-card nosotros-card--alt">
                <div className="nosotros-card__icon">🔭</div>
                <h3>Visión</h3>
                <p>
                  Ser una plataforma referente en la promoción de eventos
                  sociales, culturales y comunitarios, impulsando la
                  participación ciudadana y el desarrollo de iniciativas con
                  propósito.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="nosotros-valores">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="nosotros-section-title">Nuestros Valores</h2>
            <div className="nosotros-divider" />
          </div>
          <div className="row g-4">
            {valores.map((valor, index) => (
              <div key={index} className="col-md-3 col-sm-6">
                <div
                  className="nosotros-valor-card"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <div className="nosotros-valor-icon">{valor.icono}</div>
                  <h5>{valor.titulo}</h5>
                  <p>{valor.descripcion}</p>
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
