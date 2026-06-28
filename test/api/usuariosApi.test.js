import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}));

vi.mock('../../src/api/clienteApi', () => ({
  default: {
    get: mocks.get,
    post: mocks.post,
    put: mocks.put,
  },
}));

import * as usuariosApi from '../../src/api/usuariosApi';

describe('usuariosApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registrarUsuario', () => {
    it('registra un nuevo usuario con skipAuth', async () => {
      const datos = { nombre: 'Test', correo: 'test@test.com', contrasena: 'pass123' };
      const mockResponse = { data: { id: 1, nombre: 'Test' } };
      mocks.post.mockResolvedValue(mockResponse);
      const result = await usuariosApi.registrarUsuario(datos);
      expect(mocks.post).toHaveBeenCalledWith('/usuarios', datos, { skipAuth: true });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('obtenerUsuario', () => {
    it('obtiene un usuario por ID', async () => {
      const mockUsuario = { id: 1, nombre: 'Test' };
      mocks.get.mockResolvedValue({ data: mockUsuario });
      const result = await usuariosApi.obtenerUsuario(1);
      expect(mocks.get).toHaveBeenCalledWith('/usuarios/1', {});
      expect(result).toEqual(mockUsuario);
    });
  });

  describe('actualizarUsuario', () => {
    it('actualiza los datos de un usuario', async () => {
      const datos = { nombre: 'Updated' };
      mocks.put.mockResolvedValue({ data: { id: 1, nombre: 'Updated' } });
      const result = await usuariosApi.actualizarUsuario(1, datos);
      expect(mocks.put).toHaveBeenCalledWith('/usuarios/1', datos);
      expect(result).toEqual({ id: 1, nombre: 'Updated' });
    });
  });

  describe('default export', () => {
    it('exporta todas las funciones', () => {
      expect(usuariosApi.default).toBeDefined();
      expect(typeof usuariosApi.default.registrarUsuario).toBe('function');
      expect(typeof usuariosApi.default.obtenerUsuario).toBe('function');
      expect(typeof usuariosApi.default.actualizarUsuario).toBe('function');
    });
  });
});
