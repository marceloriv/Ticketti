import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../test-utils';

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../src/services/api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

vi.mock('../../src/api/carritoApi', () => ({
  obtenerEstadisticasEventos: vi.fn(),
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
import { obtenerEstadisticasEventos } from '../../src/api/carritoApi';

describe('DashboardOrganizador', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ usuario: { id: 1, nombre: 'Org User', rol: 'ORGANIZADOR' } });
    api.get.mockResolvedValue({ data: [] });
    obtenerEstadisticasEventos.mockResolvedValue([]);
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
      data: [{ id: 1, nombre: 'Concierto', fecha: '2026-01-01', genero: 'ROCK', estado: 'PUBLICADO', stock: 50, aforo: 100, precioEntrada: 15000 }],
    });
    renderWithRouter(<DashboardOrganizador />);
    await waitFor(() => {
      expect(screen.getAllByText('Concierto').length).toBeGreaterThan(0);
    });
  });

  it('muestra estado PUBLICADO como badge', async () => {
    api.get.mockResolvedValue({
      data: [{ id: 1, nombre: 'Evento', fecha: '2026-01-01', genero: 'POP', estado: 'PUBLICADO', stock: 30, aforo: 100, precioEntrada: 10000 }],
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

  it('llama obtenerEstadisticasEventos con los IDs de los eventos', async () => {
    api.get.mockResolvedValue({
      data: [
        { id: 1, nombre: 'E1', fecha: '2026-01-01', genero: 'ROCK', estado: 'PUBLICADO', stock: 80, aforo: 100, precioEntrada: 15000 },
        { id: 2, nombre: 'E2', fecha: '2026-02-01', genero: 'POP', estado: 'PUBLICADO', stock: 50, aforo: 200, precioEntrada: 10000 },
      ],
    });
    obtenerEstadisticasEventos.mockResolvedValue([
      { eventoId: 1, entradasVendidas: 20, ingresos: 300000, entradasReembolsadas: 5 },
      { eventoId: 2, entradasVendidas: 150, ingresos: 1500000, entradasReembolsadas: 0 },
    ]);
    renderWithRouter(<DashboardOrganizador />);
    await waitFor(() => {
      expect(obtenerEstadisticasEventos).toHaveBeenCalledWith([1, 2]);
    });
  });

  it('muestra total de vendidas en el stat card', async () => {
    api.get.mockResolvedValue({
      data: [
        { id: 1, nombre: 'E1', fecha: '2026-01-01', genero: 'ROCK', estado: 'PUBLICADO', stock: 80, aforo: 100, precioEntrada: 15000 },
        { id: 2, nombre: 'E2', fecha: '2026-02-01', genero: 'POP', estado: 'PUBLICADO', stock: 50, aforo: 200, precioEntrada: 10000 },
      ],
    });
    obtenerEstadisticasEventos.mockResolvedValue([
      { eventoId: 1, entradasVendidas: 20, ingresos: 300000, entradasReembolsadas: 0 },
      { eventoId: 2, entradasVendidas: 150, ingresos: 1500000, entradasReembolsadas: 0 },
    ]);
    renderWithRouter(<DashboardOrganizador />);
    await waitFor(() => {
      expect(screen.getByText('170')).toBeInTheDocument();
    });
  });

  it('muestra total de ingresos en el stat card', async () => {
    api.get.mockResolvedValue({
      data: [
        { id: 1, nombre: 'E1', fecha: '2026-01-01', genero: 'ROCK', estado: 'PUBLICADO', stock: 80, aforo: 100, precioEntrada: 15000 },
        { id: 2, nombre: 'E2', fecha: '2026-02-01', genero: 'POP', estado: 'PUBLICADO', stock: 50, aforo: 200, precioEntrada: 10000 },
      ],
    });
    obtenerEstadisticasEventos.mockResolvedValue([
      { eventoId: 1, entradasVendidas: 20, ingresos: 300000, entradasReembolsadas: 0 },
      { eventoId: 2, entradasVendidas: 150, ingresos: 1500000, entradasReembolsadas: 0 },
    ]);
    renderWithRouter(<DashboardOrganizador />);
    await waitFor(() => {
      expect(screen.getByText('$1.800.000')).toBeInTheDocument();
    });
  });

  it('muestra tabla de ventas por evento con datos', async () => {
    api.get.mockResolvedValue({
      data: [
        { id: 1, nombre: 'Rock Night', fecha: '2026-06-01', genero: 'ROCK', estado: 'PUBLICADO', stock: 70, aforo: 100, precioEntrada: 20000 },
        { id: 2, nombre: 'Jazz Fest', fecha: '2026-07-01', genero: 'JAZZ', estado: 'PUBLICADO', stock: 180, aforo: 200, precioEntrada: 10000 },
      ],
    });
    obtenerEstadisticasEventos.mockResolvedValue([
      { eventoId: 1, entradasVendidas: 30, ingresos: 600000, entradasReembolsadas: 5 },
      { eventoId: 2, entradasVendidas: 20, ingresos: 200000, entradasReembolsadas: 0 },
    ]);
    renderWithRouter(<DashboardOrganizador />);
    await waitFor(() => {
      expect(screen.getAllByText('Rock Night').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Jazz Fest').length).toBeGreaterThan(0);
    });
  });

  it('muestra 0 vendidas y $0 cuando no hay estadisticas', async () => {
    api.get.mockResolvedValue({
      data: [{ id: 1, nombre: 'Sin Ventas', fecha: '2026-07-01', genero: 'JAZZ', estado: 'PUBLICADO', stock: 50, aforo: 50, precioEntrada: 10000 }],
    });
    obtenerEstadisticasEventos.mockResolvedValue([]);
    renderWithRouter(<DashboardOrganizador />);
    await waitFor(() => {
      expect(screen.getAllByText('Sin Ventas').length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    expect(screen.getAllByText('$0').length).toBeGreaterThan(0);
  });
});
