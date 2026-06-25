import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCarritoGuest } from '../../src/hooks/useCarritoGuest';

describe('useCarritoGuest', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('inicia con carrito vacío', () => {
    const { result } = renderHook(() => useCarritoGuest());

    expect(result.current.cart).toEqual([]);
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.totalEntradas).toBe(0);
    expect(result.current.subtotal).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it('carga carrito desde localStorage al iniciar', () => {
    const savedCart = [
      { eventoId: 1, tipoEntrada: 'General', cantidad: 2, precioUnitario: 10000 },
    ];
    localStorage.setItem('guestCart', JSON.stringify(savedCart));

    const { result } = renderHook(() => useCarritoGuest());

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.isEmpty).toBe(false);
    expect(result.current.totalEntradas).toBe(2);
    expect(result.current.subtotal).toBe(20000);
  });

  it('agrega una entrada al carrito', () => {
    const { result } = renderHook(() => useCarritoGuest());

    act(() => {
      result.current.agregarEntrada({
        eventoId: 1,
        tipoEntrada: 'General',
        cantidad: 2,
        precioUnitario: 15000,
      });
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.totalEntradas).toBe(2);
    expect(result.current.subtotal).toBe(30000);
    expect(result.current.donacion).toBe(3000);
    expect(result.current.total).toBe(33000);
  });

  it('actualiza cantidad cuando se agrega entrada existente', () => {
    const { result } = renderHook(() => useCarritoGuest());

    act(() => {
      result.current.agregarEntrada({
        eventoId: 1,
        tipoEntrada: 'General',
        cantidad: 1,
        precioUnitario: 10000,
      });
    });

    act(() => {
      result.current.agregarEntrada({
        eventoId: 1,
        tipoEntrada: 'General',
        cantidad: 2,
        precioUnitario: 10000,
      });
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].cantidad).toBe(3);
  });

  it('lanza error al agregar más de 4 entradas', () => {
    const { result } = renderHook(() => useCarritoGuest());

    act(() => {
      result.current.agregarEntrada({
        eventoId: 1,
        tipoEntrada: 'General',
        cantidad: 3,
        precioUnitario: 10000,
      });
    });

    expect(() => {
      act(() => {
        result.current.agregarEntrada({
          eventoId: 1,
          tipoEntrada: 'General',
          cantidad: 2,
          precioUnitario: 10000,
        });
      });
    }).toThrow('Máximo 4 entradas por compra');
  });

  it('lanza error al agregar más de 4 entradas de golpe', () => {
    const { result } = renderHook(() => useCarritoGuest());

    expect(() => {
      act(() => {
        result.current.agregarEntrada({
          eventoId: 1,
          tipoEntrada: 'General',
          cantidad: 5,
          precioUnitario: 10000,
        });
      });
    }).toThrow('Máximo 4 entradas por compra');
  });

  it('elimina una entrada del carrito', () => {
    const { result } = renderHook(() => useCarritoGuest());

    act(() => {
      result.current.agregarEntrada({
        eventoId: 1,
        tipoEntrada: 'General',
        cantidad: 2,
        precioUnitario: 10000,
      });
    });

    act(() => {
      result.current.eliminarEntrada(1);
    });

    expect(result.current.cart).toHaveLength(0);
    expect(result.current.isEmpty).toBe(true);
  });

  it('actualiza la cantidad de una entrada', () => {
    const { result } = renderHook(() => useCarritoGuest());

    act(() => {
      result.current.agregarEntrada({
        eventoId: 1,
        tipoEntrada: 'General',
        cantidad: 1,
        precioUnitario: 10000,
      });
    });

    act(() => {
      result.current.actualizarCantidad(1, 3);
    });

    expect(result.current.cart[0].cantidad).toBe(3);
    expect(result.current.totalEntradas).toBe(3);
  });

  it('lanza error al actualizar cantidad fuera de rango', () => {
    const { result } = renderHook(() => useCarritoGuest());

    act(() => {
      result.current.agregarEntrada({
        eventoId: 1,
        tipoEntrada: 'General',
        cantidad: 1,
        precioUnitario: 10000,
      });
    });

    expect(() => {
      act(() => {
        result.current.actualizarCantidad(1, 0);
      });
    }).toThrow('Cantidad debe ser entre 1 y 4');

    expect(() => {
      act(() => {
        result.current.actualizarCantidad(1, 5);
      });
    }).toThrow('Cantidad debe ser entre 1 y 4');
  });

  it('limpia todo el carrito', () => {
    const { result } = renderHook(() => useCarritoGuest());

    act(() => {
      result.current.agregarEntrada({
        eventoId: 1,
        tipoEntrada: 'General',
        cantidad: 2,
        precioUnitario: 10000,
      });
    });

    act(() => {
      result.current.limpiarCarrito();
    });

    expect(result.current.cart).toEqual([]);
    expect(result.current.isEmpty).toBe(true);
  });

  it('persiste en localStorage después de agregar', () => {
    const { result } = renderHook(() => useCarritoGuest());

    act(() => {
      result.current.agregarEntrada({
        eventoId: 1,
        tipoEntrada: 'General',
        cantidad: 2,
        precioUnitario: 10000,
      });
    });

    const saved = JSON.parse(localStorage.getItem('guestCart'));
    expect(saved).toHaveLength(1);
    expect(saved[0].eventoId).toBe(1);
  });

  it('calcula totals correctamente con múltiples entradas', () => {
    const { result } = renderHook(() => useCarritoGuest());

    act(() => {
      result.current.agregarEntrada({
        eventoId: 1,
        tipoEntrada: 'General',
        cantidad: 2,
        precioUnitario: 10000,
      });
    });

    act(() => {
      result.current.agregarEntrada({
        eventoId: 2,
        tipoEntrada: 'VIP',
        cantidad: 1,
        precioUnitario: 25000,
      });
    });

    expect(result.current.totalEntradas).toBe(3);
    expect(result.current.subtotal).toBe(45000);
    expect(result.current.donacion).toBe(4500);
    expect(result.current.total).toBe(49500);
  });
});
