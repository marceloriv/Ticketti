import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../test-utils';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: vi.fn() };
});

import PoliticaPrivacidad from '../../src/pages/PoliticaPrivacidad';
import { useNavigate } from 'react-router-dom';

describe('PoliticaPrivacidad', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(vi.fn());
    sessionStorage.clear();
  });

  it('renderiza el título principal', () => {
    renderWithRouter(<PoliticaPrivacidad />);
    expect(screen.getByText('Política de Privacidad')).toBeInTheDocument();
  });

  it('renderiza las 8 secciones legales', () => {
    renderWithRouter(<PoliticaPrivacidad />);
    expect(screen.getByText('Datos personales que recopilamos')).toBeInTheDocument();
    expect(screen.getByText('Finalidad del tratamiento')).toBeInTheDocument();
    expect(screen.getByText('Consentimiento del usuario')).toBeInTheDocument();
    expect(screen.getByText('Uso limitado de la información')).toBeInTheDocument();
    expect(screen.getByText('Seguridad y confidencialidad')).toBeInTheDocument();
    expect(screen.getByText('Conservación de los datos')).toBeInTheDocument();
    expect(screen.getByText('Comunicación a terceros')).toBeInTheDocument();
    expect(screen.getByText('Derechos del usuario')).toBeInTheDocument();
  });

  it('muestra el botón de confirmar lectura', () => {
    renderWithRouter(<PoliticaPrivacidad />);
    expect(screen.getByText('Leí la Política de Privacidad')).toBeInTheDocument();
  });

  it('guarda en sessionStorage y navega al hacer click', async () => {
    const navigate = vi.fn();
    useNavigate.mockReturnValue(navigate);
    renderWithRouter(<PoliticaPrivacidad />);
    await userEvent.setup().click(screen.getByText('Leí la Política de Privacidad'));
    expect(sessionStorage.getItem('privacidadLeida')).toBe('true');
    expect(navigate).toHaveBeenCalledWith('/registro');
  });
});
