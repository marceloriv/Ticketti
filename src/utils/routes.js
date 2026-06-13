/**
 * Constantes de rutas de la aplicación para navegación y redirecciones.
 * Centraliza los paths absolutos e interpolaciones dinámicas para evitar strings hardcodeados.
 * 
 * @type {Object}
 * @property {string} HOME - Ruta raíz principal.
 * @property {string} INICIO - Ruta de inicio.
 * @property {string} LOGIN - Ruta del formulario de inicio de sesión.
 * @property {string} REGISTRO - Ruta del formulario de registro de nuevos usuarios.
 * @property {function(number|string): string} EVENTO_DETALLE - Función que genera la ruta del detalle de un evento.
 * @property {string} DONACIONES - Ruta de donaciones y causas sociales.
 * @property {string} NOSOTROS - Ruta de información corporativa.
 * @property {string} CONTACTO - Ruta de contacto.
 * @property {string} PERFIL - Ruta del perfil del cliente autenticado.
 * @property {string} NOTIFICACIONES - Ruta de la bandeja de notificaciones.
 * @property {function(number|string): string} CARRITO - Función que genera la ruta del carrito de compras activo.
 * @property {string} ADMIN_DASHBOARD - Panel de administración principal.
 * @property {string} ORGANIZADOR_DASHBOARD - Panel para organizadores de eventos.
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

/**
 * Roles de usuario admitidos por la plataforma y los microservicios del backend.
 * 
 * @type {Object}
 * @property {string} CLIENTE - Rol de usuario cliente/comprador normal.
 * @property {string} ORGANIZADOR - Rol de usuario organizador de eventos.
 * @property {string} ADMINPLATAFORMA - Rol de superadministrador de la plataforma.
 */
export const ROLES = {
  CLIENTE: 'CLIENTE',
  ORGANIZADOR: 'ORGANIZADOR',
  ADMINPLATAFORMA: 'ADMINPLATAFORMA',
};

