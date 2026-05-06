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
  if (metodo === 'get' && (url.startsWith('/Eventos/') || url.startsWith('/eventos/'))) {
    return true;
  }

  return false;
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !esRutaPublica(config)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

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
  },
);

export default api;
