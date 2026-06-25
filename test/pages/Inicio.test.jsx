import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithAuthAndRouter } from '../test-utils';

vi.mock('../../src/api/api', () => ({
  default: { get: vi.fn() },
}));

vi.mock('../../src/api/donacionesApi', () => ({
  getCausasActivas: vi.fn().mockResolvedValue([]),
  getOrganizacionesActivas: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../src/hooks/useCarrito', () => ({
  useCarrito: vi.fn(),
}));

vi.mock('../../src/hooks/useCarritoGuest', () => ({
  useCarritoGuest: vi.fn(),
}));

vi.mock('../../src/components/common/Carousel', () => ({
  default: ({ slides }) => (
    <div data-testid="carousel">
      {slides.map(s => <div key={s.id}>{s.titulo}</div>)}
    </div>
  ),
}));

vi.mock('../../src/components/common/ProductCard', () => ({
  default: ({ evento }) => <div data-testid="product-card">{evento.titulo}</div>,
}));

vi.mock('../../src/components/common/CategoryCard', () => ({
  default: ({ title }) => <div data-testid="category-card">{title}</div>,
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

import Inicio from '../../src/pages/Inicio';
import api from '../../src/api/api';
import { useCarrito } from '../../src/hooks/useCarrito';
import { useCarritoGuest } from '../../src/hooks/useCarritoGuest';

const eventosMock = [
  { id: 1, nombre: 'Rock Festival', precioEntrada: 15000 },
  { id: 2, nombre: 'Jazz Night', precioEntrada: 20000 },
  { id: 3, nombre: 'Cine al Aire Libre', precioEntrada: 5000 },
];

describe('Inicio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: eventosMock });
    useCarrito.mockReturnValue({ inicializarCarrito: vi.fn().mockResolvedValue({ carritoId: 1 }), agregarEntrada: vi.fn(), loading: false });
    useCarritoGuest.mockReturnValue({ agregarEntrada: vi.fn() });
  });

  it('renderiza header y footer', async () => {
    renderWithAuthAndRouter(<Inicio />);
    await waitFor(() => {
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renderiza el carousel con slides', async () => {
    renderWithAuthAndRouter(<Inicio />);
    await waitFor(() => {
      expect(screen.getByTestId('carousel')).toBeInTheDocument();
    });
    expect(screen.getByText('Mejores Eventos')).toBeInTheDocument();
  });

  it('muestra el buscador', async () => {
    renderWithAuthAndRouter(<Inicio />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Buscar eventos/)).toBeInTheDocument();
    });
  });

  it('muestra las categorías', async () => {
    renderWithAuthAndRouter(<Inicio />);
    await waitFor(() => {
      const categoryCards = screen.getAllByTestId('category-card');
      expect(categoryCards.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('carga y muestra eventos destacados', async () => {
    renderWithAuthAndRouter(<Inicio />);
    await waitFor(() => {
      expect(screen.getByText('Eventos Destacados')).toBeInTheDocument();
    });
  });

  it('muestra spinner mientras carga eventos', async () => {
    api.get.mockReturnValue(new Promise(() => {}));
    renderWithAuthAndRouter(<Inicio />);
    await waitFor(() => {
      expect(document.querySelector('.spinner-ticketti')).toBeTruthy();
    });
  });

  it('muestra error cuando falla la carga', async () => {
    api.get.mockRejectedValue(new Error('Error'));
    renderWithAuthAndRouter(<Inicio />);
    await waitFor(() => {
      expect(screen.getByText(/No se pudieron cargar los eventos/)).toBeInTheDocument();
    });
  });

  it('muestra botón "Ver todos los eventos"', async () => {
    renderWithAuthAndRouter(<Inicio />);
    await waitFor(() => {
      expect(screen.getByText('Ver todos los eventos')).toBeInTheDocument();
    });
  });
});
