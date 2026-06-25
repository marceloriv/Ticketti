import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CommonCarousel from '../../../src/components/common/Carousel';

const slides = [
  { id: 1, imagen: '/img/slide1.jpg', titulo: 'Rock Festival', subtitulo: 'El mejor festival del año' },
  { id: 2, imagen: '/img/slide2.jpg', titulo: 'Jazz Night', subtitulo: 'Una noche de jazz inolvidable' },
];

describe('CommonCarousel', () => {
  it('renderiza todos los slides', () => {
    render(<CommonCarousel slides={slides} />);
    expect(screen.getByText('Rock Festival')).toBeInTheDocument();
    expect(screen.getByText('Jazz Night')).toBeInTheDocument();
  });

  it('muestra subtítulos de cada slide', () => {
    render(<CommonCarousel slides={slides} />);
    expect(screen.getByText('El mejor festival del año')).toBeInTheDocument();
    expect(screen.getByText('Una noche de jazz inolvidable')).toBeInTheDocument();
  });

  it('muestra botón Explorar en cada slide', () => {
    render(<CommonCarousel slides={slides} />);
    const explorarButtons = screen.getAllByText('Explorar');
    expect(explorarButtons.length).toBe(2);
  });

  it('primera imagen usa eager loading', () => {
    render(<CommonCarousel slides={slides} />);
    const imgs = screen.getAllByRole('img');
    expect(imgs[0]).toHaveAttribute('loading', 'eager');
    expect(imgs[0]).toHaveAttribute('fetchpriority', 'high');
  });

  it('imágenes posteriores usan lazy loading', () => {
    render(<CommonCarousel slides={slides} />);
    const imgs = screen.getAllByRole('img');
    expect(imgs[1]).toHaveAttribute('loading', 'lazy');
    expect(imgs[1]).toHaveAttribute('fetchpriority', 'auto');
  });

  it('renderiza slide vacío cuando no hay slides', () => {
    const { container } = render(<CommonCarousel slides={[]} />);
    expect(container.querySelector('.carousel-item')).not.toBeInTheDocument();
  });
});
