import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ListaEntradasCarrito from '../../src/components/ListaEntradasCarrito';

vi.mock('../../src/api/eventosApi', () => ({
  buscarEvento: vi.fn(),
}));

vi.mock('../../src/utils/logger', () => ({
  default: { log: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { buscarEvento } from '../../src/api/eventosApi';

const items = [
  { idDetalle: 1, eventoId: 10, eventoNombre: 'Rock Festival', imagenUrl: '/img/rock.jpg', tipoEntrada: 'General', cantidad: 2, precioUnitario: 15000 },
  { idDetalle: 2, eventoId: 20, eventoNombre: 'Jazz Night', imagenUrl: '/img/jazz.jpg', tipoEntrada: 'VIP', cantidad: 1, precioUnitario: 25000 },
];

describe('ListaEntradasCarrito', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buscarEvento.mockResolvedValue({ nombre: 'Evento', imagenUrl: '/img/event.jpg' });
  });

  it('renderiza items del carrito', () => {
    render(<ListaEntradasCarrito entradas={items} onEliminar={vi.fn()} />);
    expect(screen.getByText('Rock Festival')).toBeInTheDocument();
    expect(screen.getByText('Jazz Night')).toBeInTheDocument();
  });

  it('muestra tipos de entrada', () => {
    render(<ListaEntradasCarrito entradas={items} onEliminar={vi.fn()} />);
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('VIP')).toBeInTheDocument();
  });

  it('muestra cantidades', () => {
    render(<ListaEntradasCarrito entradas={items} onEliminar={vi.fn()} />);
    const qtyElements = screen.getAllByText(/Cant:/);
    expect(qtyElements.length).toBe(2);
  });

  it('muestra estado vacío cuando no hay items', () => {
    render(<ListaEntradasCarrito entradas={[]} onEliminar={vi.fn()} />);
    expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
  });

  it('muestra estado vacío con objeto entradas.items vacío', () => {
    render(<ListaEntradasCarrito entradas={{ items: [] }} onEliminar={vi.fn()} />);
    expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
  });

  it('muestra botón de eliminar', () => {
    render(<ListaEntradasCarrito entradas={items} onEliminar={vi.fn()} />);
    const deleteButtons = screen.getAllByText('').filter(el => el.closest('button'));
    expect(deleteButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('muestra botón de renovar cuando puedeRenovar es true', () => {
    render(
      <ListaEntradasCarrito
        entradas={items}
        onEliminar={vi.fn()}
        onRenovar={vi.fn()}
        puedeRenovar={true}
      />
    );
    const renewButtons = screen.getAllByTitle('Renovar reserva temporal');
    expect(renewButtons.length).toBe(2);
  });

  it('no muestra botón de renovar cuando puedeRenovar es false', () => {
    render(
      <ListaEntradasCarrito
        entradas={items}
        onEliminar={vi.fn()}
        onRenovar={vi.fn()}
        puedeRenovar={false}
      />
    );
    expect(screen.queryByTitle('Renovar reserva temporal')).not.toBeInTheDocument();
  });

  it('oculta botón de eliminar cuando esCarritoPagado es true', () => {
    render(
      <ListaEntradasCarrito entradas={items} onEliminar={vi.fn()} esCarritoPagado={true} />
    );
    expect(screen.queryByTitle('Eliminar de carrito')).not.toBeInTheDocument();
  });

  it('carga info del evento cuando falta nombre', async () => {
    const itemsSinNombre = [
      { idDetalle: 3, eventoId: 30, cantidad: 1, precioUnitario: 10000 },
    ];
    buscarEvento.mockResolvedValue({
      nombre: 'Evento Dinámico',
      imagenUrl: '/img/dynamic.jpg',
      genero: 'POP',
      fecha: '2026-06-20T20:00:00',
      recinto: { nombre: 'Teatro', ubicacion: 'Valparaíso' },
    });
    render(<ListaEntradasCarrito entradas={itemsSinNombre} onEliminar={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Evento Dinámico')).toBeInTheDocument();
    });
  });
});
