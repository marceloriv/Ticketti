import { Button, Container, Carousel as RBCarousel } from 'react-bootstrap';

export default function CommonCarousel({ slides = [] }) {
  return (
    <RBCarousel
      indicators={true}
      controls={true}
      interval={5000}
      className="hero-carousel"
    >
      {slides.map((slide, index) => (
        <RBCarousel.Item key={slide.id}>
          <div className="hero-slide">
            <img
              src={slide.imagen}
              alt={slide.titulo}
              className="hero-slide__image"
              width="1920"
              height="1080"
              fetchPriority={index === 0 ? "high" : "auto"}
              loading={index === 0 ? "eager" : "lazy"}
              decoding={index === 0 ? "sync" : "async"}
            />
            <div className="hero-slide__overlay" />
            <Container className="hero-slide__content h-100 d-flex flex-column justify-content-center align-items-center text-center text-white py-3 py-md-5 px-4">
              <h1 className="display-6 display-md-4 fw-bold mb-3">{slide.titulo}</h1>
              <p className="fs-6 fs-md-5 mb-4 hero-carousel__text">{slide.subtitulo}</p>
              <Button
                variant="light"
                size="md"
                href="#eventos"
                className="fw-semibold px-3 py-2 px-md-4 py-md-2 hero-carousel__button"
              >
                Explorar
              </Button>
            </Container>
          </div>
        </RBCarousel.Item>
      ))}
    </RBCarousel>
  );
}
