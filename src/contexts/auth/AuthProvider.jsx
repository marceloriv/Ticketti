import api from '@api/api';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useCallback, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const CARRITO_ID_KEY = 'carritoId';

const authApi = axios.create({
  baseURL: '/auth',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * AuthProvider — Gestiona autenticación y expone carritoId al resto de la app.
 * No importa useCarrito aqui para no violar las reglas de React Hooks
 * (los hooks solo se llaman en el nivel superior de componentes o hooks personalizados).
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [carritoId, setCarritoIdState] = useState(() => {
    const guardado = localStorage.getItem(CARRITO_ID_KEY);
    return guardado ? Number(guardado) : null;
  });
  const [loading, setLoading] = useState(true);

  // Al cargar, intentar recuperar usuario desde localStorage
  useEffect(() => {
    const tokenGuardado = localStorage.getItem(TOKEN_KEY);
    if (tokenGuardado) {
      setToken(tokenGuardado);

      // Decodificar token para extraer usuarioId si no hay usuario guardado
      const usuarioGuardado = localStorage.getItem(USER_KEY);
      if (!usuarioGuardado) {
        try {
          const decodedToken = jwtDecode(tokenGuardado);
          const usuarioData = {
            rol: decodedToken.rol || 'CLIENTE',
            id: decodedToken.usuarioId || null,
            correo: decodedToken.sub || null,
          };
          localStorage.setItem(USER_KEY, JSON.stringify(usuarioData));
          setUsuario(usuarioData);
        } catch (e) {
          console.warn('No se pudo decodificar el token JWT:', e);
        }
      } else {
        try {
          setUsuario(JSON.parse(usuarioGuardado));
        } catch {
          localStorage.removeItem(USER_KEY);
        }
      }
    } else {
      const usuarioGuardado = localStorage.getItem(USER_KEY);
      if (usuarioGuardado) {
        try {
          setUsuario(JSON.parse(usuarioGuardado));
        } catch {
          localStorage.removeItem(USER_KEY);
        }
      }
    }
    setLoading(false);
  }, []);

  // Registrar usuario
  const register = async (form) => {
    const datosRegistro = {
      nombre: form.nombre || form.username || '',
      correo: form.correo || form.email || form.username || '',
      contrasena: form.contrasena || form.password || '',
      direccion: form.direccion || '',
      telefono: form.telefono || '',
      rol: form.rol || 'CLIENTE',
    };
    try {
      const resp = await api.post('/usuarios', datosRegistro, { skipAuth: true });
      return resp.data;
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al registrar usuario';
      throw new Error(msg);
    }
  };

  // Iniciar sesión
  const login = async (credentials) => {
    const payload = {
      correo: credentials.correo || credentials.email || credentials.username || '',
      contrasena: credentials.contrasena || credentials.password || '',
    };
    try {
      const resp = await authApi.post('/login', payload);
      const data = resp.data;

      if (!data || !data.token) {
        throw new Error(data?.mensaje || 'Token no recibido');
      }

      // Decodificar JWT para extraer usuarioId
      let decodedToken = {};
      try {
        decodedToken = jwtDecode(data.token);
      } catch (e) {
        console.warn('No se pudo decodificar el token JWT:', e);
      }

      const usuarioData = data.usuario || {
        rol: decodedToken.rol || 'CLIENTE',
        id: decodedToken.usuarioId || null,
        correo: decodedToken.sub || null,
      };

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(usuarioData));

      setToken(data.token);
      setUsuario(usuarioData);

      // Migrar carrito de invitado al backend si existe (fire-and-forget)
      migrarCarritoInvitado().catch((err) => {
        console.error('[AuthProvider] Error migrando carrito de invitado:', err);
      });

      return data.token;
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al iniciar sesión';
      throw new Error(msg);
    }
  };

  // Migrar carrito de localStorage al backend
  /**
   * Migra el carrito de compras de un usuario invitado al backend
   * cuando el usuario inicia sesión por primera vez.
   *
   * Este método:
   * 1. Lee el carrito del localStorage
   * 2. Crea un nuevo carrito en el backend para el usuario autenticado
   * 3. Agrega cada entrada del carrito de invitado al carrito del backend
   * 4. Limpia el localStorage después de una migración exitosa
   *
   * @returns {Promise<void>} Promesa que se resuelve cuando la migración se completa
   */
  const migrarCarritoInvitado = async () => {
    /** Clave utilizada para almacenar el carrito de invitado en localStorage */
    const GUEST_CART_KEY = 'guestCart';
    try {
      const guestCartStr = localStorage.getItem(GUEST_CART_KEY);
      if (!guestCartStr) return;

      const guestCart = JSON.parse(guestCartStr);
      if (!guestCart || guestCart.length === 0) return;

      // Crear carrito para el usuario (el interceptor agrega headers automáticamente)
      const carritoResponse = await api.post('/Carrito/crear', null);

      const carritoId = carritoResponse.data?.data?.idCarrito;
      if (!carritoId) return;

      // Agregar cada entrada del carrito de invitado (el interceptor agrega headers automáticamente)
      for (const entrada of guestCart) {
        try {
          await api.post(`/Carrito/${carritoId}/entradas`, {
            eventoId: entrada.eventoId,
            tipoEntrada: entrada.tipoEntrada,
            cantidad: entrada.cantidad,
            precioUnitario: entrada.precioUnitario,
          });
        } catch (err) {
          console.error('Error migrando entrada:', err);
        }
      }

      // Limpiar carrito de invitado después de migrar
      localStorage.removeItem(GUEST_CART_KEY);
    } catch (err) {
      console.error('Error migrando carrito de invitado:', err);
    }
  };

  // Cerrar sesión
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(CARRITO_ID_KEY);
    setToken(null);
    setUsuario(null);
    setCarritoIdState(null);
  };

  // Establecer carritoId explicitamente
  const establecerCarritoId = useCallback((id) => {
    const numId = Number(id);
    if (Number.isNaN(numId) || numId <= 0) return;
    setCarritoIdState(numId);
    localStorage.setItem(CARRITO_ID_KEY, String(numId));
  }, []);

  const isAuthenticated = !!token;

  const authFetch = async (url, options = {}) => {
    const tokenActual = localStorage.getItem(TOKEN_KEY);
    const headers = { ...(options.headers || {}) };
    if (tokenActual) headers.Authorization = `Bearer ${tokenActual}`;
    return api({ url, headers, ...options });
  };

  // Los componentes hijos usan useCarrito directamente y llaman a
  // establecerCarritoId(id) cuando obtienen el carrito del backend.
  // Esto evita llamar a un hook dentro de un callback del contexto.

  const value = {
    token,
    usuario,
    carritoId,
    register,
    login,
    logout,
    authFetch,
    establecerCarritoId,
    isAuthenticated,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
