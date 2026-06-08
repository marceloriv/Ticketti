/**
 * Stubs para endpoints de donaciones usados por la UI localmente
 * Estos métodos simulan llamadas a la API de donaciones
 */

/**
 * Obtiene la lista de organizaciones
 *
 * @returns {Promise<Array>} Lista de organizaciones
 */
export const getOrganizaciones = async () => [];

/**
 * Obtiene las causas activas
 *
 * @returns {Promise<Array>} Lista de causas activas
 */
export const getCausasActivas = async () => [];

/**
 * Obtiene el total de donaciones por organización
 *
 * @returns {Promise<number>} Total de donaciones
 */
export const getTotalPorOrganizacion = async () => 0;

/**
 * Crea una nueva organización
 *
 * @param {Object} payload - Datos de la organización
 * @returns {Promise<Object>} Organización creada
 */
export const crearOrganizacion = async (payload) => ({ ...payload, idOrganizacion: Date.now() });

/**
 * Crea una nueva causa
 *
 * @param {Object} payload - Datos de la causa
 * @returns {Promise<Object>} Causa creada
 */
export const crearCausa = async (payload) => ({ ...payload, idCausa: Date.now() });

/**
 * Obtiene las causas por organización
 *
 * @returns {Promise<Array>} Lista de causas de la organización
 */
export const getCausasPorOrganizacion = async () => [];

export default {
  getOrganizaciones,
  getCausasActivas,
  getTotalPorOrganizacion,
  crearOrganizacion,
  crearCausa,
  getCausasPorOrganizacion,
};
