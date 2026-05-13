import axios from 'axios';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { AuthContext } from './AuthContext';

const TOKEN_KEY = 'token'; // Clave para almacenar el token en localStorage
const USER_KEY = 'user'; // Clave para almacenar datos del usuario

const authApi = axios.create({
  baseURL: '/auth',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Se crea esta función para envolver la app
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar token y usuario guardados al montar el componente
  useEffect(() => {
    const tokenGuardado = localStorage.getItem(TOKEN_KEY);
    const usuarioGuardado = localStorage.getItem(USER_KEY);

    if (tokenGuardado) {
      setToken(tokenGuardado);
    }

    if (usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch (e) {
        console.error('Error al parsear usuario guardado:', e);
        localStorage.removeItem(USER_KEY);
      }
    }

    setLoading(false);
  }, []);

  // Función asíncrona para registrar un nuevo usuario
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
      const msg = err.response?.data?.mensaje || err.response?.data?.message || 'Error al registrar usuario';
      throw new Error(msg);
    }
  };

  // Función asíncrona para iniciar sesión
  const login = async (credentials) => {
    const payload = {
      correo: credentials.correo || credentials.email || credentials.username || '',
      contrasena: credentials.contrasena || credentials.password || '',
    };

    try {
      const resp = await authApi.post('/login', payload);
      const data = resp.data;

      if (!data || !data.token) {
        throw new Error(data?.mensaje || data?.message || 'Token no recibido');
      }

      const usuarioData = data.usuario || { rol: 'CLIENTE' };

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(usuarioData));

      setToken(data.token);
      setUsuario(usuarioData);

      return data.token;
    } catch (err) {
      const msg = err.response?.data?.mensaje || err.response?.data?.message || 'Error al iniciar sesión';
      throw new Error(msg);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUsuario(null);
  };

  // Función para realizar requests autenticados
  const authFetch = async (url, options = {}) => {
    const tokenActual = localStorage.getItem(TOKEN_KEY);
    const headers = { ...(options.headers || {}) };
    if (tokenActual) headers.Authorization = `Bearer ${tokenActual}`;
    return api({ url, headers, ...options });
  };

  const isAuthenticated = !!token;

  const value = {
    token,
    usuario,
    register,
    login,
    logout,
    authFetch,
    isAuthenticated,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
