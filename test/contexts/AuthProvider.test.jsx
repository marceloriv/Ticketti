import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { AuthProvider } from '../../src/contexts/auth/AuthProvider';
import { AuthContext } from '../../src/contexts/auth/AuthContext';

const mocks = vi.hoisted(() => ({
  jwtDecode: vi.fn(),
  axiosPost: vi.fn(),
  clienteApiPost: vi.fn(),
  registrarUsuario: vi.fn(),
}));

vi.mock('jwt-decode', () => ({ jwtDecode: mocks.jwtDecode }));

vi.mock('axios', () => {
  const instance = {
    post: mocks.axiosPost,
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
    defaults: { headers: { common: {} } },
  };
  return { default: { create: vi.fn(() => instance) } };
});

vi.mock('../../src/api/clienteApi', () => ({
  default: { post: mocks.clienteApiPost },
}));

vi.mock('../../src/api/usuariosApi', () => ({
  default: { registrarUsuario: mocks.registrarUsuario },
}));

vi.mock('../../src/utils/logger', () => ({
  default: { warn: vi.fn(), error: vi.fn(), log: vi.fn(), info: vi.fn() },
}));

function useAuthTestHook() {
  const ctx = useContext(AuthContext);
  const ref = useRef(ctx);
  ref.current = ctx;
  return ref;
}

