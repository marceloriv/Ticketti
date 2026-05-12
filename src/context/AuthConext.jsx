import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import api from '../services/api';


// se crea un contexto de autenticación para manejar los estados del login, registro y token
const AuthContext = createContext(null);

//hook peronalizado para que cualquier componente pueda acceder a las funciones y estados 
export const useAuth = () => useContext(AuthContext);

const TOKEN_KEY = 'token'; // clave para almacenar el token en localStorage
const authApi = axios.create({ 
  baseURL: '/auth', 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// se crea esta funcion para envolver la apk
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null); // estado 
  
  useEffect(() => {
    const tokenGuardado = localStorage.getItem(TOKEN_KEY);
    if (tokenGuardado) setToken(tokenGuardado);
  }, []);
  // función asíncona para registrar un nuevo usuario 
  const register = async (form) => {
    //objeto coon datos para envialo al backend 
    const datosRegistro = {
      nombre: form.nombre || form.username || '',
      correo: form.correo || form.email || form.username || '',
      contrasena: form.contrasena || form.password || '',
      direccion: form.direccion || '',
      telefono: form.telefono || '',
      rol: 'CLIENTE',
    };

    try {
      const resp = await api.post('/usuarios', datosRegistro, { skipAuth: true });
      return resp.data;// si responde bien se devuelve la data
    } catch (err) {
      const msg = err.response?.data?.mensaje || err.response?.data?.message || 'Error al registrar usuario';
      throw new Error(msg);
    }
  };
  // función asíncona para iniciar sesión 
  const login = async (credentials) => {
    const payload = {
      correo: credentials.correo || credentials.email || credentials.username || '',
      contrasena: credentials.contrasena || credentials.password || '',
    };

    try {
      const resp = await authApi.post('/login', payload);
      const data = resp.data;
      if (!data || !data.token) throw new Error(data?.mensaje || data?.message || 'Token no recibido');
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      return data.token;
    } catch (err) {
      const msg = err.response?.data?.mensaje || err.response?.data?.message || 'Error al iniciar sesión';
      throw new Error(msg);
    }
  };
// funcion para cerrar sesión 
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  const authFetch = async (url, options = {}) => {
    const tokenActual = localStorage.getItem(TOKEN_KEY);
    const headers = { ...(options.headers || {}) };
    if (tokenActual) headers.Authorization = `Bearer ${tokenActual}`;
    return api({ url, headers, ...options });
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        register,
        login,
        logout,
        authFetch,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}