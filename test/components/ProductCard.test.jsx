import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import ProductCard from '../../src/components/common/ProductCard';
import { renderWithRouter } from '../test-utils';

const mockEvento = {
  id: 1,
  titulo: 'Concierto de Rock',
  fecha: '2025-06-15',
  ubicacion: 'Santiago, Chile',
  precio: 15000,
  imagen: 'https://example.com/concierto.jpg',
};

describe('ProductCard', () => {
  it('renderiza el título del evento', () => {
    renderWithRouter(<ProductCard evento={mockEvento} />);

    expect(screen.getByTestId('product-card-title')).toHaveTextContent('Concierto de Rock');
  });

  it('renderiza la ubicación del evento', () => {
    renderWithRouter(<ProductCard evento={mockEvento} />);

    expect(screen.getByTestId('product-card-location')).toHaveTextContent('Santiago, Chile');
  });

  it('renderiza el precio formateado', () => {
    renderWithRouter(<ProductCard evento={mockEvento} />);

    expect(screen.getByTestId('product-card-price')).toBeInTheDocument();
  });

  it('muestra "Gratis" cuando el precio es 0', () => {
    const eventoGratis = { ...mockEvento, precio: 0 };

    renderWithRouter(<ProductCard evento={eventoGratis} />);

    expect(screen.getByTestId('product-card-price')).toHaveTextContent('Gratis');
  });

  it('muestra placeholder cuando no hay imagen', () => {
    const eventoSinImagen = { ...mockEvento, imagen: null };

    renderWithRouter(<ProductCard evento={eventoSinImagen} />);

    const img = screen.getByTestId('product-card-img');
    expect(img).toHaveAttribute('src', '/img/mascota1.png');
  });

  it('muestra la imagen del evento cuando existe', () => {
    renderWithRouter(<ProductCard evento={mockEvento} />);

    const img = screen.getByTestId('product-card-img');
    expect(img).toHaveAttribute('src', 'https://example.com/concierto.jpg');
  });

  it('muestra valores por defecto cuando el evento es null', () => {
    renderWithRouter(<ProductCard evento={null} />);

    expect(screen.getByTestId('product-card-title')).toHaveTextContent('Evento sin nombre');
    expect(screen.getByTestId('product-card-location')).toHaveTextContent('Ubicación por confirmar');
  });

  it('tiene aria-label correcto', () => {
    renderWithRouter(<ProductCard evento={mockEvento} />);

    expect(screen.getByLabelText('Ver detalle de Concierto de Rock')).toBeInTheDocument();
  });
});