function renderAuthProvider() {
  const ref = { current: null };
  function Consumer() {
    ref.current = useAuthTestHook();
    return null;
  }
  const result = renderHook(() => null, {
    wrapper: ({ children }) => (
      <AuthProvider>
        <Consumer />
        {children}
      </AuthProvider>
    ),
  });
  return {
    ...result,
    getCtx: () => ref.current?.current,
  };
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('estado inicial', () => {
    it('provee el contexto con los valores por defecto', () => {
      const { getCtx } = renderAuthProvider();
      const ctx = getCtx();

      expect(ctx.token).toBeNull();
      expect(ctx.usuario).toBeNull();
      expect(ctx.isAuthenticated).toBe(false);
      expect(ctx.loading).toBe(false);
      expect(typeof ctx.login).toBe('function');
      expect(typeof ctx.register).toBe('function');
      expect(typeof ctx.logout).toBe('function');
      expect(typeof ctx.establecerCarritoId).toBe('function');
      expect(typeof ctx.actualizarContextoUsuario).toBe('function');
    });

    it('recupera token y usuario del localStorage', () => {
      localStorage.setItem('token', 'saved-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, nombre: 'Test' }));

      const { getCtx } = renderAuthProvider();
      const ctx = getCtx();

      expect(ctx.token).toBe('saved-token');
      expect(ctx.usuario).toEqual({ id: 1, nombre: 'Test' });
      expect(ctx.isAuthenticated).toBe(true);
    });

    it('maneja JSON inválido en localStorage user', () => {
      localStorage.setItem('token', 'token');
      localStorage.setItem('user', 'invalid-json');

      const { getCtx } = renderAuthProvider();
      const ctx = getCtx();

      expect(ctx.token).toBe('token');
      expect(ctx.usuario).toBeNull();
    });
  });

  describe('register', () => {
    it('registra un usuario con campos estándar', async () => {
      mocks.registrarUsuario.mockResolvedValue({ id: 1, nombre: 'Nuevo' });

      const { getCtx } = renderAuthProvider();
      const ctx = getCtx();

      let result;
      await act(async () => {
        result = await ctx.register({
          nombre: 'Test',
          correo: 'test@test.com',
          contrasena: 'pass123',
        });
      });

      expect(mocks.registrarUsuario).toHaveBeenCalledWith({
        nombre: 'Test',
        correo: 'test@test.com',
        contrasena: 'pass123',
        direccion: '',
        telefono: '',
        rol: 'CLIENTE',
      });
      expect(result).toEqual({ id: 1, nombre: 'Nuevo' });
    });

    it('normaliza campos con aliases (username, email, password)', async () => {
      mocks.registrarUsuario.mockResolvedValue({ id: 2 });

      const { getCtx } = renderAuthProvider();
      const ctx = getCtx();

      await act(async () => {
        await ctx.register({
          username: 'user1',
          email: 'user1@test.com',
          password: 'pass456',
        });
      });

      expect(mocks.registrarUsuario).toHaveBeenCalledWith({
        nombre: 'user1',
        correo: 'user1@test.com',
        contrasena: 'pass456',
        direccion: '',
        telefono: '',
        rol: 'CLIENTE',
      });
    });

    it('lanza error con mensaje del backend', async () => {
      mocks.registrarUsuario.mockRejectedValue({
        response: { data: { mensaje: 'Correo ya existe' } },
      });

      const { getCtx } = renderAuthProvider();
      const ctx = getCtx();

      await act(async () => {
        await expect(ctx.register({})).rejects.toThrow('Correo ya existe');
      });
    });

    it('lanza error genérico cuando no hay mensaje', async () => {
      mocks.registrarUsuario.mockRejectedValue(new Error());

      const { getCtx } = renderAuthProvider();
      const ctx = getCtx();

      await act(async () => {
        await expect(ctx.register({})).rejects.toThrow('Error al registrar usuario');
      });
    });
  });

  describe('login', () => {
    it('login exitoso con credenciales válidas', async () => {
      const token = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c3VhcmlvSWQiOjQyLCJyb2wiOiJDTElFTlRFIiwic3ViIjoidGVzdEB0ZXN0LmNvbSJ9';
      mocks.axiosPost.mockResolvedValue({ data: { token } });
      mocks.jwtDecode.mockReturnValue({ usuarioId: 42, rol: 'CLIENTE', sub: 'test@test.com', nombre: 'Test' });

      const { getCtx } = renderAuthProvider();
      const ctx = getCtx();

      let result;
      await act(async () => {
        result = await ctx.login({ correo: 'test@test.com', contrasena: 'pass' });
      });

      expect(result).toBe(token);
      expect(getCtx().token).toBe(token);
      expect(getCtx().isAuthenticated).toBe(true);
      expect(localStorage.getItem('token')).toBe(token);
    });

    it('login con aliases de campos (email, password)', async () => {
      mocks.axiosPost.mockResolvedValue({ data: { token: 'tok123' } });
      mocks.jwtDecode.mockReturnValue({ usuarioId: 1, rol: 'CLIENTE' });

      const { getCtx } = renderAuthProvider();
      const ctx = getCtx();

      await act(async () => {
        await ctx.login({ email: 'a@b.com', password: 'pass' });
      });

      expect(mocks.axiosPost).toHaveBeenCalledWith('/login', {
        correo: 'a@b.com',
        contrasena: 'pass',
      });
    });

    it('lanza error cuando no hay token en respuesta', async () => {
      mocks.axiosPost.mockResolvedValue({ data: {} });

      const { getCtx } = renderAuthProvider();
      const ctx = getCtx();

      await act(async () => {
        await expect(ctx.login({ correo: 'a@b.com', contrasena: 'pass' })).rejects.toThrow();
      });
    });

    it('lanza error 401 con mensaje de credenciales incorrectas', async () => {
      mocks.axiosPost.mockRejectedValue({
        response: { status: 401, data: {} },
      });

      const { getCtx } = renderAuthProvider();
      const ctx = getCtx();

      await act(async () => {
        await expect(ctx.login({ correo: 'a@b.com', contrasena: 'wrong' })).rejects.toThrow(
          'Correo electrónico o contraseña incorrectos'
        );
      });
    });

    it('maneja error de jwtDecode sin fallar el login', async () => {
      mocks.axiosPost.mockResolvedValue({ data: { token: 'tok' } });
      mocks.jwtDecode.mockImplementation(() => { throw new Error('Bad JWT'); });

      const { getCtx } = renderAuthProvider();
      const ctx = getCtx();

      await act(async () => {
        await ctx.login({ correo: 'a@b.com', contrasena: 'pass' });
      });

      expect(getCtx().isAuthenticated).toBe(true);
    });
  });

  describe('logout', () => {
    it('limpia todo el estado y localStorage', () => {
      localStorage.setItem('token', 'tok');
      localStorage.setItem('user', '{}');
      localStorage.setItem('carritoId', '1');

      const { getCtx } = renderAuthProvider();
      const ctx = getCtx();

      act(() => ctx.logout());

      const after = getCtx();
      expect(after.token).toBeNull();
      expect(after.usuario).toBeNull();
      expect(after.isAuthenticated).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(localStorage.getItem('carritoId')).toBeNull();
    });
  });

  describe('establecerCarritoId', () => {
    it('guarda un ID válido', () => {
      const { getCtx } = renderAuthProvider();
      const ctx = getCtx();

      act(() => ctx.establecerCarritoId(42));

      expect(getCtx().carritoId).toBe(42);
      expect(localStorage.getItem('carritoId')).toBe('42');
    });

    it('rechaza NaN', () => {
      const { getCtx } = renderAuthProvider();
      const ctx = getCtx();

      act(() => ctx.establecerCarritoId('abc'));

      expect(getCtx().carritoId).toBeNull();
    });

    it('rechaza ID <= 0', () => {
      const { getCtx } = renderAuthProvider();
      const ctx = getCtx();

      act(() => ctx.establecerCarritoId(-1));

      expect(getCtx().carritoId).toBeNull();
    });

    it('rechaza null/undefined/string vacío', () => {
      const { getCtx } = renderAuthProvider();
      const ctx = getCtx();

      act(() => ctx.establecerCarritoId(null));
      act(() => ctx.establecerCarritoId(undefined));
      act(() => ctx.establecerCarritoId(''));

      expect(getCtx().carritoId).toBeNull();
      expect(localStorage.getItem('carritoId')).toBeNull();
    });

    it('convierte string numérico a número', () => {
      const { getCtx } = renderAuthProvider();
      const ctx = getCtx();

      act(() => ctx.establecerCarritoId('55'));

      expect(getCtx().carritoId).toBe(55);
    });
  });

  describe('actualizarContextoUsuario', () => {
    it('actualiza los datos del usuario', () => {
      localStorage.setItem('user', JSON.stringify({ id: 1, nombre: 'Old' }));

      const { getCtx } = renderAuthProvider();
      const ctx = getCtx();

      act(() => ctx.actualizarContextoUsuario({ nombre: 'New' }));

      expect(getCtx().usuario).toEqual({ id: 1, nombre: 'New' });
      expect(JSON.parse(localStorage.getItem('user')).nombre).toBe('New');
    });

    it('no hace nada si no hay usuario', () => {
      const { getCtx } = renderAuthProvider();
      const ctx = getCtx();

      act(() => ctx.actualizarContextoUsuario({ nombre: 'New' }));

      expect(getCtx().usuario).toBeNull();
    });
  });
});
