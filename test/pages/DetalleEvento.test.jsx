import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../src/hooks/useCarrito', () => ({
  useCarrito: vi.fn(),
}));

vi.mock('../../src/hooks/useCarritoGuest', () => ({
  useCarritoGuest: vi.fn(),
}));

vi.mock('../../src/api/index', () => ({
  eventosApi: { buscarEvento: vi.fn() },
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

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useParams: vi.fn() };
});

import DetalleEvento from '../../src/pages/DetalleEvento';
import { useCarrito } from '../../src/hooks/useCarrito';
import { useCarritoGuest } from '../../src/hooks/useCarritoGuest';
import { eventosApi } from '../../src/api/index';
import { useAuth } from '../../src/hooks/useAuth';
import { useParams } from 'react-router-dom';
import { renderWithAuthAndRouter } from '../test-utils';

describe('DetalleEvento', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useParams.mockReturnValue({ id: '1' });
    useAuth.mockReturnValue({
      usuario: { id: 1 },
      isAuthenticated: true,
      establecerCarritoId: vi.fn(),
    });
    useCarrito.mockReturnValue({
      agregarEntrada: vi.fn(),
      inicializarCarrito: vi.fn().mockResolvedValue({ carritoId: 10 }),
      loading: false,
    });
    useCarritoGuest.mockReturnValue({
      agregarEntrada: vi.fn(),
    });
    eventosApi.buscarEvento.mockResolvedValue({
      id: 1,
      nombre: 'Concierto Rock',
      descripcion: 'Un gran concierto',
      fecha: '2026-06-15T20:00:00',
      precioEntrada: 15000,
      stock: 100,
      recinto: { nombre: 'Estadio', ubicacion: 'Santiago' },
      organizador: { nombre: 'Org1' },
      genero: 'Rock',
    });
  });

  it('renderiza spinner mientras carga', () => {
    eventosApi.buscarEvento.mockReturnValue(new Promise(() => {}));
    renderWithAuthAndRouter(<DetalleEvento />, { route: '/eventos/1' });
    expect(screen.getByText(/Cargando detalles del evento/i)).toBeInTheDocument();
  });

  it('muestra los detalles del evento al cargar', async () => {
    renderWithAuthAndRouter(<DetalleEvento />, { route: '/eventos/1' });
    await waitFor(() => {
      expect(screen.getByText('Concierto Rock')).toBeInTheDocument();
    });
  });

  it('muestra precio formateado', async () => {
    renderWithAuthAndRouter(<DetalleEvento />, { route: '/eventos/1' });
    await waitFor(() => {
      expect(screen.getByText(/\$15\.000/)).toBeInTheDocument();
    });
  });

  it('muestra nombre del recinto', async () => {
    renderWithAuthAndRouter(<DetalleEvento />, { route: '/eventos/1' });
    await waitFor(() => {
      expect(screen.getByText(/Estadio/)).toBeInTheDocument();
    });
  });

  it('muestra género del evento', async () => {
    renderWithAuthAndRouter(<DetalleEvento />, { route: '/eventos/1' });
    await waitFor(() => {
      expect(screen.getByText('Rock')).toBeInTheDocument();
    });
  });

  it('muestra botón de comprar entrada', async () => {
    renderWithAuthAndRouter(<DetalleEvento />, { route: '/eventos/1' });
    await waitFor(() => {
      expect(screen.getByText(/Comprar entrada/i)).toBeInTheDocument();
    });
  });

  it('muestra Gratis cuando precio es 0', async () => {
    eventosApi.buscarEvento.mockResolvedValue({
      id: 2,
      nombre: 'Evento Gratis',
      precioEntrada: 0,
      stock: 50,
      recinto: { nombre: 'Teatro', ubicacion: 'Valparaíso' },
      organizador: { nombre: 'Org2' },
      genero: 'Teatro',
    });
    renderWithAuthAndRouter(<DetalleEvento />, { route: '/eventos/2' });
    await waitFor(() => {
      expect(screen.getByText('Gratis')).toBeInTheDocument();
    });
  });

  it('muestra error cuando falla la carga', async () => {
    eventosApi.buscarEvento.mockRejectedValue(new Error('No encontrado'));
    renderWithAuthAndRouter(<DetalleEvento />, { route: '/eventos/1' });
    await waitFor(() => {
      expect(screen.getByText(/No se pudo cargar el evento/)).toBeInTheDocument();
    });
  });

  it('deshabilita botón cuando stock es 0', async () => {
    eventosApi.buscarEvento.mockResolvedValue({
      id: 3,
      nombre: 'Sin Stock',
      precioEntrada: 10000,
      stock: 0,
      recinto: { nombre: 'Sala', ubicacion: 'Concepción' },
      organizador: { nombre: 'Org3' },
      genero: 'Música',
    });
    renderWithAuthAndRouter(<DetalleEvento />, { route: '/eventos/3' });
    await waitFor(() => {
      expect(screen.getByText('Agotado')).toBeInTheDocument();
    });
  });
});
