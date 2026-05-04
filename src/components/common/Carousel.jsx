import React from 'react';
import { Carousel as RBCarousel, Container, Button } from 'react-bootstrap';

export default function CommonCarousel({
  slides = [],
  brandColor = '#5ad4e6',
}) {
  return (
    <RBCarousel
      indicators={true}
      controls={true}
      interval={5000}
      className="hero-carousel"
    >
      {slides.map((slide) => (
        <RBCarousel.Item key={slide.id}>
          <div
            className="hero-slide"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url(${slide.imagen})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: '85vh',
              minHeight: '400px',
            }}
          >
            <Container className="h-100 d-flex flex-column justify-content-center align-items-center text-center text-white py-5">
              <h1 className="display-4 fw-bold mb-3">{slide.titulo}</h1>
              <p className="lead mb-4 max-w-600" style={{ maxWidth: '600px' }}>
                {slide.subtitulo}
              </p>
              <Button
                variant="light"
                size="lg"
                href="#eventos"
                className="fw-semibold px-4 py-2"
                style={{
                  '--bs-btn-hover-bg': brandColor,
                  '--bs-btn-hover-color': '#000',
                  '--bs-btn-hover-border-color': brandColor,
                }}
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
