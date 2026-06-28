import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import logger from '../utils/logger';

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
      } catch {
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
  async (error) => {
    const config = error.config;

    // Reintentar automáticamente en 503 (servicio no disponible) con exponential backoff
    // Solo para métodos idempotentes (GET/PUT/DELETE). AbortController cancela si el componente se desmonta.
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
          return await clienteApi(config);
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
          logger.error('Acceso prohibido al recurso (403)');
          break;
        case 404:
          logger.error('Recurso no encontrado en el servidor (404)');
          break;
        case 500:
          logger.error('Error interno del servidor en el backend (500)');
          break;
        case 503:
          break;
        default:
          logger.error(
            `Error HTTP no manejado específicamente: ${error.response.status}`
          );
      }
    } else if (error.request) {
      logger.error('No se pudo conectar con el servidor, comprueba tu red.');
    } else {
      logger.error('Error al configurar la petición HTTP:', error.message);
    }

    return Promise.reject(error);
  }
);

export default clienteApi;
