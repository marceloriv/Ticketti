import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../../src/components/layout/Footer';

const renderFooter = () => {
  const { container } = render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );
  return container;
};

describe('Footer', () => {
  it('renderiza branding de Ticketti', () => {
    renderFooter();
    expect(screen.getByText('Ticketti')).toBeInTheDocument();
  });

  it('muestra año actual en copyright', () => {
    renderFooter();
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${year} Ticketti`))).toBeInTheDocument();
  });

  it('renderiza enlaces de navegación rápida', () => {
    renderFooter();
    expect(screen.getByText('Inicio')).toHaveAttribute('href', '/inicio');
    expect(screen.getByText('Eventos')).toHaveAttribute('href', '/eventos');
    expect(screen.getByText('Sobre Nosotros')).toHaveAttribute('href', '/nosotros');
    const contactoLinks = screen.getAllByText('Contacto');
    const navLink = contactoLinks.find(el => el.tagName === 'A');
    expect(navLink).toHaveAttribute('href', '/contacto');
  });

  it('renderiza enlaces sociales con target _blank', () => {
    renderFooter();
    const fb = screen.getByText('Facebook');
    expect(fb).toHaveAttribute('href', 'https://facebook.com/ticketti');
    expect(fb).toHaveAttribute('target', '_blank');

    const ig = screen.getByText('Instagram');
    expect(ig).toHaveAttribute('href', 'https://instagram.com/ticketti');
    expect(ig).toHaveAttribute('target', '_blank');
  });

  it('muestra información de contacto', () => {
    renderFooter();
    expect(screen.getByText(/Av\. Los Conquistadores/)).toBeInTheDocument();
    expect(screen.getByText('+56 2 2345 6789')).toBeInTheDocument();
    expect(screen.getByText('contacto@ticketti.cl')).toBeInTheDocument();
  });
});
