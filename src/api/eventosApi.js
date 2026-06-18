import clienteApi from './clienteApi';

/**
 * Módulo de API para interactuar con el microservicio de Eventos.
 * Permite buscar eventos disponibles y listar toda la oferta cultural de Ticketti.
 */

/**
 * Obtiene la lista de todos los eventos disponibles registrados en el sistema.
 *
 * @returns {Promise<Array>} Promesa que resuelve con la lista de eventos.
 */
export const listarEventos = async () => {
  const response = await clienteApi.get('/eventos/listarEventos');
  return response.data || [];
};

/**
 * Busca los detalles de un evento específico según su identificador único.
 *
 * @param {number|string} id - ID del evento a consultar.
 * @returns {Promise<Object>} Datos del evento encontrado.
 */
export const buscarEvento = async (id) => {
  const response = await clienteApi.get(`/eventos/buscarEvento/${id}`);
  return response.data;
};

/**
 * Lista los eventos del organizador autenticado.
 */
export const listarMisEventos = async () => {
  const response = await clienteApi.get('/eventos/mis');
  return response.data || [];
};

export default {
  listarEventos,
  buscarEvento,
  listarMisEventos,
};