import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../test-utils';

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../src/hooks/useCarrito', () => ({
  useCarrito: vi.fn(() => ({
    resumen: null,
    loading: false,
    error: null,
    inicializarCarrito: vi.fn(),
    obtenerResumen: vi.fn(),
  })),
}));

vi.mock('../../src/hooks/useCarritoGuest', () => ({
  useCarritoGuest: vi.fn(() => ({
    totalEntradas: 0,
  })),
}));

vi.mock('../../src/api/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

import Registro from '../../src/pages/Registro';
import { useAuth } from '../../src/hooks/useAuth';

describe('Registro', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('renderiza el formulario de registro', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
    });

    renderWithRouter(<Registro />);

    expect(screen.getByText('Registro')).toBeInTheDocument();
    expect(screen.getByText('Nombre de usuario (*)')).toBeInTheDocument();
    expect(screen.getByText('Email (*)')).toBeInTheDocument();
    expect(screen.getByText('Contraseña (*)')).toBeInTheDocument();
    expect(screen.getByText('Registrarse')).toBeInTheDocument();
  });

  it('muestra los requisitos mínimos', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
    });

    renderWithRouter(<Registro />);

    expect(screen.getByText('Requisitos mínimos para registrarte')).toBeInTheDocument();
    expect(screen.getByText(/El nombre debe tener entre 3 y 100 caracteres/)).toBeInTheDocument();
  });

  it('muestra enlace de login', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
    });

    renderWithRouter(<Registro />);

    expect(screen.getByText('Inicia sesión')).toBeInTheDocument();
  });

  it('permite escribir en los campos del formulario', async () => {
    const user = userEvent.setup();

    useAuth.mockReturnValue({
      isAuthenticated: false,
    });

    renderWithRouter(<Registro />);

    await user.type(screen.getByPlaceholderText('Ingresa tu nombre de usuario'), 'Test User');
    await user.type(screen.getByPlaceholderText('Ingresa tu correo'), 'test@test.com');

    expect(screen.getByPlaceholderText('Ingresa tu nombre de usuario')).toHaveValue('Test User');
    expect(screen.getByPlaceholderText('Ingresa tu correo')).toHaveValue('test@test.com');
  });

  it('el botón está deshabilitado cuando no se han leído los documentos', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
    });

    renderWithRouter(<Registro />);

    expect(screen.getByText('Registrarse')).toBeDisabled();
  });
});
