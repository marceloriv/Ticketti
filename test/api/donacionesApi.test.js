import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  loggerWarn: vi.fn(),
}));

vi.mock('../../src/api/clienteApi', () => ({
  default: {
    get: mocks.get,
    post: mocks.post,
    put: mocks.put,
    delete: mocks.delete,
  },
}));

vi.mock('../../src/utils/logger', () => ({
  default: { warn: mocks.loggerWarn, error: vi.fn(), log: vi.fn(), info: vi.fn() },
}));

import * as donacionesApi from '../../src/api/donacionesApi';

describe('donacionesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOrganizaciones', () => {
    it('retorna la lista de todas las organizaciones', async () => {
      const mockData = [{ id: 1, nombre: 'Org1' }];
      mocks.get.mockResolvedValue({ data: mockData });
      const result = await donacionesApi.getOrganizaciones();
      expect(mocks.get).toHaveBeenCalledWith('/organizaciones/todas');
      expect(result).toEqual(mockData);
    });
  });

  describe('getOrganizacionesActivas', () => {
    it('retorna solo organizaciones activas', async () => {
      const mockData = [{ id: 1, nombre: 'Org1', estado: 'ACTIVA' }];
      mocks.get.mockResolvedValue({ data: mockData });
      const result = await donacionesApi.getOrganizacionesActivas();
      expect(mocks.get).toHaveBeenCalledWith('/organizaciones', {});
      expect(result).toEqual(mockData);
    });
  });

  describe('getOrganizacionPorId', () => {
    it('retorna una organización por ID', async () => {
      const mockData = { id: 5, nombre: 'Org5' };
      mocks.get.mockResolvedValue({ data: mockData });
      const result = await donacionesApi.getOrganizacionPorId(5);
      expect(mocks.get).toHaveBeenCalledWith('/organizaciones/5');
      expect(result).toEqual(mockData);
    });
  });

  describe('crearOrganizacion', () => {
    it('crea una organización con payload', async () => {
      const payload = { nombre: 'NuevaOrg', rut: '12345678-9' };
      const mockData = { idOrganizacion: 10, ...payload };
      mocks.post.mockResolvedValue({ data: mockData });
      const result = await donacionesApi.crearOrganizacion(payload);
      expect(mocks.post).toHaveBeenCalledWith('/organizaciones', payload);
      expect(result).toEqual(mockData);
    });
  });

  describe('editarOrganizacion', () => {
    it('edita una organización existente', async () => {
      const payload = { nombre: 'OrgEditada' };
      const mockData = { idOrganizacion: 5, ...payload };
      mocks.put.mockResolvedValue({ data: mockData });
      const result = await donacionesApi.editarOrganizacion(5, payload);
      expect(mocks.put).toHaveBeenCalledWith('/organizaciones/5', payload);
      expect(result).toEqual(mockData);
    });
  });

  describe('activarOrganizacion', () => {
    it('activa una organización con datos bancarios', async () => {
      const datosBancarios = { banco: 'Banco1', numeroCuenta: '123' };
      const mockData = { idOrganizacion: 5, estado: 'ACTIVA' };
      mocks.put.mockResolvedValue({ data: mockData });
      const result = await donacionesApi.activarOrganizacion(5, datosBancarios);
      expect(mocks.put).toHaveBeenCalledWith('/organizaciones/5/activar', datosBancarios);
      expect(result).toEqual(mockData);
    });
  });

  describe('eliminarOrganizacion', () => {
    it('elimina una organización', async () => {
      mocks.delete.mockResolvedValue({});
      await donacionesApi.eliminarOrganizacion(5);
      expect(mocks.delete).toHaveBeenCalledWith('/organizaciones/5');
    });
  });

  describe('subirDocumentoOrganizacion', () => {
    it('sube un documento FormData con header multipart', async () => {
      const archivo = new File([' contenido'], 'convenio.pdf', { type: 'application/pdf' });
      const mockData = { idOrganizacion: 5, documentoConvenio: 'url.pdf' };
      mocks.post.mockResolvedValue({ data: mockData });
      const result = await donacionesApi.subirDocumentoOrganizacion(5, archivo);
      expect(mocks.post).toHaveBeenCalledTimes(1);
      const [url, formData, config] = mocks.post.mock.calls[0];
      expect(url).toBe('/organizaciones/5/documento');
      expect(formData).toBeInstanceOf(FormData);
      expect(config.headers['Content-Type']).toBe('multipart/form-data');
      expect(result).toEqual(mockData);
    });
  });

  describe('getCausasActivas', () => {
    it('retorna causas activas', async () => {
      const mockData = [{ id: 1, nombre: 'Causa1' }];
      mocks.get.mockResolvedValue({ data: mockData });
      const result = await donacionesApi.getCausasActivas();
      expect(mocks.get).toHaveBeenCalledWith('/causas/activas', {});
      expect(result).toEqual(mockData);
    });
  });

  describe('getCausasPorOrganizacion', () => {
    it('retorna causas de una organización', async () => {
      const mockData = [{ id: 1, nombre: 'Causa1' }];
      mocks.get.mockResolvedValue({ data: mockData });
      const result = await donacionesApi.getCausasPorOrganizacion(3);
      expect(mocks.get).toHaveBeenCalledWith('/causas/organizacion/3');
      expect(result).toEqual(mockData);
    });
  });

  describe('crearCausa', () => {
    it('crea una causa social', async () => {
      const payload = { nombre: 'CausaNueva', idOrganizacion: 1 };
      const mockData = { id: 10, ...payload };
      mocks.post.mockResolvedValue({ data: mockData });
      const result = await donacionesApi.crearCausa(payload);
      expect(mocks.post).toHaveBeenCalledWith('/causas', payload);
      expect(result).toEqual(mockData);
    });
  });

  describe('eliminarCausa', () => {
    it('elimina una causa', async () => {
      mocks.delete.mockResolvedValue({});
      await donacionesApi.eliminarCausa(7);
      expect(mocks.delete).toHaveBeenCalledWith('/causas/7');
    });
  });

  describe('getTotalPorOrganizacion', () => {
    it('retorna 0 (stub pendiente backend)', async () => {
      mocks.get.mockResolvedValue({ data: 0 });
      const result = await donacionesApi.getTotalPorOrganizacion(1);
      expect(result).toBe(0);
    });
  });

  describe('getMisDonaciones', () => {
    it('retorna array vacío (stub pendiente backend)', async () => {
      const result = await donacionesApi.getMisDonaciones();
      expect(result).toEqual([]);
    });
  });

  describe('getCausas', () => {
    it('delega a getCausasActivas', async () => {
      const mockData = [{ id: 1 }];
      mocks.get.mockResolvedValue({ data: mockData });
      const result = await donacionesApi.getCausas();
      expect(mocks.get).toHaveBeenCalledWith('/causas/activas', {});
      expect(result).toEqual(mockData);
    });
  });

  describe('activarCausa', () => {
    it('retorna null y llama logger.warn (stub pendiente)', async () => {
      const result = await donacionesApi.activarCausa(5);
      expect(result).toBeNull();
      expect(mocks.loggerWarn).toHaveBeenCalled();
    });
  });

  describe('crearOrganizacionActiva', () => {
    it('crea organización y la activa encadenando llamadas', async () => {
      const datosBasicos = { nombre: 'Org1', rut: '111' };
      const datosBancarios = { banco: 'Banco1' };
      mocks.post.mockResolvedValue({ data: { idOrganizacion: 10 } });
      mocks.put.mockResolvedValue({ data: { idOrganizacion: 10, estado: 'ACTIVA' } });
      const result = await donacionesApi.crearOrganizacionActiva(datosBasicos, datosBancarios);
      expect(mocks.post).toHaveBeenCalledWith('/organizaciones', datosBasicos);
      expect(mocks.put).toHaveBeenCalledWith('/organizaciones/10/activar', datosBancarios);
      expect(result).toEqual({ idOrganizacion: 10, estado: 'ACTIVA' });
    });

    it('lanza error si crearOrganizacion falla', async () => {
      mocks.post.mockRejectedValue(new Error('Network error'));
      await expect(
        donacionesApi.crearOrganizacionActiva({}, {})
      ).rejects.toThrow('Network error');
    });
  });

  describe('crearCausaActiva', () => {
    it('crea causa con estado ACTIVA', async () => {
      const payload = { nombre: 'Causa1', idOrganizacion: 1 };
      const mockData = { id: 20, ...payload, estado: 'ACTIVA' };
      mocks.post.mockResolvedValue({ data: mockData });
      const result = await donacionesApi.crearCausaActiva(payload);
      expect(mocks.post).toHaveBeenCalledWith('/causas', { ...payload, estado: 'ACTIVA' });
      expect(result).toEqual(mockData);
    });
  });

  describe('solicitarRegistroOrganizacion', () => {
    it('encadena crear org + crear causa + subir documento', async () => {
      const datosOrg = { nombre: 'Org1' };
      const datosCausa = { nombre: 'Causa1' };
      const documento = new File(['test'], 'doc.pdf', { type: 'application/pdf' });

      mocks.post
        .mockResolvedValueOnce({ data: { idOrganizacion: 10 } })
        .mockResolvedValueOnce({ data: { id: 20, nombre: 'Causa1' } })
        .mockResolvedValueOnce({ data: { idOrganizacion: 10, documentoConvenio: 'url' } });

      const result = await donacionesApi.solicitarRegistroOrganizacion(datosOrg, datosCausa, documento);

      expect(mocks.post).toHaveBeenCalledTimes(3);
      expect(mocks.post.mock.calls[0][0]).toBe('/organizaciones');
      expect(mocks.post.mock.calls[1][0]).toBe('/causas');
      expect(mocks.post.mock.calls[1][1]).toEqual({ ...datosCausa, idOrganizacion: 10 });
      expect(mocks.post.mock.calls[2][0]).toBe('/organizaciones/10/documento');
      expect(result).toEqual({
        organizacion: { idOrganizacion: 10 },
        causa: { id: 20, nombre: 'Causa1' },
      });
    });

    it('lanza error si crearOrganizacion falla en paso 1', async () => {
      mocks.post.mockRejectedValue(new Error('Error org'));
      await expect(
        donacionesApi.solicitarRegistroOrganizacion({}, {}, {})
      ).rejects.toThrow('Error org');
    });
  });

  describe('default export', () => {
    it('exporta todas las funciones', () => {
      expect(donacionesApi.default).toBeDefined();
      expect(typeof donacionesApi.default.getOrganizaciones).toBe('function');
      expect(typeof donacionesApi.default.crearOrganizacion).toBe('function');
      expect(typeof donacionesApi.default.solicitarRegistroOrganizacion).toBe('function');
    });
  });
});
