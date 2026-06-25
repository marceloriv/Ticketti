import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../test-utils';

vi.mock('../../src/components/layout/Header', () => ({
  default: () => <header data-testid="header" />,
}));

vi.mock('../../src/components/layout/Footer', () => ({
  default: () => <footer data-testid="footer" />,
}));

import Nosotros from '../../src/pages/Nosotros';

describe('Nosotros', () => {
  it('renderiza header y footer', () => {
    renderWithRouter(<Nosotros />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('muestra sección "Sobre Ticketti"', () => {
    renderWithRouter(<Nosotros />);
    expect(screen.getByText('Sobre Ticketti')).toBeInTheDocument();
  });

  it('muestra sección "Nuestra Historia"', () => {
    renderWithRouter(<Nosotros />);
    expect(screen.getByText('Nuestra Historia')).toBeInTheDocument();
  });

  it('muestra Misión y Visión', () => {
    renderWithRouter(<Nosotros />);
    expect(screen.getByText('Misión')).toBeInTheDocument();
    expect(screen.getByText('Visión')).toBeInTheDocument();
  });

  it('muestra los 4 valores', () => {
    renderWithRouter(<Nosotros />);
    expect(screen.getByText('Acceso')).toBeInTheDocument();
    expect(screen.getByText('Comunidad')).toBeInTheDocument();
    expect(screen.getByText('Impacto social')).toBeInTheDocument();
    expect(screen.getByText('Transparencia')).toBeInTheDocument();
  });

  it('muestra imagen de la historia', () => {
    renderWithRouter(<Nosotros />);
    expect(screen.getByAltText('Eventos con enfoque social')).toBeInTheDocument();
  });
});
