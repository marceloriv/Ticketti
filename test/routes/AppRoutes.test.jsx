import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../src/components/layout/Header', () => ({
  default: () => <header data-testid="header" />,
}));

vi.mock('../../src/components/layout/Footer', () => ({
  default: () => <footer data-testid="footer" />,
}));

vi.mock('../../src/utils/logger', () => ({
  default: { log: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('../../src/pages/Inicio', () => ({
  default: () => <div data-testid="page-inicio">Inicio</div>,
}));

vi.mock('../../src/pages/Contacto', () => ({
  default: () => <div data-testid="page-contacto">Contacto</div>,
}));

vi.mock('../../src/pages/Nosotros', () => ({
  default: () => <div data-testid="page-nosotros">Nosotros</div>,
}));

vi.mock('../../src/pages/Eventos', () => ({
  default: () => <div data-testid="page-eventos">Eventos</div>,
}));

vi.mock('../../src/pages/Login', () => ({
  default: () => <div data-testid="page-login">Login</div>,
}));

vi.mock('../../src/pages/Registro', () => ({
  default: () => <div data-testid="page-registro">Registro</div>,
}));

vi.mock('../../src/pages/DetalleEvento', () => ({
  default: () => <div data-testid="page-detalle-evento">DetalleEvento</div>,
}));

vi.mock('../../src/pages/PoliticaPrivacidad', () => ({
  default: () => <div data-testid="page-privacidad">Privacidad</div>,
}));

vi.mock('../../src/pages/TerminosCondiciones', () => ({
  default: () => <div data-testid="page-terminos">Terminos</div>,
}));

vi.mock('../../src/pages/PerfilCliente', () => ({
  default: () => <div data-testid="page-perfil">Perfil</div>,
}));

vi.mock('../../src/pages/HistorialNotificaciones', () => ({
  default: () => <div data-testid="page-notificaciones">Notificaciones</div>,
}));

vi.mock('../../src/pages/DashboardAdmin', () => ({
  default: () => <div data-testid="page-admin">Admin</div>,
}));

vi.mock('../../src/pages/DashboardOrganizador', () => ({
  default: () => <div data-testid="page-organizador">Organizador</div>,
}));

vi.mock('../../src/pages/PaginaCarrito', () => ({
  default: () => <div data-testid="page-carrito">Carrito</div>,
}));

import AppRoutes from '../../src/routes/AppRoutes';
import { useAuth } from '../../src/hooks/useAuth';

const renderWithRouter = (route = '/') => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AppRoutes />
    </MemoryRouter>
  );
};

describe('AppRoutes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false });
  });

  it('renderiza la página de Inicio en /', () => {
    renderWithRouter('/');
    expect(screen.getByTestId('page-inicio')).toBeInTheDocument();
  });

  it('renderiza Contacto en /contacto', () => {
    renderWithRouter('/contacto');
    expect(screen.getByTestId('page-contacto')).toBeInTheDocument();
  });

  it('renderiza Nosotros en /nosotros', () => {
    renderWithRouter('/nosotros');
    expect(screen.getByTestId('page-nosotros')).toBeInTheDocument();
  });

  it('renderiza Login en /login', () => {
    renderWithRouter('/login');
    expect(screen.getByTestId('page-login')).toBeInTheDocument();
  });

  it('renderiza Registro en /registro', () => {
    renderWithRouter('/registro');
    expect(screen.getByTestId('page-registro')).toBeInTheDocument();
  });

  it('redirige a /inicio cuando el usuario autenticado visita /login', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false });
    renderWithRouter('/login');
    expect(screen.getByTestId('page-inicio')).toBeInTheDocument();
  });

  it('redirige a /inicio cuando el usuario autenticado visita /registro', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false });
    renderWithRouter('/registro');
    expect(screen.getByTestId('page-inicio')).toBeInTheDocument();
  });

  it('redirige rutas no encontradas a /', () => {
    renderWithRouter('/ruta-inexistente');
    expect(screen.getByTestId('page-inicio')).toBeInTheDocument();
  });

  it('muestra spinner durante la carga de autenticación', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: true });
    renderWithRouter('/');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
