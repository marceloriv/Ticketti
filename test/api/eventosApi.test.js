import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  listarEventos: vi.fn(),
  buscarEvento: vi.fn(),
  listarMisEventos: vi.fn(),
}));

vi.mock('../../src/api/eventosApi', () => ({
  eventosApi: {
    listarEventos: mocks.listarEventos,
    buscarEvento: mocks.buscarEvento,
    listarMisEventos: mocks.listarMisEventos,
  },
}));

import { eventosApi } from '../../src/api/eventosApi';

describe('eventosApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listarEventos', () => {
    it('retorna la lista de eventos', async () => {
      const mockEventos = [
        { id: 1, titulo: 'Concierto' },
        { id: 2, titulo: 'Festival' },
      ];
      mocks.listarEventos.mockResolvedValue(mockEventos);
      const result = await eventosApi.listarEventos();
      expect(mocks.listarEventos).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockEventos);
    });

    it('retorna array vacío cuando no hay eventos', async () => {
      mocks.listarEventos.mockResolvedValue([]);
      const result = await eventosApi.listarEventos();
      expect(result).toEqual([]);
    });
  });

  describe('buscarEvento', () => {
    it('busca un evento por ID', async () => {
      const mockEvento = { id: 1, titulo: 'Concierto', fecha: '2025-01-01' };
      mocks.buscarEvento.mockResolvedValue(mockEvento);
      const result = await eventosApi.buscarEvento(1);
      expect(mocks.buscarEvento).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockEvento);
    });
  });

  describe('listarMisEventos', () => {
    it('lista los eventos del organizador', async () => {
      const mockEventos = [{ id: 1, titulo: 'Mi Evento' }];
      mocks.listarMisEventos.mockResolvedValue(mockEventos);
      const result = await eventosApi.listarMisEventos();
      expect(mocks.listarMisEventos).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockEventos);
    });

    it('retorna array vacío cuando no hay eventos', async () => {
      mocks.listarMisEventos.mockResolvedValue([]);
      const result = await eventosApi.listarMisEventos();
      expect(result).toEqual([]);
    });
  });
});
