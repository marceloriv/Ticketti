import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

const esRutaPublica = (config) => {
  const metodo = (config.method || 'get').toLowerCase();
  const url = config.url || '';

  // Registro público de usuario.
  if (metodo === 'post' && url === '/usuarios') {
    return true;
  }

  // Listado/busqueda pública de eventos.
  if (
    metodo === 'get' &&
    (url.startsWith('/Eventos/') || url.startsWith('/eventos/'))
  ) {
    return true;
  }

  return false;
};
// componente para ageragr jwt en las peticiones, exepto en las rutas publicas no se envia el token
api.interceptors.request.use(
  (config) => {
    if (config.skipAuth) {
      return config;
    }
    // Solo agregar el token si no es una ruta pública.
    const token = localStorage.getItem('token');
    if (token && !esRutaPublica(config)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);// Manejo de errores en la configuración de la petición.
  }
);
// este interceptor para maneja errores globales de la API
// Manejo global de errores HTTP, especialmente para redirigir en caso de 401(sesión expirada o no autorizada).
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Sesión expirada o no autorizada');
          // Solo redirigir si realmente habia una sesion activa.
          if (localStorage.getItem('token')) {
            localStorage.removeItem('token');
            globalThis.location.href = '/login';
          }
          break;
        case 403:// Acceso prohibido, aunque el usuario esté autenticado.
          console.error('Acceso prohibido');
          break;
        case 404:// Recurso no encontrado.
          console.error('Recurso no encontrado');
          break;
        case 500:// Error interno del servidor.
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
