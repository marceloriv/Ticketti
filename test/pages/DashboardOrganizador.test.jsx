import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../test-utils';

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../src/services/api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
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

import DashboardOrganizador from '../../src/pages/DashboardOrganizador';
import { useAuth } from '../../src/hooks/useAuth';
import api from '../../src/services/api';

describe('DashboardOrganizador', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ usuario: { id: 1, nombre: 'Org User', rol: 'ORGANIZADOR' } });
    api.get.mockResolvedValue({ data: [] });
  });

  it('renderiza el dashboard del organizador', async () => {
    renderWithRouter(<DashboardOrganizador />);
    await waitFor(() => {
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('carga los eventos del organizador al montar', async () => {
    api.get.mockResolvedValue({ data: [{ id: 1, nombre: 'Mi Evento' }] });
    renderWithRouter(<DashboardOrganizador />);
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/eventos/mis');
    });
  });

  it('muestra eventos en la tabla', async () => {
    api.get.mockResolvedValue({
      data: [{ id: 1, nombre: 'Concierto', fecha: '2026-01-01', genero: 'ROCK', estado: 'PUBLICADO', stock: 50, precioEntrada: 15000 }],
    });
    renderWithRouter(<DashboardOrganizador />);
    await waitFor(() => {
      expect(screen.getByText('Concierto')).toBeInTheDocument();
    });
  });

  it('muestra estado PUBLICADO como badge', async () => {
    api.get.mockResolvedValue({
      data: [{ id: 1, nombre: 'Evento', fecha: '2026-01-01', genero: 'POP', estado: 'PUBLICADO', stock: 30, precioEntrada: 10000 }],
    });
    renderWithRouter(<DashboardOrganizador />);
    await waitFor(() => {
      expect(screen.getByText('PUBLICADO')).toBeInTheDocument();
    });
  });

  it('muestra tabs del dashboard', async () => {
    renderWithRouter(<DashboardOrganizador />);
    await waitFor(() => {
      expect(screen.getAllByText(/Ventas por Evento/i).length).toBeGreaterThan(0);
    });
  });

  it('muestra tab de Reportes', async () => {
    renderWithRouter(<DashboardOrganizador />);
    await waitFor(() => {
      expect(screen.getAllByText(/Reportes/i).length).toBeGreaterThan(0);
    });
  });

  it('renderiza placeholders para microservicios pendientes', async () => {
    renderWithRouter(<DashboardOrganizador />);
    await waitFor(() => {
      expect(screen.getAllByText(/Pendiente/i).length).toBeGreaterThan(0);
    });
  });
});
