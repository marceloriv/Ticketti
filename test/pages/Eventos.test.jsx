import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithAuthAndRouter } from '../test-utils';

vi.mock('../../src/api/api', () => ({
  default: { get: vi.fn() },
}));

vi.mock('../../src/hooks/useCarrito', () => ({
  useCarrito: vi.fn(),
}));

vi.mock('../../src/hooks/useCarritoGuest', () => ({
  useCarritoGuest: vi.fn(),
}));

vi.mock('../../src/components/common/ProductCard', () => ({
  default: ({ evento }) => <div data-testid="product-card">{evento.titulo}</div>,
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

import Eventos from '../../src/pages/Eventos';
import api from '../../src/api/api';
import { useCarrito } from '../../src/hooks/useCarrito';
import { useCarritoGuest } from '../../src/hooks/useCarritoGuest';

const eventosMock = [
  { id: 1, nombre: 'Rock Festival', fecha: '2026-06-15', genero: 'ROCK', precioEntrada: 15000, recinto: { ubicacion: 'Santiago' } },
  { id: 2, nombre: 'Jazz Night', fecha: '2026-07-20', genero: 'JAZZ', precioEntrada: 20000, recinto: { ubicacion: 'Valparaíso' } },
];

describe('Eventos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: eventosMock });
    useCarrito.mockReturnValue({ inicializarCarrito: vi.fn(), agregarEntrada: vi.fn(), loading: false });
    useCarritoGuest.mockReturnValue({ agregarEntrada: vi.fn() });
  });

  it('renderiza header y footer', async () => {
    renderWithAuthAndRouter(<Eventos />);
    await waitFor(() => {
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('muestra spinner mientras carga', () => {
    api.get.mockReturnValue(new Promise(() => {}));
    renderWithAuthAndRouter(<Eventos />);
    expect(document.querySelector('.spinner-ticketti')).toBeInTheDocument();
  });

  it('carga y muestra eventos', async () => {
    renderWithAuthAndRouter(<Eventos />);
    await waitFor(() => {
      expect(screen.getByText('Rock Festival')).toBeInTheDocument();
    });
    expect(screen.getByText('Jazz Night')).toBeInTheDocument();
  });

  it('muestra error cuando falla la carga', async () => {
    api.get.mockRejectedValue(new Error('Network error'));
    renderWithAuthAndRouter(<Eventos />);
    await waitFor(() => {
      expect(screen.getByText(/No se pudieron cargar los eventos/)).toBeInTheDocument();
    });
  });

  it('muestra "No se encontraron eventos" cuando la lista está vacía', async () => {
    api.get.mockResolvedValue({ data: [] });
    renderWithAuthAndRouter(<Eventos />);
    await waitFor(() => {
      expect(screen.getByText(/No se encontraron eventos/)).toBeInTheDocument();
    });
  });

  it('renderiza tarjetas de producto para cada evento', async () => {
    renderWithAuthAndRouter(<Eventos />);
    await waitFor(() => {
      const cards = screen.getAllByTestId('product-card');
      expect(cards.length).toBe(2);
    });
  });

  it('muestra todos los eventos cuando categoría es "todo"', async () => {
    renderWithAuthAndRouter(<Eventos />);
    await waitFor(() => {
      expect(screen.getByText('Rock Festival')).toBeInTheDocument();
      expect(screen.getByText('Jazz Night')).toBeInTheDocument();
    });
  });
});
