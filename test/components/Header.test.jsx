import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
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
    cart: [],
  })),
}));

import Header from '../../src/components/layout/Header';
import { useAuth } from '../../src/hooks/useAuth';

describe('Header', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('muestra el logo de Ticketti', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      usuario: null,
      logout: vi.fn(),
    });

    renderWithRouter(<Header />);

    expect(screen.getByText('Ticketti')).toBeInTheDocument();
  });

  it('muestra los enlaces de navegación públicos', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      usuario: null,
      logout: vi.fn(),
    });

    renderWithRouter(<Header />);

    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Eventos')).toBeInTheDocument();
    expect(screen.getByText('Sobre Ticketti')).toBeInTheDocument();
    expect(screen.getByText('Contacto')).toBeInTheDocument();
  });

  it('muestra botón de acceso cuando no está autenticado', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      usuario: null,
      logout: vi.fn(),
    });

    renderWithRouter(<Header />, {
      authValue: { isAuthenticated: false, usuario: null },
    });

    expect(screen.getByText('Acceso')).toBeInTheDocument();
  });

  it('muestra botón de salir cuando está autenticado', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      usuario: { nombre: 'Test User', rol: 'CLIENTE' },
      logout: vi.fn(),
    });

    renderWithRouter(<Header />);

    expect(screen.getByText('Salir')).toBeInTheDocument();
  });

  it('muestra el nombre del usuario cuando está autenticado', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      usuario: { nombre: 'Juan', rol: 'CLIENTE' },
      logout: vi.fn(),
    });

    renderWithRouter(<Header />);

    expect(screen.getByText('Juan')).toBeInTheDocument();
  });

  it('muestra el botón del carrito', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      usuario: null,
      logout: vi.fn(),
    });

    renderWithRouter(<Header />);

    expect(screen.getByText('Carrito')).toBeInTheDocument();
  });

  it('ejecuta logout al hacer click en salir', async () => {
    const user = userEvent.setup();
    const mockLogout = vi.fn();

    useAuth.mockReturnValue({
      isAuthenticated: true,
      usuario: { nombre: 'Test', rol: 'CLIENTE' },
      logout: mockLogout,
    });

    renderWithRouter(<Header />);

    await user.click(screen.getByLabelText('Cerrar sesión de la cuenta'));

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
