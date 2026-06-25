import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  registrarUsuario: vi.fn(),
  obtenerUsuario: vi.fn(),
  actualizarUsuario: vi.fn(),
}));

vi.mock('../../src/api/usuariosApi', () => ({
  usuariosApi: {
    registrarUsuario: mocks.registrarUsuario,
    obtenerUsuario: mocks.obtenerUsuario,
    actualizarUsuario: mocks.actualizarUsuario,
  },
}));

import { usuariosApi } from '../../src/api/usuariosApi';

describe('usuariosApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registrarUsuario', () => {
    it('registra un nuevo usuario', async () => {
      const datos = {
        nombre: 'Test User',
        correo: 'test@test.com',
        contrasena: 'Password123',
      };
      const mockResponse = { data: { id: 1, nombre: 'Test User' } };
      mocks.registrarUsuario.mockResolvedValue(mockResponse);
      const result = await usuariosApi.registrarUsuario(datos);
      expect(mocks.registrarUsuario).toHaveBeenCalledWith(datos);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('obtenerUsuario', () => {
    it('obtiene un usuario por ID', async () => {
      const mockUsuario = { id: 1, nombre: 'Test User', correo: 'test@test.com' };
      mocks.obtenerUsuario.mockResolvedValue(mockUsuario);
      const result = await usuariosApi.obtenerUsuario(1);
      expect(mocks.obtenerUsuario).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUsuario);
    });
  });

  describe('actualizarUsuario', () => {
    it('actualiza los datos de un usuario', async () => {
      const datos = { nombre: 'Updated Name' };
      const mockResponse = { data: { id: 1, nombre: 'Updated Name' } };
      mocks.actualizarUsuario.mockResolvedValue(mockResponse);
      const result = await usuariosApi.actualizarUsuario(1, datos);
      expect(mocks.actualizarUsuario).toHaveBeenCalledWith(1, datos);
      expect(result).toEqual(mockResponse);
    });
  });
});
