import { Button, Container, Carousel as RBCarousel } from 'react-bootstrap';

export default function CommonCarousel({ slides = [] }) {
  return (
    <RBCarousel
      indicators={true}
      controls={true}
      interval={5000}
      className="hero-carousel"
    >
      {slides.map((slide) => (
        <RBCarousel.Item key={slide.id}>
          <div className="hero-slide">
            <img
              src={slide.imagen}
              alt={slide.titulo}
              className="hero-slide__image"
            />
            <div className="hero-slide__overlay" />
            <Container className="hero-slide__content h-100 d-flex flex-column justify-content-center align-items-center text-center text-white py-5">
              <h1 className="display-4 fw-bold mb-3">{slide.titulo}</h1>
              <p className="lead mb-4 hero-carousel__text">{slide.subtitulo}</p>
              <Button
                variant="light"
                size="lg"
                href="#eventos"
                className="fw-semibold px-4 py-2 hero-carousel__button"
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
