/**
 * Constantes de rutas de la aplicación
 * Usar estas constantes en lugar de escribir rutas hardcodeadas
 */

export const ROUTES = {
  // Públicas
  HOME: '/',
  INICIO: '/home',
  LOGIN: '/login',
  REGISTRO: '/registro',
  EVENTO_DETALLE: (id) => `/evento/${id}`,
  DONACIONES: '/donaciones',
  NOSOTROS: '/nosotros',
  CONTACTO: '/contact',

  // Cliente autenticado
  PERFIL: '/perfil',
  NOTIFICACIONES: '/notificaciones',
  CARRITO: (id) => `/carrito/${id}`,

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',

  // Organizador
  ORGANIZADOR_DASHBOARD: '/organizador/dashboard',
};

export const ROLES = {
  CLIENTE: 'CLIENTE',
  ORGANIZADOR: 'ORGANIZADOR',
  ADMIN: 'ADMIN',
};
