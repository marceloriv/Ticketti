import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCarrito } from '../../src/hooks/useCarrito';

vi.mock('../../src/api/carritoApi', () => ({
  default: {
    crearCarrito: vi.fn(),
    obtenerCarrito: vi.fn(),
    obtenerResumen: vi.fn(),
    agregarEntrada: vi.fn(),
    eliminarEntrada: vi.fn(),
    actualizarCarrito: vi.fn(),
    iniciarCheckout: vi.fn(),
    renovarReserva: vi.fn(),
    listarCarritos: vi.fn(),
  },
}));

import carritoApi from '../../src/api/carritoApi';

describe('useCarrito', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('inicia con estado por defecto', () => {
    const { result } = renderHook(() => useCarrito());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.resumen).toBeNull();
    expect(result.current.carritoCreado).toBeNull();
  });

  it('crea un carrito exitosamente', async () => {
    const mockCarrito = { idCarrito: 1, estado: 'CREADO' };
    carritoApi.crearCarrito.mockResolvedValue(mockCarrito);

    const { result } = renderHook(() => useCarrito());

    await act(async () => {
      const carrito = await result.current.crearCarrito();
      expect(carrito).toEqual(mockCarrito);
    });

    expect(carritoApi.crearCarrito).toHaveBeenCalledTimes(1);
    expect(result.current.loading).toBe(false);
  });

  it('maneja error al crear carrito', async () => {
    carritoApi.crearCarrito.mockRejectedValue(new Error('Error de red'));

    const { result } = renderHook(() => useCarrito());

    await act(async () => {
      await expect(result.current.crearCarrito()).rejects.toThrow('Error de red');
    });

    expect(result.current.error).toBe('Error de red');
    expect(result.current.loading).toBe(false);
  });

  it('obtiene el resumen del carrito', async () => {
    const mockResumen = { items: [], total: 0 };
    carritoApi.obtenerResumen.mockResolvedValue(mockResumen);

    const { result } = renderHook(() => useCarrito(1));

    await act(async () => {
      await result.current.obtenerResumen();
    });

    expect(carritoApi.obtenerResumen).toHaveBeenCalledWith(1);
    expect(result.current.resumen).toEqual(mockResumen);
  });

  it('no obtiene resumen sin ID de carrito', async () => {
    const { result } = renderHook(() => useCarrito());

    await act(async () => {
      await result.current.obtenerResumen();
    });

    expect(carritoApi.obtenerResumen).not.toHaveBeenCalled();
  });

  it('agrega una entrada al carrito', async () => {
    const mockEntrada = { idDetalle: 1, eventoId: 1 };
    const mockResumen = { items: [mockEntrada], total: 10000 };
    carritoApi.agregarEntrada.mockResolvedValue(mockEntrada);
    carritoApi.obtenerResumen.mockResolvedValue(mockResumen);

    const { result } = renderHook(() => useCarrito(1));

    await act(async () => {
      await result.current.agregarEntrada({ eventoId: 1, cantidad: 1 });
    });

    expect(carritoApi.agregarEntrada).toHaveBeenCalledWith(1, { eventoId: 1, cantidad: 1 });
    expect(carritoApi.obtenerResumen).toHaveBeenCalledWith(1);
  });

  it('lanza error al agregar entrada sin carrito activo', async () => {
    const { result } = renderHook(() => useCarrito());

    await act(async () => {
      await expect(
        result.current.agregarEntrada({ eventoId: 1, cantidad: 1 })
      ).rejects.toThrow('No hay un ID de carrito activo para agregar entradas.');
    });
  });

  it('elimina una entrada del carrito', async () => {
    carritoApi.eliminarEntrada.mockResolvedValue({});
    carritoApi.obtenerResumen.mockResolvedValue({ items: [], total: 0 });

    const { result } = renderHook(() => useCarrito(1));

    await act(async () => {
      await result.current.eliminarEntrada(1);
    });

    expect(carritoApi.eliminarEntrada).toHaveBeenCalledWith(1, 1);
  });

  it('actualiza el carrito', async () => {
    const mockActualizado = { idCarrito: 1, estado: 'ACTUALIZADO' };
    carritoApi.actualizarCarrito.mockResolvedValue(mockActualizado);
    carritoApi.obtenerResumen.mockResolvedValue({ items: [], total: 0 });

    const { result } = renderHook(() => useCarrito(1));

    await act(async () => {
      await result.current.actualizarCarrito({ nota: 'test' });
    });

    expect(carritoApi.actualizarCarrito).toHaveBeenCalledWith(1, { nota: 'test' });
  });

  it('inicia checkout', async () => {
    const mockCheckout = { url: 'https://pago.test.com' };
    carritoApi.iniciarCheckout.mockResolvedValue(mockCheckout);

    const { result } = renderHook(() => useCarrito(1));

    await act(async () => {
      const checkout = await result.current.iniciarCheckout(5);
      expect(checkout).toEqual(mockCheckout);
    });

    expect(carritoApi.iniciarCheckout).toHaveBeenCalledWith(1, {
      causaSocialId: 5,
      idempotencyKey: expect.any(String),
    });
  });

  it('renueva la reserva', async () => {
    carritoApi.renovarReserva.mockResolvedValue({});
    carritoApi.obtenerResumen.mockResolvedValue({ items: [], total: 0 });

    const { result } = renderHook(() => useCarrito(1));

    await act(async () => {
      await result.current.renovarReserva();
    });

    expect(carritoApi.renovarReserva).toHaveBeenCalledWith(1);
  });

  it('lista carritos', async () => {
    const mockCarritos = [{ id: 1, estado: 'CREADO' }];
    carritoApi.listarCarritos.mockResolvedValue(mockCarritos);

    const { result } = renderHook(() => useCarrito());

    await act(async () => {
      const carritos = await result.current.listarCarritos();
      expect(carritos).toEqual(mockCarritos);
    });

    expect(carritoApi.listarCarritos).toHaveBeenCalledTimes(1);
  });

  it('limpia el error', async () => {
    carritoApi.crearCarrito.mockRejectedValue(new Error('Error'));

    const { result } = renderHook(() => useCarrito());

    await act(async () => {
      await result.current.crearCarrito().catch(() => {});
    });

    expect(result.current.error).toBeTruthy();

    act(() => {
      result.current.limpiarError();
    });

    expect(result.current.error).toBeNull();
  });
});
