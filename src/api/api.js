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
 * Interceptor de respuestas para manejar errores HTTP + retry en 503
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const config = error.config;

    // Reintentar automáticamente en 503 con exponential backoff (mismos criterios que clienteApi)
    const metodo = (config?.method || '').toLowerCase();
    const esIdempotente = metodo === 'get' || metodo === 'put' || metodo === 'delete';
    const noReintentar = ['/notificaciones/contacto'];
    const debeReintentar = esIdempotente && !noReintentar.some(endpoint => config.url?.includes(endpoint));
    if (error.response?.status === 503 && debeReintentar && !config?._retry) {
      config._retry = true;
      const maxRetries = 3;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        if (config.signal?.aborted) break;
        const delay = 1500 * 1.5 ** attempt;
        await new Promise(r => setTimeout(r, delay));
        if (config.signal?.aborted) break;
        try {
          return await api(config);
        } catch (retryError) {
          if (retryError.name === 'CanceledError' || retryError.code === 'ERR_CANCELED') break;
          if (retryError.response?.status === 503) {
            if (attempt === maxRetries - 1) {
              logger.error(`Servicio no disponible tras ${maxRetries} reintentos (503)`);
            }
            continue;
          }
          throw retryError;
        }
      }
    }

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
        case 503:
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