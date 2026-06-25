import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('../../src/api/clienteApi', () => ({
  default: {
    get: mocks.get,
    post: mocks.post,
    put: mocks.put,
    delete: mocks.delete,
  },
}));

import * as carritoApi from '../../src/api/carritoApi';

describe('carritoApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('crearCarrito', () => {
    it('crea un carrito y retorna data?.data', async () => {
      mocks.post.mockResolvedValue({ data: { data: { idCarrito: 1 } } });
      const result = await carritoApi.crearCarrito();
      expect(mocks.post).toHaveBeenCalledWith('/Carrito/crear');
      expect(result).toEqual({ idCarrito: 1 });
    });

    it('retorna undefined cuando data es null', async () => {
      mocks.post.mockResolvedValue({ data: null });
      const result = await carritoApi.crearCarrito();
      expect(result).toBeUndefined();
    });
  });

  describe('obtenerCarrito', () => {
    it('obtiene un carrito por ID', async () => {
      const mockData = { idCarrito: 1, estado: 'CREADO' };
      mocks.get.mockResolvedValue({ data: { data: mockData } });
      const result = await carritoApi.obtenerCarrito(1);
      expect(mocks.get).toHaveBeenCalledWith('/Carrito/obtener/1');
      expect(result).toEqual(mockData);
    });
  });

  describe('obtenerResumen', () => {
    it('obtiene el resumen del carrito', async () => {
      const mockData = { items: [], total: 0 };
      mocks.get.mockResolvedValue({ data: { data: mockData } });
      const result = await carritoApi.obtenerResumen(1);
      expect(mocks.get).toHaveBeenCalledWith('/Carrito/resumen/1');
      expect(result).toEqual(mockData);
    });
  });

  describe('agregarEntrada', () => {
    it('agrega una entrada al carrito', async () => {
      const entradaData = { eventoId: 1, tipoEntrada: 'General', cantidad: 2 };
      mocks.post.mockResolvedValue({ data: { data: { idDetalle: 1 } } });
      const result = await carritoApi.agregarEntrada(1, entradaData);
      expect(mocks.post).toHaveBeenCalledWith('/Carrito/1/entradas', entradaData);
      expect(result).toEqual({ idDetalle: 1 });
    });
  });

  describe('eliminarEntrada', () => {
    it('elimina una entrada del carrito', async () => {
      mocks.delete.mockResolvedValue({ data: { data: {} } });
      const result = await carritoApi.eliminarEntrada(1, 5);
      expect(mocks.delete).toHaveBeenCalledWith('/Carrito/1/entradas/5');
      expect(result).toEqual({});
    });
  });

  describe('actualizarCarrito', () => {
    it('actualiza el carrito', async () => {
      const datos = { nota: 'test' };
      mocks.put.mockResolvedValue({ data: { data: { idCarrito: 1 } } });
      const result = await carritoApi.actualizarCarrito(1, datos);
      expect(mocks.put).toHaveBeenCalledWith('/Carrito/actualizar/1', datos);
      expect(result).toEqual({ idCarrito: 1 });
    });
  });

  describe('iniciarCheckout', () => {
    it('inicia el checkout con causa social e idempotencyKey', async () => {
      const payload = { causaSocialId: 5, idempotencyKey: 'key-123' };
      mocks.post.mockResolvedValue({ data: { data: { url: 'https://pago.test.com' } } });
      const result = await carritoApi.iniciarCheckout(1, payload);
      expect(mocks.post).toHaveBeenCalledWith('/Carrito/checkout/1', {
        causaSocialId: 5,
        idempotencyKey: 'key-123',
      });
      expect(result).toEqual({ url: 'https://pago.test.com' });
    });
  });

  describe('renovarReserva', () => {
    it('renueva la reserva del carrito', async () => {
      mocks.post.mockResolvedValue({ data: { data: { idCarrito: 1 } } });
      const result = await carritoApi.renovarReserva(1);
      expect(mocks.post).toHaveBeenCalledWith('/Carrito/renovar/1');
      expect(result).toEqual({ idCarrito: 1 });
    });
  });

  describe('listarCarritos', () => {
    it('lista todos los carritos del usuario', async () => {
      const mockData = [{ id: 1 }, { id: 2 }];
      mocks.get.mockResolvedValue({ data: { data: mockData } });
      const result = await carritoApi.listarCarritos();
      expect(mocks.get).toHaveBeenCalledWith('/Carrito/listar');
      expect(result).toEqual(mockData);
    });

    it('retorna array vacío cuando data?.data es null', async () => {
      mocks.get.mockResolvedValue({ data: { data: null } });
      const result = await carritoApi.listarCarritos();
      expect(result).toEqual([]);
    });

    it('retorna array vacío cuando data es null', async () => {
      mocks.get.mockResolvedValue({ data: null });
      const result = await carritoApi.listarCarritos();
      expect(result).toEqual([]);
    });
  });

  describe('procesarPagoManual', () => {
    it('procesa el pago manual', async () => {
      mocks.post.mockResolvedValue({ data: { data: { idCarrito: 1, estado: 'PAGADO' } } });
      const result = await carritoApi.procesarPagoManual(1);
      expect(mocks.post).toHaveBeenCalledWith('/Carrito/pago-manual/1');
      expect(result).toEqual({ idCarrito: 1, estado: 'PAGADO' });
    });
  });

  describe('default export', () => {
    it('exporta todas las funciones', () => {
      expect(carritoApi.default).toBeDefined();
      expect(typeof carritoApi.default.crearCarrito).toBe('function');
      expect(typeof carritoApi.default.obtenerCarrito).toBe('function');
      expect(typeof carritoApi.default.obtenerResumen).toBe('function');
      expect(typeof carritoApi.default.agregarEntrada).toBe('function');
      expect(typeof carritoApi.default.eliminarEntrada).toBe('function');
      expect(typeof carritoApi.default.actualizarCarrito).toBe('function');
      expect(typeof carritoApi.default.iniciarCheckout).toBe('function');
      expect(typeof carritoApi.default.renovarReserva).toBe('function');
      expect(typeof carritoApi.default.listarCarritos).toBe('function');
      expect(typeof carritoApi.default.procesarPagoManual).toBe('function');
    });
  });
});
