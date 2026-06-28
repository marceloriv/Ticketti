import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const requestCallbacks = { success: null, error: null };
  const responseCallbacks = { success: null, error: null };
  return {
    jwtDecode: vi.fn(),
    loggerError: vi.fn(),
    loggerWarn: vi.fn(),
    loggerLog: vi.fn(),
    requestCallbacks,
    responseCallbacks,
  };
});

vi.mock('jwt-decode', () => ({ jwtDecode: mocks.jwtDecode }));

vi.mock('../../src/utils/logger', () => ({
  default: { error: mocks.loggerError, warn: mocks.loggerWarn, log: mocks.loggerLog, info: vi.fn() },
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

import api from '../../src/api/api';

describe('api.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('request interceptor', () => {
    it('inyecta token Bearer cuando hay token en localStorage', () => {
      localStorage.setItem('token', 'my-jwt-token');
      mocks.jwtDecode.mockReturnValue({ usuarioId: 7 });

      const config = { headers: {}, url: '/eventos' };
      const result = mocks.requestCallbacks.success(config);

      expect(result.headers.Authorization).toBe('Bearer my-jwt-token');
      expect(result.headers['X-Usuario-Id']).toBe(7);
    });

    it('no inyecta token cuando no hay token en localStorage', () => {
      const config = { headers: {}, url: '/eventos' };
      const result = mocks.requestCallbacks.success(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('salta auth cuando config.skipAuth es true', () => {
      localStorage.setItem('token', 'token123');
      const config = { headers: {}, url: '/eventos', skipAuth: true };
      const result = mocks.requestCallbacks.success(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('no inyecta headers en rutas públicas (POST /usuarios)', () => {
      localStorage.setItem('token', 'token123');
      const config = { headers: {}, method: 'post', url: '/usuarios' };
      const result = mocks.requestCallbacks.success(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('maneja jwtDecode con usuarioId null', () => {
      localStorage.setItem('token', 'token123');
      mocks.jwtDecode.mockReturnValue({ usuarioId: null });

      const config = { headers: {}, url: '/eventos' };
      const result = mocks.requestCallbacks.success(config);

      expect(result.headers['X-Usuario-Id']).toBeUndefined();
    });

    it('maneja jwtDecode que lanza excepción', () => {
      localStorage.setItem('token', 'bad-token');
      mocks.jwtDecode.mockImplementation(() => { throw new Error('Invalid'); });

      const config = { headers: {}, url: '/eventos' };
      const result = mocks.requestCallbacks.success(config);

      expect(result.headers.Authorization).toBe('Bearer bad-token');
      expect(result.headers['X-Usuario-Id']).toBeUndefined();
    });

    it('maneja jwtDecode con usuarioId NaN', () => {
      localStorage.setItem('token', 'token123');
      mocks.jwtDecode.mockReturnValue({ usuarioId: 'not-a-number' });

      const config = { headers: {}, url: '/eventos' };
      const result = mocks.requestCallbacks.success(config);

      expect(result.headers['X-Usuario-Id']).toBeUndefined();
    });

    it('usa metodo get por defecto cuando method es undefined', () => {
      localStorage.setItem('token', 'tok');
      const config = { headers: {}, url: '/usuarios' };
      const result = mocks.requestCallbacks.success(config);

      expect(result.headers.Authorization).toBe('Bearer tok');
    });
  });

  describe('response interceptor - error handling', () => {
    const crearError = (status, data = {}) => ({
      config: {},
      response: { status, data },
      request: {},
      message: `Error ${status}`,
    });

    it('maneja error 401 y limpia localStorage', async () => {
      localStorage.setItem('token', 'expired');
      localStorage.setItem('user', '{}');
      localStorage.setItem('carritoId', '1');

      const error = crearError(401);
      await expect(mocks.responseCallbacks.error(error)).rejects.toThrow();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(localStorage.getItem('carritoId')).toBeNull();
    });

    it('maneja error 401 sin token en localStorage', async () => {
      const error = crearError(401);
      await expect(mocks.responseCallbacks.error(error)).rejects.toThrow();
    });

    it('maneja error 403', async () => {
      const error = crearError(403);
      await expect(mocks.responseCallbacks.error(error)).rejects.toThrow();
      expect(mocks.loggerError).toHaveBeenCalledWith('Acceso prohibido');
    });

    it('maneja error 404', async () => {
      const error = crearError(404);
      await expect(mocks.responseCallbacks.error(error)).rejects.toThrow();
      expect(mocks.loggerError).toHaveBeenCalledWith('Recurso no encontrado');
    });

    it('maneja error 500', async () => {
      const error = crearError(500);
      await expect(mocks.responseCallbacks.error(error)).rejects.toThrow();
      expect(mocks.loggerError).toHaveBeenCalledWith('Error interno del servidor');
    });

    it('maneja error 503 silenciosamente (ya fue manejado por retry)', async () => {
      const error = crearError(503);
      await expect(mocks.responseCallbacks.error(error)).rejects.toThrow();
      expect(mocks.loggerError).not.toHaveBeenCalled();
    });

    it('maneja error HTTP no listado (default)', async () => {
      const error = crearError(418);
      await expect(mocks.responseCallbacks.error(error)).rejects.toThrow();
      expect(mocks.loggerError).toHaveBeenCalledWith('Error HTTP: 418');
    });

    it('maneja error sin response pero con request (network error)', async () => {
      const error = { config: {}, request: {}, message: 'Network Error' };
      await expect(mocks.responseCallbacks.error(error)).rejects.toThrow();
      expect(mocks.loggerError).toHaveBeenCalledWith('No se pudo conectar con el servidor');
    });

    it('maneja error sin response ni request (setup error)', async () => {
      const error = { config: {}, message: 'Bad config' };
      await expect(mocks.responseCallbacks.error(error)).rejects.toThrow();
      expect(mocks.loggerError).toHaveBeenCalledWith('Error en la configuración de la petición:', 'Bad config');
    });
  });

  describe('configuración', () => {
    it('exporta una instancia de axios', () => {
      expect(api).toBeDefined();
    });
  });
});
