import { describe, it, expect, vi, beforeEach } from 'vitest';

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
  procesarPagoManual: vi.fn(),
}));

vi.mock('../../src/api/carritoApi', () => ({
  carritoApi: {
    crearCarrito: mocks.crearCarrito,
    obtenerCarrito: mocks.obtenerCarrito,
    obtenerResumen: mocks.obtenerResumen,
    agregarEntrada: mocks.agregarEntrada,
    eliminarEntrada: mocks.eliminarEntrada,
    actualizarCarrito: mocks.actualizarCarrito,
    iniciarCheckout: mocks.iniciarCheckout,
    renovarReserva: mocks.renovarReserva,
    listarCarritos: mocks.listarCarritos,
    procesarPagoManual: mocks.procesarPagoManual,
  },
}));

import { carritoApi } from '../../src/api/carritoApi';

describe('carritoApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('crearCarrito', () => {
    it('crea un carrito y retorna data', async () => {
      mocks.crearCarrito.mockResolvedValue({ idCarrito: 1 });
      const result = await carritoApi.crearCarrito();
      expect(mocks.crearCarrito).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ idCarrito: 1 });
    });
  });

  describe('obtenerCarrito', () => {
    it('obtiene un carrito por ID', async () => {
      const mockCarrito = { idCarrito: 1, estado: 'CREADO' };
      mocks.obtenerCarrito.mockResolvedValue(mockCarrito);
      const result = await carritoApi.obtenerCarrito(1);
      expect(mocks.obtenerCarrito).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCarrito);
    });
  });

  describe('obtenerResumen', () => {
    it('obtiene el resumen del carrito', async () => {
      const mockResumen = { items: [], total: 0 };
      mocks.obtenerResumen.mockResolvedValue(mockResumen);
      const result = await carritoApi.obtenerResumen(1);
      expect(mocks.obtenerResumen).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResumen);
    });
  });

  describe('agregarEntrada', () => {
    it('agrega una entrada al carrito', async () => {
      const entradaData = { eventoId: 1, tipoEntrada: 'General', cantidad: 2 };
      mocks.agregarEntrada.mockResolvedValue({ idDetalle: 1 });
      const result = await carritoApi.agregarEntrada(1, entradaData);
      expect(mocks.agregarEntrada).toHaveBeenCalledWith(1, entradaData);
      expect(result).toEqual({ idDetalle: 1 });
    });
  });

  describe('eliminarEntrada', () => {
    it('elimina una entrada del carrito', async () => {
      mocks.eliminarEntrada.mockResolvedValue({});
      const result = await carritoApi.eliminarEntrada(1, 5);
      expect(mocks.eliminarEntrada).toHaveBeenCalledWith(1, 5);
      expect(result).toEqual({});
    });
  });

  describe('actualizarCarrito', () => {
    it('actualiza el carrito', async () => {
      const datos = { nota: 'test' };
      mocks.actualizarCarrito.mockResolvedValue({ idCarrito: 1 });
      const result = await carritoApi.actualizarCarrito(1, datos);
      expect(mocks.actualizarCarrito).toHaveBeenCalledWith(1, datos);
      expect(result).toEqual({ idCarrito: 1 });
    });
  });

  describe('iniciarCheckout', () => {
    it('inicia el checkout con causa social', async () => {
      const payload = { causaSocialId: 5, idempotencyKey: 'key-123' };
      mocks.iniciarCheckout.mockResolvedValue({ url: 'https://pago.test.com' });
      const result = await carritoApi.iniciarCheckout(1, payload);
      expect(mocks.iniciarCheckout).toHaveBeenCalledWith(1, payload);
      expect(result).toEqual({ url: 'https://pago.test.com' });
    });
  });

  describe('renovarReserva', () => {
    it('renueva la reserva del carrito', async () => {
      mocks.renovarReserva.mockResolvedValue({ idCarrito: 1 });
      const result = await carritoApi.renovarReserva(1);
      expect(mocks.renovarReserva).toHaveBeenCalledWith(1);
      expect(result).toEqual({ idCarrito: 1 });
    });
  });

  describe('listarCarritos', () => {
    it('lista todos los carritos del usuario', async () => {
      const mockCarritos = [{ id: 1 }, { id: 2 }];
      mocks.listarCarritos.mockResolvedValue(mockCarritos);
      const result = await carritoApi.listarCarritos();
      expect(mocks.listarCarritos).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCarritos);
    });

    it('retorna array vacío cuando no hay carritos', async () => {
      mocks.listarCarritos.mockResolvedValue([]);
      const result = await carritoApi.listarCarritos();
      expect(result).toEqual([]);
    });
  });

  describe('procesarPagoManual', () => {
    it('procesa el pago manual', async () => {
      mocks.procesarPagoManual.mockResolvedValue({ idCarrito: 1, estado: 'PAGADO' });
      const result = await carritoApi.procesarPagoManual(1);
      expect(mocks.procesarPagoManual).toHaveBeenCalledWith(1);
      expect(result).toEqual({ idCarrito: 1, estado: 'PAGADO' });
    });
  });
});
