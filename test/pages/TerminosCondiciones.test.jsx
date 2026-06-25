import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../test-utils';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: vi.fn() };
});

import TerminosCondiciones from '../../src/pages/TerminosCondiciones';
import { useNavigate } from 'react-router-dom';

describe('TerminosCondiciones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(vi.fn());
    sessionStorage.clear();
  });

  it('renderiza el título principal', () => {
    renderWithRouter(<TerminosCondiciones />);
    expect(screen.getByText('Términos y Condiciones')).toBeInTheDocument();
  });

  it('renderiza las 8 secciones legales', () => {
    renderWithRouter(<TerminosCondiciones />);
    expect(screen.getByText('Uso de la plataforma')).toBeInTheDocument();
    expect(screen.getByText('Registro de usuario')).toBeInTheDocument();
    expect(screen.getByText('Responsabilidades del usuario')).toBeInTheDocument();
    expect(screen.getByText('Información entregada')).toBeInTheDocument();
    expect(screen.getByText('Eventos, compras y donaciones')).toBeInTheDocument();
    expect(screen.getByText('Suspensión de cuentas')).toBeInTheDocument();
    expect(screen.getByText('Disponibilidad del servicio')).toBeInTheDocument();
    expect(screen.getByText('Protección de datos personales')).toBeInTheDocument();
  });

  it('muestra el botón de confirmar lectura', () => {
    renderWithRouter(<TerminosCondiciones />);
    expect(screen.getByText('Leí los Términos y Condiciones')).toBeInTheDocument();
  });

  it('guarda en sessionStorage y navega al hacer click', async () => {
    const navigate = vi.fn();
    useNavigate.mockReturnValue(navigate);
    renderWithRouter(<TerminosCondiciones />);
    await userEvent.setup().click(screen.getByText('Leí los Términos y Condiciones'));
    expect(sessionStorage.getItem('terminosLeidos')).toBe('true');
    expect(navigate).toHaveBeenCalledWith('/registro');
  });
});
