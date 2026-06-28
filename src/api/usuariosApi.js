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

/**
 * Lista todos los usuarios registrados en la plataforma.
 * Se usa en el panel administrador para mostrar la gestión de usuarios.
 *
 * @returns {Promise<Array>} Lista de usuarios registrados.
 */
export const listarUsuarios = async () => {
  const response = await clienteApi.get('/usuarios');
  return response.data || [];
};

/**
 * Obtiene los detalles completos de un usuario por su ID.
 *
 * @param {number|string} id - ID del usuario.
 * @param {Object} [options] - Opciones adicionales (ej. { signal: AbortSignal }).
 * @returns {Promise<Object>} Datos del usuario obtenidos.
 */
export const obtenerUsuario = async (id, options = {}) => {
  const response = await clienteApi.get(`/usuarios/${id}`, options);
  return response.data;
};

/**
 * Actualiza los datos de perfil de un usuario existente.
 *
 * @param {number|string} id - ID del usuario.
 * @param {Object} datos - Datos a actualizar.
 * @returns {Promise<Object>} Datos del usuario actualizado.
 */
export const actualizarUsuario = async (id, datos) => {
  const response = await clienteApi.put(`/usuarios/${id}`, datos);
  return response.data;
};

/**
 * Elimina un usuario existente por su ID.
 * Se usa desde el panel administrador.
 *
 * @param {number|string} id - ID del usuario a eliminar.
 * @returns {Promise<Object>} Respuesta del backend.
 */
export const eliminarUsuario = async (id) => {
  const response = await clienteApi.delete(`/usuarios/${id}`);
  return response.data;
};


export default {
  registrarUsuario,
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario,
};
