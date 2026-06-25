import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const requestCallbacks = { success: null, error: null };
  const responseCallbacks = { success: null, error: null };
  return {
    jwtDecode: vi.fn(),
    loggerError: vi.fn(),
    loggerWarn: vi.fn(),
    requestCallbacks,
    responseCallbacks,
  };
});

vi.mock('jwt-decode', () => ({ jwtDecode: mocks.jwtDecode }));

vi.mock('../../src/utils/logger', () => ({
  default: { error: mocks.loggerError, warn: mocks.loggerWarn, log: vi.fn(), info: vi.fn() },
}));

vi.mock('axios', () => {
  const instance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: {
        use: vi.fn((success, error) => {
          mocks.requestCallbacks.success = success;
          mocks.requestCallbacks.error = error;
        }),
      },
      response: {
        use: vi.fn((success, error) => {
          mocks.responseCallbacks.success = success;
          mocks.responseCallbacks.error = error;
        }),
      },
    },
    defaults: { headers: { common: {} } },
  };
  return { default: { create: vi.fn(() => instance) } };
});

import clienteApi from '../../src/api/clienteApi';

describe('clienteApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('request interceptor', () => {
    it('inyecta token Bearer cuando hay token en localStorage', () => {
      localStorage.setItem('token', 'fake-jwt-token');
      mocks.jwtDecode.mockReturnValue({ usuarioId: 42, rol: 'CLIENTE' });

      const config = { headers: {}, url: '/eventos' };
      const result = mocks.requestCallbacks.success(config);

      expect(result.headers.Authorization).toBe('Bearer fake-jwt-token');
      expect(result.headers['X-Usuario-Id']).toBe('42');
      expect(result.headers['X-Rol-Usuario-Id']).toBe('CLIENTE');
    });

    it('no inyecta token cuando no hay token en localStorage', () => {
      const config = { headers: {}, url: '/eventos' };
      const result = mocks.requestCallbacks.success(config);

      expect(result.headers.Authorization).toBeUndefined();
      expect(result.headers['X-Usuario-Id']).toBeUndefined();
    });

    it('salta auth cuando config.skipAuth es true', () => {
      localStorage.setItem('token', 'fake-jwt-token');
      const config = { headers: {}, url: '/eventos', skipAuth: true };
      const result = mocks.requestCallbacks.success(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('no inyecta headers JWT en rutas públicas (POST /usuarios)', () => {
      localStorage.setItem('token', 'fake-jwt-token');
      const config = { headers: {}, method: 'post', url: '/usuarios' };
      const result = mocks.requestCallbacks.success(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('maneja error de jwtDecode sin lanzar excepción', () => {
      localStorage.setItem('token', 'invalid-token');
      mocks.jwtDecode.mockImplementation(() => { throw new Error('Invalid JWT'); });

      const config = { headers: {}, url: '/eventos' };
      const result = mocks.requestCallbacks.success(config);

      expect(result.headers.Authorization).toBe('Bearer invalid-token');
      expect(result.headers['X-Usuario-Id']).toBeUndefined();
    });

    it('maneja decoded con campos null/undefined', () => {
      localStorage.setItem('token', 'token123');
      mocks.jwtDecode.mockReturnValue({ usuarioId: null, rol: undefined });

      const config = { headers: {}, url: '/eventos' };
      const result = mocks.requestCallbacks.success(config);

      expect(result.headers['X-Usuario-Id']).toBeUndefined();
      expect(result.headers['X-Rol-Usuario-Id']).toBeUndefined();
    });

    it('usa metodo get por defecto cuando config.method es undefined', () => {
      localStorage.setItem('token', 'token123');
      const config = { headers: {}, url: '/usuarios' };
      const result = mocks.requestCallbacks.success(config);

      expect(result.headers.Authorization).toBe('Bearer token123');
    });
  });

  describe('response interceptor - error handling', () => {
    const crearError = (status, data = {}) => ({
      response: { status, data },
      request: {},
      message: `Error ${status}`,
    });

    it('maneja error 401 y limpia localStorage', async () => {
      localStorage.setItem('token', 'expired-token');
      localStorage.setItem('user', '{}');
      localStorage.setItem('carritoId', '1');

      const error = crearError(401);
      await expect(mocks.responseCallbacks.error(error)).rejects.toThrow();

      expect(mocks.loggerError).toHaveBeenCalled();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(localStorage.getItem('carritoId')).toBeNull();
    });

    it('maneja error 401 sin token en localStorage', async () => {
      const error = crearError(401);
      await expect(mocks.responseCallbacks.error(error)).rejects.toThrow();

      expect(mocks.loggerError).toHaveBeenCalled();
    });

    it('maneja error 403', async () => {
      const error = crearError(403);
      await expect(mocks.responseCallbacks.error(error)).rejects.toThrow();
      expect(mocks.loggerError).toHaveBeenCalled();
    });

    it('maneja error 404', async () => {
      const error = crearError(404);
      await expect(mocks.responseCallbacks.error(error)).rejects.toThrow();
      expect(mocks.loggerError).toHaveBeenCalled();
    });

    it('maneja error 500', async () => {
      const error = crearError(500);
      await expect(mocks.responseCallbacks.error(error)).rejects.toThrow();
      expect(mocks.loggerError).toHaveBeenCalled();
    });

    it('maneja error HTTP no listado', async () => {
      const error = crearError(418);
      await expect(mocks.responseCallbacks.error(error)).rejects.toThrow();
      expect(mocks.loggerError).toHaveBeenCalled();
    });

    it('maneja error sin response pero con request (network error)', async () => {
      const error = { request: {}, message: 'Network Error' };
      await expect(mocks.responseCallbacks.error(error)).rejects.toThrow();
      expect(mocks.loggerError).toHaveBeenCalledWith('No se pudo conectar con el servidor, comprueba tu red.');
    });

    it('maneja error sin response ni request (setup error)', async () => {
      const error = { message: 'Bad config' };
      await expect(mocks.responseCallbacks.error(error)).rejects.toThrow();
      expect(mocks.loggerError).toHaveBeenCalledWith('Error al configurar la petición HTTP:', error.message);
    });
  });

  describe('configuración del cliente', () => {
    it('exporta una instancia de axios', () => {
      expect(clienteApi).toBeDefined();
    });
  });
});
