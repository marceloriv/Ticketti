import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

/**
 * URL base para las peticiones de la API de Ticketti.
 * Se obtiene de las variables de entorno o usa '/api/v1' por defecto.
 * @type {string}
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * Cliente Axios configurado para interactuar con los microservicios de Ticketti.
 * @type {import('axios').AxiosInstance}
 */
const clienteApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Determina si la petición actual corresponde a una ruta pública que no requiere token.
 *
 * @param {import('axios').InternalAxiosRequestConfig} config - Configuración de la petición Axios.
 * @returns {boolean} True si es una ruta pública, False en caso contrario.
 */
const esRutaPublica = (config) => {
  const metodo = (config.method || 'get').toLowerCase();
  const url = config.url || '';
  // El registro de usuarios (POST a /usuarios) es público.
  return metodo === 'post' && url === '/usuarios';
};

// Interceptor de petición: Inyección del token Bearer JWT y cabeceras de usuario
clienteApi.interceptors.request.use(
  (config) => {
    if (config.skipAuth) {
      return config;
    }

    const token = localStorage.getItem('token');
    if (token && !esRutaPublica(config)) {
      // Agregar cabecera estándar de Autorización
      config.headers.Authorization = `Bearer ${token}`;

      try {
        const decoded = jwtDecode(token);
        if (decoded) {
          if (decoded.usuarioId) {
            config.headers['X-Usuario-Id'] = String(decoded.usuarioId);
          }
          if (decoded.rol) {
            config.headers['X-Rol-Usuario-Id'] = String(decoded.rol);
          }
        }
      } catch (e) {
        // Ignorar
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta: Manejo global de códigos de estado HTTP comunes
clienteApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Sesión expirada o no autorizada (401)');
          if (localStorage.getItem('token')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('carritoId');
            globalThis.location.href = '/login';
          }
          break;
        case 403:
          console.error('Acceso prohibido al recurso (403)');
          break;
        case 404:
          console.error('Recurso no encontrado en el servidor (404)');
          break;
        case 500:
          console.error('Error interno del servidor en el backend (500)');
          break;
        default:
          console.error(
            `Error HTTP no manejado específicamente: ${error.response.status}`
          );
      }
    } else if (error.request) {
      console.error('No se pudo conectar con el servidor, comprueba tu red.');
    } else {
      console.error('Error al configurar la petición HTTP:', error.message);
    }

    return Promise.reject(error);
  }
);

export default clienteApi;
