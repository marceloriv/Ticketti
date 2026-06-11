import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

/**
 * URL base de la API
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
        console.log('[API] JWT decodificado:', decoded);
        if (decoded.usuarioId) {
          // El JWT tiene el usuarioId en el claim "usuarioId"
          // Convertir a Number para asegurar que el backend reciba un Long
          const usuarioId = Number(decoded.usuarioId);
          if (!Number.isNaN(usuarioId)) {
            config.headers['X-Usuario-Id'] = usuarioId;
            console.log('[API] X-Usuario-Id header agregado:', usuarioId);
          } else {
            console.warn(
              '[API] usuarioId no es un número válido:',
              decoded.usuarioId
            );
          }
        } else {
          console.warn(
            '[API] JWT no tiene claim usuarioId. Claims disponibles:',
            Object.keys(decoded)
          );
        }
      } catch (e) {
        console.error('[API] Error decodificando JWT:', e);
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
          console.error('Sesión expirada o no autorizada');
          // No eliminar token ni redirigir automáticamente para evitar deslogueos indeseados
          break;
        case 403:
          console.error('Acceso prohibido');
          break;
        case 404:
          console.error('Recurso no encontrado');
          break;
        case 500:
          console.error('Error interno del servidor');
          break;
        default:
          console.error(`Error HTTP: ${error.response.status}`);
      }
    } else if (error.request) {
      console.error('No se pudo conectar con el servidor');
    } else {
      console.error('Error en la configuración de la petición:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
