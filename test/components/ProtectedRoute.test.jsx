import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../test-utils';

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn((token) => {
    if (token === 'valid-admin-token') {
      return { rol: 'ADMINPLATAFORMA', usuarioId: 1 };
    }
    if (token === 'valid-cliente-token') {
      return { rol: 'CLIENTE', usuarioId: 2 };
    }
    if (token === 'valid-organizador-token') {
      return { rol: 'ORGANIZADOR', usuarioId: 3 };
    }
    return null;
  }),
}));

import ProtectedRoute from '../../src/components/ProtectedRoute';
import { useAuth } from '../../src/hooks/useAuth';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('redirige a login cuando no está autenticado', () => {
    useAuth.mockReturnValue({ isAuthenticated: false });

    renderWithRouter(
      <ProtectedRoute element={<div>Contenido protegido</div>} />
    );

    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  it('muestra el contenido cuando está autenticado', () => {
    localStorage.setItem('token', 'valid-cliente-token');
    useAuth.mockReturnValue({ isAuthenticated: true });

    renderWithRouter(
      <ProtectedRoute element={<div>Contenido protegido</div>} />
    );

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });

  it('redirige a login cuando no hay token en localStorage', () => {
    useAuth.mockReturnValue({ isAuthenticated: true });

    renderWithRouter(
      <ProtectedRoute element={<div>Contenido protegido</div>} />
    );

    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  it('redirige a home cuando el rol no tiene acceso', () => {
    localStorage.setItem('token', 'valid-cliente-token');
    useAuth.mockReturnValue({ isAuthenticated: true });

    renderWithRouter(
      <ProtectedRoute element={<div>Admin only</div>} requiredRole="ADMINPLATAFORMA" />
    );

    expect(screen.queryByText('Admin only')).not.toBeInTheDocument();
  });

  it('permite acceso cuando el rol es jerárquicamente superior', () => {
    localStorage.setItem('token', 'valid-admin-token');
    useAuth.mockReturnValue({ isAuthenticated: true });

    renderWithRouter(
      <ProtectedRoute element={<div>Admin content</div>} requiredRole="CLIENTE" />
    );

    expect(screen.getByText('Admin content')).toBeInTheDocument();
  });

  it('permite acceso cuando el rol coincide exactamente', () => {
    localStorage.setItem('token', 'valid-cliente-token');
    useAuth.mockReturnValue({ isAuthenticated: true });

    renderWithRouter(
      <ProtectedRoute element={<div>Cliente content</div>} requiredRole="CLIENTE" />
    );

    expect(screen.getByText('Cliente content')).toBeInTheDocument();
  });

  it('permite acceso sin rol requerido', () => {
    localStorage.setItem('token', 'valid-cliente-token');
    useAuth.mockReturnValue({ isAuthenticated: true });

    renderWithRouter(
      <ProtectedRoute element={<div>Public content</div>} />
    );

    expect(screen.getByText('Public content')).toBeInTheDocument();
  });
});
