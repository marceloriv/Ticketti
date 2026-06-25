import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CausaSocialCard from '../../../src/components/donaciones/CausaSocialCard';

const baseCausa = {
  idCausa: 1,
  nombre: 'Educación para Todos',
  descripcion: 'Brindar acceso a educación de calidad',
  fechaInicio: '2025-01-15',
  objetivoMonto: 5000000,
  estado: 'ACTIVA',
  imagenUrl: '/img/causa.jpg',
};

const renderCard = (props = {}) =>
  render(<CausaSocialCard causa={baseCausa} onVerDetalle={vi.fn()} {...props} />);

describe('CausaSocialCard', () => {
  it('renderiza nombre y descripción', () => {
    renderCard();
    expect(screen.getByText('Educación para Todos')).toBeInTheDocument();
    expect(screen.getByText('Brindar acceso a educación de calidad')).toBeInTheDocument();
  });

  it('formatea objetivoMonto como CLP', () => {
    renderCard();
    expect(screen.getByText(/\$5\.000\.000/)).toBeInTheDocument();
  });

  it('muestra imagen proporcionada', () => {
    renderCard();
    expect(screen.getByAltText('Educación para Todos')).toHaveAttribute('src', '/img/causa.jpg');
  });

  it('muestra "Sin imagen" cuando no hay imagenUrl', () => {
    renderCard({ causa: { ...baseCausa, imagenUrl: '' } });
    expect(screen.getByText('Sin imagen')).toBeInTheDocument();
  });

  it('muestra badge ACTIVA en verde', () => {
    renderCard();
    expect(screen.getByText('ACTIVA')).toHaveClass('bg-success');
  });

  it('muestra badge PENDIENTE en amarillo', () => {
    renderCard({ causa: { ...baseCausa, estado: 'PENDIENTE' } });
    expect(screen.getByText('PENDIENTE')).toHaveClass('bg-warning');
  });

  it('muestra fecha de inicio', () => {
    renderCard();
    expect(screen.getByText(/Inicio:.*2025-01-15/)).toBeInTheDocument();
  });

  it('ejecuta onVerDetalle al hacer click en "Ver detalle"', async () => {
    const onVerDetalle = vi.fn();
    renderCard({ onVerDetalle });
    await userEvent.setup().click(screen.getByText('Ver detalle'));
    expect(onVerDetalle).toHaveBeenCalledWith(expect.objectContaining({ nombre: 'Educación para Todos' }));
  });

  it('muestra fallback cuando no hay datos', () => {
    render(<CausaSocialCard causa={null} />);
    expect(screen.getByText('Causa social sin nombre')).toBeInTheDocument();
    expect(screen.getByText('Sin descripción disponible.')).toBeInTheDocument();
  });
});
