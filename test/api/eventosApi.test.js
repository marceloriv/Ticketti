import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock('../../src/api/clienteApi', () => ({
  default: { get: mocks.get },
}));

import * as eventosApi from '../../src/api/eventosApi';

describe('eventosApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listarEventos', () => {
    it('retorna la lista de eventos', async () => {
      const mockData = [{ id: 1, titulo: 'Concierto' }];
      mocks.get.mockResolvedValue({ data: mockData });
      const result = await eventosApi.listarEventos();
      expect(mocks.get).toHaveBeenCalledWith('/eventos/listarEventos');
      expect(result).toEqual(mockData);
    });

    it('retorna array vacío cuando response.data es null', async () => {
      mocks.get.mockResolvedValue({ data: null });
      const result = await eventosApi.listarEventos();
      expect(result).toEqual([]);
    });

    it('retorna array vacío cuando response.data es undefined', async () => {
      mocks.get.mockResolvedValue({});
      const result = await eventosApi.listarEventos();
      expect(result).toEqual([]);
    });
  });

  describe('buscarEvento', () => {
    it('busca un evento por ID', async () => {
      const mockData = { id: 1, titulo: 'Concierto' };
      mocks.get.mockResolvedValue({ data: mockData });
      const result = await eventosApi.buscarEvento(1);
      expect(mocks.get).toHaveBeenCalledWith('/eventos/buscarEvento/1');
      expect(result).toEqual(mockData);
    });

    it('retorna undefined cuando no existe', async () => {
      mocks.get.mockResolvedValue({ data: undefined });
      const result = await eventosApi.buscarEvento(999);
      expect(result).toBeUndefined();
    });
  });

  describe('listarMisEventos', () => {
    it('lista los eventos del organizador', async () => {
      const mockData = [{ id: 1, titulo: 'Mi Evento' }];
      mocks.get.mockResolvedValue({ data: mockData });
      const result = await eventosApi.listarMisEventos();
      expect(mocks.get).toHaveBeenCalledWith('/eventos/mis');
      expect(result).toEqual(mockData);
    });

    it('retorna array vacío cuando no hay eventos', async () => {
      mocks.get.mockResolvedValue({ data: null });
      const result = await eventosApi.listarMisEventos();
      expect(result).toEqual([]);
    });
  });

  describe('default export', () => {
    it('exporta todas las funciones', () => {
      expect(eventosApi.default).toBeDefined();
      expect(typeof eventosApi.default.listarEventos).toBe('function');
      expect(typeof eventosApi.default.buscarEvento).toBe('function');
      expect(typeof eventosApi.default.listarMisEventos).toBe('function');
    });
  });
});
