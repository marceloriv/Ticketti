import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCarrito } from '../../src/hooks/useCarrito';

const mocks = vi.hoisted(() => ({
  crearCarrito: vi.fn(),
  obtenerCarrito: vi.fn(),
  obtenerResumen: vi.fn(),
  agregarEntrada: vi.fn(),
  eliminarEntrada: vi.fn(),
  actualizarCarrito: vi.fn(),
  iniciarCheckout: vi.fn(),
  renovarReserva: vi.fn(),
  listarCarritos: vi.fn(),
}));

vi.mock('../../src/api/carritoApi', () => ({
  default: {
    crearCarrito: mocks.crearCarrito,
    obtenerCarrito: mocks.obtenerCarrito,
    obtenerResumen: mocks.obtenerResumen,
    agregarEntrada: mocks.agregarEntrada,
    eliminarEntrada: mocks.eliminarEntrada,
    actualizarCarrito: mocks.actualizarCarrito,
    iniciarCheckout: mocks.iniciarCheckout,
    renovarReserva: mocks.renovarReserva,
    listarCarritos: mocks.listarCarritos,
  },
}));

vi.mock('../../src/utils/logger', () => ({
  default: { warn: vi.fn(), error: vi.fn(), log: vi.fn(), info: vi.fn() },
}));

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
    mocks.crearCarrito.mockResolvedValue(mockCarrito);

    const { result } = renderHook(() => useCarrito());

    await act(async () => {
      const carrito = await result.current.crearCarrito();
      expect(carrito).toEqual(mockCarrito);
    });

    expect(mocks.crearCarrito).toHaveBeenCalledTimes(1);
    expect(result.current.loading).toBe(false);
  });

  it('maneja error al crear carrito', async () => {
    mocks.crearCarrito.mockRejectedValue(new Error('Error de red'));

    const { result } = renderHook(() => useCarrito());

    await act(async () => {
      await expect(result.current.crearCarrito()).rejects.toThrow('Error de red');
    });

    expect(result.current.error).toBe('Error de red');
    expect(result.current.loading).toBe(false);
  });

  it('obtiene el resumen del carrito', async () => {
    const mockResumen = { items: [], total: 0 };
    mocks.obtenerResumen.mockResolvedValue(mockResumen);

    const { result } = renderHook(() => useCarrito(1));

    await act(async () => {
      await result.current.obtenerResumen();
    });

    expect(mocks.obtenerResumen).toHaveBeenCalledWith(1);
    expect(result.current.resumen).toEqual(mockResumen);
  });

  it('no obtiene resumen sin ID de carrito', async () => {
    const { result } = renderHook(() => useCarrito());

    await act(async () => {
      await result.current.obtenerResumen();
    });

    expect(mocks.obtenerResumen).not.toHaveBeenCalled();
  });

  it('usa alternateCarritoId para obtenerResumen', async () => {
    mocks.obtenerResumen.mockResolvedValue({ items: [] });

    const { result } = renderHook(() => useCarrito(1));

    await act(async () => {
      await result.current.obtenerResumen(99);
    });

    expect(mocks.obtenerResumen).toHaveBeenCalledWith(99);
  });

  it('agrega una entrada al carrito', async () => {
    const mockEntrada = { idDetalle: 1, eventoId: 1 };
    mocks.agregarEntrada.mockResolvedValue(mockEntrada);
    mocks.obtenerResumen.mockResolvedValue({ items: [mockEntrada], total: 10000 });

    const { result } = renderHook(() => useCarrito(1));

    await act(async () => {
      await result.current.agregarEntrada({ eventoId: 1, cantidad: 1 });
    });

    expect(mocks.agregarEntrada).toHaveBeenCalledWith(1, { eventoId: 1, cantidad: 1 });
    expect(mocks.obtenerResumen).toHaveBeenCalledWith(1);
  });

  it('lanza error al agregar entrada sin carrito activo', async () => {
    const { result } = renderHook(() => useCarrito());

    await act(async () => {
      await expect(
        result.current.agregarEntrada({ eventoId: 1, cantidad: 1 })
      ).rejects.toThrow('No hay un ID de carrito activo para agregar entradas.');
    });
  });

  it('usa alternateCarritoId para agregarEntrada', async () => {
    mocks.agregarEntrada.mockResolvedValue({});
    mocks.obtenerResumen.mockResolvedValue({});

    const { result } = renderHook(() => useCarrito(1));

    await act(async () => {
      await result.current.agregarEntrada({ eventoId: 1 }, 99);
    });

    expect(mocks.agregarEntrada).toHaveBeenCalledWith(99, { eventoId: 1 });
    expect(mocks.obtenerResumen).toHaveBeenCalledWith(99);
  });

  it('elimina una entrada del carrito', async () => {
    mocks.eliminarEntrada.mockResolvedValue({});
    mocks.obtenerResumen.mockResolvedValue({ items: [], total: 0 });

    const { result } = renderHook(() => useCarrito(1));

    await act(async () => {
      await result.current.eliminarEntrada(1);
    });

    expect(mocks.eliminarEntrada).toHaveBeenCalledWith(1, 1);
  });

  it('no elimina entrada sin carrito activo', async () => {
    const { result } = renderHook(() => useCarrito());

    await act(async () => {
      await result.current.eliminarEntrada(1);
    });

    expect(mocks.eliminarEntrada).not.toHaveBeenCalled();
  });

  it('usa alternateCarritoId para eliminarEntrada', async () => {
    mocks.eliminarEntrada.mockResolvedValue({});
    mocks.obtenerResumen.mockResolvedValue({});

    const { result } = renderHook(() => useCarrito(1));

    await act(async () => {
      await result.current.eliminarEntrada(5, 99);
    });

    expect(mocks.eliminarEntrada).toHaveBeenCalledWith(99, 5);
  });

  it('actualiza el carrito', async () => {
    mocks.actualizarCarrito.mockResolvedValue({ idCarrito: 1 });
    mocks.obtenerResumen.mockResolvedValue({ items: [], total: 0 });

    const { result } = renderHook(() => useCarrito(1));

    await act(async () => {
      await result.current.actualizarCarrito({ nota: 'test' });
    });

    expect(mocks.actualizarCarrito).toHaveBeenCalledWith(1, { nota: 'test' });
  });

  it('no actualiza sin carrito activo', async () => {
    const { result } = renderHook(() => useCarrito());

    await act(async () => {
      await result.current.actualizarCarrito({ nota: 'test' });
    });

    expect(mocks.actualizarCarrito).not.toHaveBeenCalled();
  });

  it('usa alternateCarritoId para actualizarCarrito', async () => {
    mocks.actualizarCarrito.mockResolvedValue({});
    mocks.obtenerResumen.mockResolvedValue({});

    const { result } = renderHook(() => useCarrito(1));

    await act(async () => {
      await result.current.actualizarCarrito({ nota: 'x' }, 99);
    });

    expect(mocks.actualizarCarrito).toHaveBeenCalledWith(99, { nota: 'x' });
  });

  it('inicia checkout', async () => {
    const mockCheckout = { url: 'https://pago.test.com' };
    mocks.iniciarCheckout.mockResolvedValue(mockCheckout);

    const { result } = renderHook(() => useCarrito(1));

    await act(async () => {
      const checkout = await result.current.iniciarCheckout(5);
      expect(checkout).toEqual(mockCheckout);
    });

    expect(mocks.iniciarCheckout).toHaveBeenCalledWith(1, {
      causaSocialId: 5,
      idempotencyKey: expect.any(String),
    });
  });

  it('no inicia checkout sin carrito activo', async () => {
    const { result } = renderHook(() => useCarrito());

    await act(async () => {
      await result.current.iniciarCheckout(5);
    });

    expect(mocks.iniciarCheckout).not.toHaveBeenCalled();
  });

  it('renueva la reserva', async () => {
    mocks.renovarReserva.mockResolvedValue({});
    mocks.obtenerResumen.mockResolvedValue({ items: [], total: 0 });

    const { result } = renderHook(() => useCarrito(1));

    await act(async () => {
      await result.current.renovarReserva();
    });

    expect(mocks.renovarReserva).toHaveBeenCalledWith(1);
  });

  it('no renueva sin carrito activo', async () => {
    const { result } = renderHook(() => useCarrito());

    await act(async () => {
      await result.current.renovarReserva();
    });

    expect(mocks.renovarReserva).not.toHaveBeenCalled();
  });

  it('lista carritos', async () => {
    const mockCarritos = [{ id: 1, estado: 'CREADO' }];
    mocks.listarCarritos.mockResolvedValue(mockCarritos);

    const { result } = renderHook(() => useCarrito());

    await act(async () => {
      const carritos = await result.current.listarCarritos();
      expect(carritos).toEqual(mockCarritos);
    });

    expect(mocks.listarCarritos).toHaveBeenCalledTimes(1);
  });

  it('limpia el error', async () => {
    mocks.crearCarrito.mockRejectedValue(new Error('Error'));

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

  describe('inicializarCarrito', () => {
    it('usa carrito activo existente cuando hay uno en estado CREADO', async () => {
      mocks.listarCarritos.mockResolvedValue([
        { idCarrito: 10, estadoCarrito: 'CREADO' },
        { idCarrito: 5, estadoCarrito: 'PAGADO' },
      ]);

      const { result } = renderHook(() => useCarrito());

      let res;
      await act(async () => {
        res = await result.current.inicializarCarrito();
      });

      expect(res).toEqual({ carritoId: 10, carrito: { idCarrito: 10, estadoCarrito: 'CREADO' } });
    });

    it('crea nuevo carrito cuando no hay ninguno activo', async () => {
      mocks.listarCarritos.mockResolvedValue([]);
      mocks.crearCarrito.mockResolvedValue({ idCarrito: 20 });

      const { result } = renderHook(() => useCarrito());

      let res;
      await act(async () => {
        res = await result.current.inicializarCarrito();
      });

      expect(mocks.crearCarrito).toHaveBeenCalledTimes(1);
      expect(res).toEqual({ carritoId: 20, carrito: { idCarrito: 20 } });
    });

    it('migra carrito de invitado al inicializar', async () => {
      mocks.listarCarritos.mockResolvedValue([]);
      mocks.crearCarrito.mockResolvedValue({ idCarrito: 30 });
      mocks.agregarEntrada.mockResolvedValue({});

      const guestCart = [
        { eventoId: 1, tipoEntrada: 'General', cantidad: 2, precioUnitario: 5000 },
      ];
      localStorage.setItem('guestCart', JSON.stringify(guestCart));

      const { result } = renderHook(() => useCarrito());

      await act(async () => {
        await result.current.inicializarCarrito();
      });

      expect(mocks.agregarEntrada).toHaveBeenCalledWith(30, {
        eventoId: 1,
        tipoEntrada: 'General',
        cantidad: 2,
        precioUnitario: 5000,
      });
      expect(localStorage.getItem('guestCart')).toBeNull();
    });

    it('retorna null cuando no puede crear carrito', async () => {
      mocks.listarCarritos.mockRejectedValue(new Error('Network'));
      mocks.crearCarrito.mockRejectedValue(new Error('Network'));

      const { result } = renderHook(() => useCarrito());

      let res;
      await act(async () => {
        res = await result.current.inicializarCarrito();
      });

      expect(res).toEqual({ carritoId: null, carrito: null });
    });

    it('usa campo "estado" como fallback para encontrar CREADO', async () => {
      mocks.listarCarritos.mockResolvedValue([
        { idCarrito: 15, estado: 'CREADO' },
      ]);

      const { result } = renderHook(() => useCarrito());

      let res;
      await act(async () => {
        res = await result.current.inicializarCarrito();
      });

      expect(res.carritoId).toBe(15);
    });

    it('usa campo "id" como fallback para idCarrito', async () => {
      mocks.listarCarritos.mockResolvedValue([
        { id: 25, estadoCarrito: 'CREADO' },
      ]);

      const { result } = renderHook(() => useCarrito());

      let res;
      await act(async () => {
        res = await result.current.inicializarCarrito();
      });

      expect(res.carritoId).toBe(25);
    });
  });

  describe('obtenerCarrito', () => {
    it('obtiene un carrito por ID', async () => {
      const mockCarrito = { idCarrito: 1 };
      mocks.obtenerCarrito.mockResolvedValue(mockCarrito);

      const { result } = renderHook(() => useCarrito());

      await act(async () => {
        const carrito = await result.current.obtenerCarrito(1);
        expect(carrito).toEqual(mockCarrito);
      });

      expect(result.current.carritoCreado).toEqual(mockCarrito);
    });

    it('retorna null sin ID', async () => {
      const { result } = renderHook(() => useCarrito());

      await act(async () => {
        const carrito = await result.current.obtenerCarrito(null);
        expect(carrito).toBeNull();
      });
    });
  });

  describe('sincronización del ID', () => {
    it('sincroniza el carritoId cuando cambia el parámetro', async () => {
      const { result, rerender } = renderHook(({ id }) => useCarrito(id), {
        initialProps: { id: 1 },
      });

      expect(result.current.loading).toBe(false);

      rerender({ id: 2 });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('limpia resumen cuando carritoId es null', async () => {
      const { result, rerender } = renderHook(({ id }) => useCarrito(id), {
        initialProps: { id: 1 },
      });

      rerender({ id: null });

      await waitFor(() => {
        expect(result.current.resumen).toBeNull();
      });
    });
  });

  describe('manejo de errores', () => {
    it('maneja error en obtenerResumen', async () => {
      mocks.obtenerResumen.mockRejectedValue({ response: { data: { mensaje: 'Error API' } } });

      const { result } = renderHook(() => useCarrito(1));

      await act(async () => {
        await expect(result.current.obtenerResumen()).rejects.toThrow();
      });

      expect(result.current.error).toBe('Error API');
    });

    it('maneja error en eliminarEntrada', async () => {
      mocks.eliminarEntrada.mockRejectedValue({ response: { data: { message: 'No existe' } } });

      const { result } = renderHook(() => useCarrito(1));

      await act(async () => {
        await expect(result.current.eliminarEntrada(1)).rejects.toThrow();
      });

      expect(result.current.error).toBe('No existe');
    });

    it('maneja error en actualizarCarrito', async () => {
      mocks.actualizarCarrito.mockRejectedValue(new Error('Timeout'));

      const { result } = renderHook(() => useCarrito(1));

      await act(async () => {
        await expect(result.current.actualizarCarrito({})).rejects.toThrow('Timeout');
      });

      expect(result.current.error).toBe('Timeout');
    });

    it('maneja error en iniciarCheckout', async () => {
      mocks.iniciarCheckout.mockRejectedValue(new Error('Pago fallido'));

      const { result } = renderHook(() => useCarrito(1));

      await act(async () => {
        await expect(result.current.iniciarCheckout(5)).rejects.toThrow('Pago fallido');
      });

      expect(result.current.error).toBe('Pago fallido');
    });

    it('maneja error en renovarReserva', async () => {
      mocks.renovarReserva.mockRejectedValue(new Error('Reserva expirada'));

      const { result } = renderHook(() => useCarrito(1));

      await act(async () => {
        await expect(result.current.renovarReserva()).rejects.toThrow('Reserva expirada');
      });

      expect(result.current.error).toBe('Reserva expirada');
    });

    it('maneja error en listarCarritos', async () => {
      mocks.listarCarritos.mockRejectedValue(new Error('Network'));

      const { result } = renderHook(() => useCarrito());

      await act(async () => {
        await expect(result.current.listarCarritos()).rejects.toThrow('Network');
      });

      expect(result.current.error).toBe('Network');
    });
  });
});
