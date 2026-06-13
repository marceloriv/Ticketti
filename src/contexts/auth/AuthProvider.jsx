import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import clienteApi from '../../api/clienteApi';
import usuariosApi from '../../api/usuariosApi';
import { AuthContext } from './AuthContext';

/** Clave de localStorage para el JWT Token */
const TOKEN_KEY = 'token';
/** Clave de localStorage para los datos serializados del usuario */
const USER_KEY = 'user';
/** Clave de localStorage para el ID del carrito activo */
const CARRITO_ID_KEY = 'carritoId';

/**
 * Cliente Axios configurado localmente para el microservicio de autenticación (/auth).
 */
const authApi = axios.create({
  baseURL: '/auth',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Proveedor de contexto para la autenticación y estado del usuario.
 * Controla el ciclo de vida de la sesión (login, registro, logout) y gestiona la migración del carrito.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Elementos hijos.
 * @returns {React.JSX.Element} AuthContext Provider.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [carritoId, setCarritoIdState] = useState(() => {
    const guardado = localStorage.getItem(CARRITO_ID_KEY);
    return guardado ? Number(guardado) : null;
  });
  const [loading, setLoading] = useState(true);

  // Al cargar, recuperar credenciales almacenadas del localStorage
  useEffect(() => {
    const tokenGuardado = localStorage.getItem(TOKEN_KEY);
    if (tokenGuardado) {
      setToken(tokenGuardado);
    }
    const usuarioGuardado = localStorage.getItem(USER_KEY);
    if (usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  /**
   * Registra un nuevo usuario en el sistema.
   * Utiliza el módulo usuariosApi para llamar al microservicio.
   *
   * @param {Object} form - Datos del formulario.
   * @returns {Promise<Object>} Datos del usuario registrado devueltos por la API.
   */
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
      const data = await usuariosApi.registrarUsuario(datosRegistro);
      return data;
    } catch (err) {
      const msg =
        err.response?.data?.mensaje ||
        err.message ||
        'Error al registrar usuario';
      throw new Error(msg);
    }
  };

  /**
   * Inicia sesión autenticando al usuario contra el microservicio /auth/login.
   * Al autenticar exitosamente, se almacena el JWT en el localStorage
   * y se migra el carrito del invitado si existe.
   *
   * @param {Object} credentials - Credenciales del formulario.
   * @returns {Promise<string>} Token JWT obtenido.
   */
  const login = async (credentials) => {
    const payload = {
      correo:
        credentials.correo || credentials.email || credentials.username || '',
      contrasena: credentials.contrasena || credentials.password || '',
    };
    try {
      const resp = await authApi.post('/login', payload);
      const data = resp.data;

      if (!data || !data.token) {
        throw new Error(data?.mensaje || 'Token no recibido del servidor');
      }

      // Decodificar el token para obtener el rol, id de usuario y correo
      let usuarioData = { rol: 'CLIENTE', id: null, correo: payload.correo };
      try {
        const decoded = jwtDecode(data.token);
        if (decoded) {
          usuarioData = {
            id: decoded.usuarioId || null,
            rol: decoded.rol || 'CLIENTE',
            correo: decoded.sub || decoded.correo || payload.correo,
            nombre: decoded.nombre || payload.correo.split('@')[0]
          };
        }
      } catch (decodeErr) {
        console.warn('[AuthProvider] Error decodificando token tras login:', decodeErr);
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(usuarioData));

      setToken(data.token);
      setUsuario(usuarioData);

      // Migrar carrito de invitado al backend si existe
      if (usuarioData.id) {
        migrarCarritoInvitado(usuarioData.id);
      }

      return data.token;
    } catch (err) {
      const msg =
        err.response?.data?.mensaje || err.message || 'Error al iniciar sesión';
      throw new Error(msg);
    }
  };

  /**
   * Migra las entradas guardadas localmente en localStorage (modo invitado)
   * hacia un carrito persistente en el backend al iniciar sesión.
   *
   * @param {number|string} usuarioId - ID del usuario autenticado.
   */
  const migrarCarritoInvitado = async (usuarioId) => {
    const GUEST_CART_KEY = 'guestCart';
    try {
      const guestCartStr = localStorage.getItem(GUEST_CART_KEY);
      if (!guestCartStr) return;

      const guestCart = JSON.parse(guestCartStr);
      if (!guestCart || guestCart.length === 0) return;

      // Crear un nuevo carrito en el backend asociado al usuario
      const carritoResponse = await clienteApi.post('/Carrito/crear', null, {
        headers: {
          'X-Usuario-Id': usuarioId,
          'X-Rol-Usuario-Id': 'CLIENTE',
        },
      });

      const idNuevoCarrito = carritoResponse.data?.data?.idCarrito;
      if (!idNuevoCarrito) return;

      // Migrar cada entrada secuencialmente
      for (const entrada of guestCart) {
        try {
          await clienteApi.post(
            `/Carrito/${idNuevoCarrito}/entradas`,
            {
              eventoId: entrada.eventoId,
              tipoEntrada: entrada.tipoEntrada,
              cantidad: entrada.cantidad,
              precioUnitario: entrada.precioUnitario,
            },
            {
              headers: {
                'X-Usuario-Id': usuarioId,
              },
            }
          );
        } catch (err) {
          console.error(
            '[AuthProvider] Error migrando entrada individual:',
            err
          );
        }
      }

      // Limpiar el carrito local tras la migración exitosa
      localStorage.removeItem(GUEST_CART_KEY);
    } catch (err) {
      console.error('[AuthProvider] Error al migrar carrito de invitado:', err);
    }
  };

  /**
   * Cierra la sesión activa eliminando los tokens y datos de usuario locales.
   */
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(CARRITO_ID_KEY);
    setToken(null);
    setUsuario(null);
    setCarritoIdState(null);
  };

  /**
   * Guarda y establece el ID del carrito activo en el estado y localStorage.
   */
  const establecerCarritoId = useCallback((id) => {
    if (id === null || id === undefined || id === '') {
      setCarritoIdState(null);
      localStorage.removeItem(CARRITO_ID_KEY);
      return;
    }
    const numId = Number(id);
    if (Number.isNaN(numId) || numId <= 0) return;
    setCarritoIdState(numId);
    localStorage.setItem(CARRITO_ID_KEY, String(numId));
  }, []);

  const isAuthenticated = !!token;

  /**
   * Helper para realizar peticiones autenticadas HTTP de forma directa
   * inyectando las cabeceras JWT en la llamada.
   */
  const authFetch = async (url, options = {}) => {
    const tokenActual = localStorage.getItem(TOKEN_KEY);
    const headers = { ...(options.headers || {}) };
    if (tokenActual) headers.Authorization = `Bearer ${tokenActual}`;
    return clienteApi({ url, headers, ...options });
  };

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
