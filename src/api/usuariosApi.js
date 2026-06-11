import clienteApi from './clienteApi';

/**
 * Módulo de API para el microservicio de Usuarios y Autenticación.
 */

/**
 * Registra un nuevo usuario en la plataforma de Ticketti.
 * Esta petición es pública y no requiere cabecera de autenticación.
 *
 * @param {Object} datosRegistro - Objeto con los datos del nuevo usuario.
 * @param {string} datosRegistro.nombre - Nombre del usuario.
 * @param {string} datosRegistro.correo - Correo electrónico del usuario.
 * @param {string} datosRegistro.contrasena - Contraseña del usuario.
 * @param {string} [datosRegistro.direccion] - Dirección física (opcional).
 * @param {string} [datosRegistro.telefono] - Teléfono de contacto (opcional).
 * @param {string} [datosRegistro.rol] - Rol asignado ('CLIENTE', 'ORGANIZADOR', 'ADMINPLATAFORMA').
 * @returns {Promise<Object>} Datos de respuesta del registro del backend.
 */
export const registrarUsuario = async (datosRegistro) => {
  const response = await clienteApi.post('/usuarios', datosRegistro, {
    skipAuth: true,
  });
  return response.data;
};

export default {
  registrarUsuario,
};
