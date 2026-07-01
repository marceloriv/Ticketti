import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../test-utils';

vi.mock('../../src/api/donacionesApi', () => ({
  getOrganizaciones: vi.fn(),
  getCausas: vi.fn(),
  getTotalPorOrganizacion: vi.fn(),
  crearOrganizacionActiva: vi.fn(),
  crearCausaActiva: vi.fn(),
  activarOrganizacion: vi.fn(),
}));

vi.mock('../../src/api/eventosApi', () => ({
  listarEventos: vi.fn(),
}));

vi.mock('../../src/api/carritoApi', () => ({
  obtenerEstadisticasEventos: vi.fn(),
}));

vi.mock('../../src/api/usuariosApi', () => ({
  listarUsuarios: vi.fn(),
  actualizarUsuario: vi.fn(),
  eliminarUsuario: vi.fn(),
}));

vi.mock('../../src/components/Admin/DashAdminUsuarios', () => ({
  default: () => <div data-testid="admin-usuarios" />,
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

import DashboardAdmin from '../../src/pages/DashboardAdmin';
import {
  getOrganizaciones,
  getCausas,
  getTotalPorOrganizacion,
} from '../../src/api/donacionesApi';
import { listarEventos } from '../../src/api/eventosApi';
import { listarUsuarios } from '../../src/api/usuariosApi';
import { obtenerEstadisticasEventos } from '../../src/api/carritoApi';

describe('DashboardAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getOrganizaciones.mockResolvedValue([]);
    getCausas.mockResolvedValue([]);
    getTotalPorOrganizacion.mockResolvedValue(0);
    listarEventos.mockResolvedValue([]);
    listarUsuarios.mockResolvedValue([]);
    obtenerEstadisticasEventos.mockResolvedValue([]);
  });

  it('renderiza el dashboard de admin', async () => {
    renderWithRouter(<DashboardAdmin />);
    await waitFor(() => {
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('carga organizaciones al montar', async () => {
    getOrganizaciones.mockResolvedValue([{ idOrganizacion: 1, nombre: 'Org1', estado: 'ACTIVA' }]);
    renderWithRouter(<DashboardAdmin />);
    await waitFor(() => {
      expect(getOrganizaciones).toHaveBeenCalled();
    });
  });

  it('carga causas al montar', async () => {
    getCausas.mockResolvedValue([{ idCausa: 1, nombre: 'Causa1' }]);
    renderWithRouter(<DashboardAdmin />);
    await waitFor(() => {
      expect(getCausas).toHaveBeenCalled();
    });
  });

  it('muestra organizaciones en la tabla', async () => {
    getOrganizaciones.mockResolvedValue([
      { idOrganizacion: 1, nombre: 'Fundación Test', estado: 'ACTIVA', email: 'org@test.com' },
    ]);
    renderWithRouter(<DashboardAdmin />);
    await waitFor(() => {
      expect(screen.getByText('Fundación Test')).toBeInTheDocument();
    });
  });

  it('muestra badge ACTIVA para organizaciones activas', async () => {
    getOrganizaciones.mockResolvedValue([
      { idOrganizacion: 1, nombre: 'Org', estado: 'ACTIVA' },
    ]);
    renderWithRouter(<DashboardAdmin />);
    await waitFor(() => {
      expect(screen.getByText('ACTIVA')).toBeInTheDocument();
    });
  });

  it('muestra badge PENDIENTE para organizaciones pendientes', async () => {
    getOrganizaciones.mockResolvedValue([
      { idOrganizacion: 1, nombre: 'Org Pend', estado: 'PENDIENTE' },
    ]);
    renderWithRouter(<DashboardAdmin />);
    await waitFor(() => {
      expect(screen.getByText('PENDIENTE')).toBeInTheDocument();
    });
  });

  it('muestra causas sociales en la tabla', async () => {
    getCausas.mockResolvedValue([{ idCausa: 1, nombre: 'Causa Educación' }]);
    renderWithRouter(<DashboardAdmin />);
    await waitFor(() => {
      expect(screen.getByText('Causa Educación')).toBeInTheDocument();
    });
  });

  it('muestra estadísticas de organizaciones', async () => {
    getOrganizaciones.mockResolvedValue([
      { idOrganizacion: 1, nombre: 'A' },
      { idOrganizacion: 2, nombre: 'B' },
    ]);
    renderWithRouter(<DashboardAdmin />);
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('muestra total recaudado', async () => {
    getTotalPorOrganizacion.mockResolvedValue(50000);
    getOrganizaciones.mockResolvedValue([{ idOrganizacion: 1 }]);
    renderWithRouter(<DashboardAdmin />);
    await waitFor(() => {
      const matches = screen.getAllByText(/\$50\.000/);
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });
  });
});
