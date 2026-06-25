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

import Login from '../../src/pages/Login';
import { useAuth } from '../../src/hooks/useAuth';

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renderiza el formulario de login', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      login: vi.fn(),
    });

    renderWithRouter(<Login />);

    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByText('Ingresar')).toBeInTheDocument();
  });

  it('muestra el mensaje de bienvenida', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      login: vi.fn(),
    });

    renderWithRouter(<Login />);

    expect(screen.getByText('Ingresa tus credenciales para continuar')).toBeInTheDocument();
  });

  it('muestra enlace de registro', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      login: vi.fn(),
    });

    renderWithRouter(<Login />);

    expect(screen.getByText('Regístrate aquí')).toBeInTheDocument();
  });

  it('permite escribir en los campos de email y contraseña', async () => {
    const user = userEvent.setup();

    useAuth.mockReturnValue({
      isAuthenticated: false,
      login: vi.fn(),
    });

    renderWithRouter(<Login />);

    await user.type(screen.getByPlaceholderText('name@example.com'), 'test@test.com');
    await user.type(screen.getByPlaceholderText('Contraseña'), 'password123');

    expect(screen.getByPlaceholderText('name@example.com')).toHaveValue('test@test.com');
    expect(screen.getByPlaceholderText('Contraseña')).toHaveValue('password123');
  });

  it('llama a login al enviar el formulario', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockResolvedValue('token');

    useAuth.mockReturnValue({
      isAuthenticated: false,
      login: mockLogin,
    });

    renderWithRouter(<Login />);

    await user.type(screen.getByPlaceholderText('name@example.com'), 'test@test.com');
    await user.type(screen.getByPlaceholderText('Contraseña'), 'password123');
    await user.click(screen.getByText('Ingresar'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
    });
  });

  it('muestra error cuando falla el login', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockRejectedValue(new Error('Credenciales incorrectas'));

    useAuth.mockReturnValue({
      isAuthenticated: false,
      login: mockLogin,
    });

    renderWithRouter(<Login />);

    await user.type(screen.getByPlaceholderText('name@example.com'), 'test@test.com');
    await user.type(screen.getByPlaceholderText('Contraseña'), 'wrong');
    await user.click(screen.getByText('Ingresar'));

    await waitFor(() => {
      expect(screen.getByText('Credenciales incorrectas')).toBeInTheDocument();
    });
  });

  it('limpia la contraseña después de un error', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockRejectedValue(new Error('Error'));

    useAuth.mockReturnValue({
      isAuthenticated: false,
      login: mockLogin,
    });

    renderWithRouter(<Login />);

    await user.type(screen.getByPlaceholderText('name@example.com'), 'test@test.com');
    await user.type(screen.getByPlaceholderText('Contraseña'), 'wrong');
    await user.click(screen.getByText('Ingresar'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Contraseña')).toHaveValue('');
    });
  });
});
