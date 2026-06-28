import clienteApi from './clienteApi';

/**
 * Módulo de API para interactuar con el microservicio de Carrito de compras.
 * Proporciona métodos para crear, modificar, renovar y realizar checkout de reservas de entradas.
 */

/**
 * Crea un nuevo carrito de compras para el usuario actual.
 *
 * @returns {Promise<Object>} Promesa que resuelve con los datos del carrito recién creado.
 */
export const crearCarrito = async () => {
  const response = await clienteApi.post('/Carrito/crear');
  return response.data?.data;
};

/**
 * Obtiene los detalles de un carrito específico por su ID.
 *
 * @param {number|string} id - ID del carrito a buscar.
 * @returns {Promise<Object>} Promesa que resuelve con el objeto del carrito.
 */
export const obtenerCarrito = async (id) => {
  const response = await clienteApi.get(`/Carrito/obtener/${id}`);
  return response.data?.data;
};

/**
 * Obtiene el resumen consolidado de un carrito, incluyendo subtotales, donación sugerida y total.
 *
 * @param {number|string} id - ID del carrito del cual obtener el resumen.
 * @returns {Promise<Object>} Promesa que resuelve con el resumen del carrito.
 */
export const obtenerResumen = async (id) => {
  const response = await clienteApi.get(`/Carrito/resumen/${id}`);
  return response.data?.data;
};

/**
 * Agrega una nueva entrada de evento al carrito de compras especificado.
 *
 * @param {number|string} carritoId - ID del carrito activo.
 * @param {Object} entradaData - Datos de la entrada.
 * @param {number} entradaData.eventoId - ID del evento seleccionado.
 * @param {string} entradaData.tipoEntrada - Tipo o categoría de la entrada (e.g. 'General').
 * @param {number} entradaData.cantidad - Cantidad de entradas a añadir (normalmente entre 1 y 4).
 * @param {number} entradaData.precioUnitario - Costo unitario de la entrada del evento.
 * @returns {Promise<Object>} Promesa que resuelve con los datos del ítem añadido.
 */
export const agregarEntrada = async (carritoId, entradaData) => {
  const response = await clienteApi.post(
    `/Carrito/${carritoId}/entradas`,
    entradaData
  );
  return response.data?.data;
};

/**
 * Elimina una entrada del carrito basándose en su identificador de detalle de ítem.
 *
 * @param {number|string} carritoId - ID del carrito activo.
 * @param {number|string} detalleId - ID de detalle del ítem a eliminar del carrito.
 * @returns {Promise<Object>} Promesa que resuelve con la respuesta del microservicio.
 */
export const eliminarEntrada = async (carritoId, detalleId) => {
  const response = await clienteApi.delete(
    `/Carrito/${carritoId}/entradas/${detalleId}`
  );
  return response.data?.data;
};

/**
 * Actualiza la información o ítems de un carrito de compras.
 *
 * @param {number|string} carritoId - ID del carrito.
 * @param {Object} datosActualizados - Estructura con la información a actualizar.
 * @returns {Promise<Object>} Promesa que resuelve con el estado actualizado del carrito.
 */
export const actualizarCarrito = async (carritoId, datosActualizados) => {
  const response = await clienteApi.put(
    `/Carrito/actualizar/${carritoId}`,
    datosActualizados
  );
  return response.data?.data;
};

/**
 * Inicia el proceso de checkout (pago) de las entradas del carrito asociándolas a una causa social.
 *
 * @param {number|string} carritoId - ID del carrito.
 * @param {Object} payload - Cuerpo de la solicitud.
 * @param {number} payload.causaSocialId - ID de la causa social que recibirá la donación (10%).
 * @param {string} payload.idempotencyKey - Clave única para evitar procesamiento duplicado.
 * @returns {Promise<Object>} Datos de la orden de pago o transacción iniciada.
 */
export const iniciarCheckout = async (
  carritoId,
  { causaSocialId, idempotencyKey }
) => {
  const response = await clienteApi.post(`/Carrito/checkout/${carritoId}`, {
    causaSocialId,
    idempotencyKey,
  });
  return response.data?.data;
};

/**
 * Renueva el tiempo de vigencia de una reserva de entradas dentro de un carrito.
 *
 * @param {number|string} carritoId - ID del carrito con la reserva activa.
 * @returns {Promise<Object>} Datos del carrito con la reserva extendida.
 */
export const renovarReserva = async (carritoId) => {
  const response = await clienteApi.post(`/Carrito/renovar/${carritoId}`);
  return response.data?.data;
};

/**
 * Obtiene el listado de todos los carritos históricos y activos asociados al usuario autenticado.
 *
 * @returns {Promise<Array>} Listado de carritos encontrados.
 */
export const listarCarritos = async () => {
  const response = await clienteApi.get('/Carrito/listar');
  return response.data?.data || [];
};

/**
 * Procesa un pago manual (simulado) para actualizar el estado del carrito a PAGADO.
 * Esta función usa el endpoint de pago manual diseñado para desarrollo/pruebas.
 *
 * @param {number|string} carritoId - ID del carrito.
 * @returns {Promise<Object>} Datos del carrito actualizado.
 */
export const procesarPagoManual = async (carritoId) => {
  const response = await clienteApi.post(`/Carrito/pago-manual/${carritoId}`);
  return response.data?.data;
};

/**
 * Solicita la devolución de una compra pagada. Reembolsa el 85% del subtotal;
 * el 10% donado no es reembolsable.
 *
 * @param {number|string} carritoId - ID del carrito a devolver.
 * @param {Object} [options] - Opciones adicionales.
 * @param {string} [options.razon] - Motivo de la devolución (máx. 500 caracteres).
 * @returns {Promise<Object>} Datos de la devolución procesada.
 */
export const solicitarDevolucion = async (carritoId, { razon = '' } = {}) => {
  const response = await clienteApi.post(`/Carrito/devoluciones/${carritoId}`, {
    pedidoId: carritoId,
    razon,
  });
  return response.data?.data;
};

/**
 * Obtiene estadisticas de ventas (entradas vendidas e ingresos) para una lista de eventos.
 *
 * @param {Array<number|string>} eventoIds - IDs de los eventos a consultar.
 * @returns {Promise<Array>} Estadisticas por evento.
 */
export const obtenerEstadisticasEventos = async (eventoIds) => {
  const response = await clienteApi.post('/Carrito/estadisticas', { eventoIds });
  return response.data?.data || [];
};

export default {
  crearCarrito,
  obtenerCarrito,
  obtenerResumen,
  agregarEntrada,
  eliminarEntrada,
  actualizarCarrito,
  iniciarCheckout,
  renovarReserva,
  listarCarritos,
  procesarPagoManual,
  solicitarDevolucion,
  obtenerEstadisticasEventos,
};
