import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../src/hooks/useCarrito', () => ({
  useCarrito: vi.fn(),
}));

vi.mock('../../src/hooks/useCarritoGuest', () => ({
  useCarritoGuest: vi.fn(),
}));

vi.mock('../../src/components/ListaEntradasCarrito', () => ({
  default: ({ entradas, onEliminar }) => (
    <div data-testid="lista-entradas">
      {entradas?.map((e, i) => (
        <div key={i}>
          <span>{e.nombreEvento || `Evento ${e.eventoId}`}</span>
          <button onClick={() => onEliminar(e.idDetalle || e.eventoId)}>Eliminar</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('../../src/components/ResumenCarrito', () => ({
  default: ({ onCheckout, isGuest, esCarritoPagado }) => (
    <div data-testid="resumen-carrito">
      <button onClick={() => onCheckout?.(1)}>Checkout</button>
      {isGuest && <span>Invitado</span>}
      {esCarritoPagado && <span>Pagado</span>}
    </div>
  ),
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

import PaginaCarrito from '../../src/pages/PaginaCarrito';
import { useAuth } from '../../src/hooks/useAuth';
import { useCarrito } from '../../src/hooks/useCarrito';
import { useCarritoGuest } from '../../src/hooks/useCarritoGuest';
import { useParams } from 'react-router-dom';
import { renderWithAuthAndRouter } from '../test-utils';

describe('PaginaCarrito', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useParams.mockReturnValue({ carritoId: '1' });
    useAuth.mockReturnValue({
      isAuthenticated: true,
      establecerCarritoId: vi.fn(),
    });
    useCarrito.mockReturnValue({
      resumen: { items: [{ idDetalle: 1, nombreEvento: 'Concierto', cantidad: 2, precioUnitario: 10000 }], total: 20000, subtotal: 20000, donacion: 2000, estadoCarrito: 'CREADO' },
      carritoCreado: null,
      loading: false,
      error: null,
      obtenerResumen: vi.fn().mockResolvedValue({ estadoCarrito: 'CREADO' }),
      eliminarEntrada: vi.fn(),
      renovarReserva: vi.fn(),
      iniciarCheckout: vi.fn().mockResolvedValue({}),
      limpiarError: vi.fn(),
      inicializarCarrito: vi.fn().mockResolvedValue({ carritoId: 1 }),
    });
    useCarritoGuest.mockReturnValue({
      cart: [],
      eliminarEntrada: vi.fn(),
      subtotal: 0,
      donacion: 0,
      total: 0,
      isEmpty: true,
    });
  });

  it('renderiza el carrito con items', async () => {
    renderWithAuthAndRouter(<PaginaCarrito />, { route: '/carrito/1' });
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('lista-entradas')).toBeInTheDocument();
    expect(screen.getByTestId('resumen-carrito')).toBeInTheDocument();
  });

  it('muestra el resumen del carrito', async () => {
    renderWithAuthAndRouter(<PaginaCarrito />, { route: '/carrito/1' });
    expect(screen.getByText(/Mi Carrito de Compras/i)).toBeInTheDocument();
  });

  it('muestra mensaje de carrito vacío para invitado', () => {
    useParams.mockReturnValue({ carritoId: undefined });
    useAuth.mockReturnValue({ isAuthenticated: false });
    useCarritoGuest.mockReturnValue({
      cart: [],
      eliminarEntrada: vi.fn(),
      subtotal: 0,
      donacion: 0,
      total: 0,
      isEmpty: true,
    });
    renderWithAuthAndRouter(<PaginaCarrito />, { route: '/carrito' });
    expect(screen.getByText(/Carrito Vacío/i)).toBeInTheDocument();
  });

  it('muestra spinner mientras carga', () => {
    useCarrito.mockReturnValue({
      resumen: null,
      carritoCreado: null,
      loading: true,
      error: null,
      obtenerResumen: vi.fn().mockResolvedValue(null),
      eliminarEntrada: vi.fn(),
      renovarReserva: vi.fn(),
      iniciarCheckout: vi.fn(),
      limpiarError: vi.fn(),
      inicializarCarrito: vi.fn(),
    });
    renderWithAuthAndRouter(<PaginaCarrito />, { route: '/carrito/1' });
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('muestra error cuando hay error en el carrito', () => {
    useCarrito.mockReturnValue({
      resumen: null,
      carritoCreado: null,
      loading: false,
      error: 'Carrito no encontrado',
      obtenerResumen: vi.fn().mockResolvedValue(null),
      eliminarEntrada: vi.fn(),
      renovarReserva: vi.fn(),
      iniciarCheckout: vi.fn(),
      limpiarError: vi.fn(),
      inicializarCarrito: vi.fn(),
    });
    renderWithAuthAndRouter(<PaginaCarrito />, { route: '/carrito/1' });
    expect(screen.getByText('Carrito no encontrado')).toBeInTheDocument();
  });

  it('muestra carrito pagado como badge', () => {
    useCarrito.mockReturnValue({
      resumen: { items: [], total: 0, estadoCarrito: 'PAGADO' },
      carritoCreado: null,
      loading: false,
      error: null,
      obtenerResumen: vi.fn().mockResolvedValue({ estadoCarrito: 'PAGADO' }),
      eliminarEntrada: vi.fn(),
      renovarReserva: vi.fn(),
      iniciarCheckout: vi.fn(),
      limpiarError: vi.fn(),
      inicializarCarrito: vi.fn(),
    });
    renderWithAuthAndRouter(<PaginaCarrito />, { route: '/carrito/1' });
    expect(screen.getByText(/Pagado/i)).toBeInTheDocument();
  });

  it('invitado puede ver items del carrito guest', () => {
    useParams.mockReturnValue({ carritoId: undefined });
    useAuth.mockReturnValue({ isAuthenticated: false });
    useCarritoGuest.mockReturnValue({
      cart: [{ eventoId: 1, nombreEvento: 'Festival', cantidad: 1 }],
      eliminarEntrada: vi.fn(),
      subtotal: 10000,
      donacion: 1000,
      total: 11000,
      isEmpty: false,
    });
    renderWithAuthAndRouter(<PaginaCarrito />);
    expect(screen.getByText('Festival')).toBeInTheDocument();
  });
});
