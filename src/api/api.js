import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import logger from '../utils/logger';

/**
 * URL base de la API para las peticiones de Ticketti. pk en el bff se configura el proxy para redirigir a los microservicios.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * Instancia de Axios configurada para la API
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Verifica si una ruta es pública (no requiere autenticación)
 *
 * @param {Object} config - Configuración de la petición
 * @returns {boolean} True si la ruta es pública
 */
const esRutaPublica = (config) => {
  const metodo = (config.method || 'get').toLowerCase();
  const url = config.url || '';
  // Registro público de usuario.
  return metodo === 'post' && url === '/usuarios';
};

/**
 * Interceptor de peticiones para agregar token de autenticación
 */
api.interceptors.request.use(
  (config) => {
    if (config.skipAuth) {
      return config;
    }

    const token = localStorage.getItem('token');
    if (token && !esRutaPublica(config)) {
      config.headers.Authorization = `Bearer ${token}`;

      // Decodificar JWT para extraer usuarioId
      try {
        const decoded = jwtDecode(token);
        if (decoded.usuarioId) {
          // El JWT tiene el usuarioId en el claim "usuarioId"
          // Convertir a Number para asegurar que el backend reciba un Long
          const usuarioId = Number(decoded.usuarioId);
          if (!Number.isNaN(usuarioId)) {
            config.headers['X-Usuario-Id'] = usuarioId;
          }
        }
      } catch {
        // Ignorar silenciosamente o registrar en dev
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de respuestas para manejar errores HTTP
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          logger.error('Sesión expirada o no autorizada (401)');
          if (localStorage.getItem('token')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('carritoId');
            globalThis.location.href = '/login';
          }
          break;
        case 403:
          logger.error('Acceso prohibido');
          break;
        case 404:
          logger.error('Recurso no encontrado');
          break;
        case 500:
          logger.error('Error interno del servidor');
          break;
        default:
          logger.error(`Error HTTP: ${error.response.status}`);
      }
    } else if (error.request) {
      logger.error('No se pudo conectar con el servidor');
    } else {
      logger.error('Error en la configuración de la petición:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;