import clienteApi from './clienteApi';
import logger from '../utils/logger';

/**
 * Módulo de API para el microservicio MS-Donaciones (puerto 8004).
 * Las rutas son relativas a /api/v1 (baseURL configurado en clienteApi),
 * y pasan por BFF -> API Gateway -> ms-donaciones.
 */

// ─────────────────────────────────────────────
// ORGANIZACIONES
// ─────────────────────────────────────────────

/**
 * Obtiene el listado completo de organizaciones (todos los estados:
 * ACTIVA, PENDIENTE, INACTIVA). Usado en el panel de Admin, donde
 * se necesita ver también las PENDIENTE para poder activarlas.
 *
 * @returns {Promise<Array>} Listado de organizaciones.
 */
export const getOrganizaciones = async () => {
  const { data } = await clienteApi.get('/organizaciones/todas');
  return data;
};

/**
 * Obtiene solo las organizaciones en estado ACTIVA.
 * Útil para vistas públicas (ej. selector de organización al donar).
 *
 * @returns {Promise<Array>} Listado de organizaciones activas.
 */
export const getOrganizacionesActivas = async () => {
  const { data } = await clienteApi.get('/organizaciones');
  return data;
};

/**
 * Obtiene el detalle de una organización por su ID.
 *
 * @param {number|string} idOrganizacion - ID de la organización.
 * @returns {Promise<Object>} Datos de la organización.
 */
export const getOrganizacionPorId = async (idOrganizacion) => {
  const { data } = await clienteApi.get(`/organizaciones/${idOrganizacion}`);
  return data;
};

/**
 * Registra una nueva organización con datos básicos (queda en estado
 * PENDIENTE). Los datos bancarios NO se incluyen aquí: se completan
 * después mediante activarOrganizacion().
 *
 * @param {Object} payload - { nombre, rut, email, telefono, direccion }
 * @returns {Promise<Object>} Organización creada (estado PENDIENTE).
 */
export const crearOrganizacion = async (payload) => {
  const { data } = await clienteApi.post('/organizaciones', payload);
  return data;
};

/**
 * Edita los datos básicos de una organización existente.
 *
 * @param {number|string} idOrganizacion - ID de la organización.
 * @param {Object} payload - Campos a actualizar.
 * @returns {Promise<Object>} Organización actualizada.
 */
export const editarOrganizacion = async (idOrganizacion, payload) => {
  const { data } = await clienteApi.put(`/organizaciones/${idOrganizacion}`, payload);
  return data;
};

/**
 * Activa una organización PENDIENTE, completando sus datos bancarios.
 * Solo accesible para rol ADMINPLATAFORMA.
 * Corresponde a ActivarOrganizacionDTO en el backend.
 *
 * @param {number|string} idOrganizacion - ID de la organización.
 * @param {Object} datosBancarios - { banco, tipoCuenta, numeroCuenta, titularCuenta, rutTitular, metodoPagoPreferido }
 * @returns {Promise<Object>} Organización con estado ACTIVA.
 */
export const activarOrganizacion = async (idOrganizacion, datosBancarios) => {
  const { data } = await clienteApi.put(
    `/organizaciones/${idOrganizacion}/activar`,
    datosBancarios
  );
  return data;
};

/**
 * Elimina una organización.
 *
 * @param {number|string} idOrganizacion - ID de la organización.
 * @returns {Promise<void>}
 */
export const eliminarOrganizacion = async (idOrganizacion) => {
  await clienteApi.delete(`/organizaciones/${idOrganizacion}`);
};

/**
 * Sube el documento de convenio (PDF) de una organización.
 *
 * @param {number|string} idOrganizacion - ID de la organización.
 * @param {File} archivo - Archivo PDF del convenio.
 * @returns {Promise<Object>} Organización actualizada con documentoConvenio.
 */
export const subirDocumentoOrganizacion = async (idOrganizacion, archivo) => {
  const formData = new FormData();
  formData.append('archivo', archivo);

  const { data } = await clienteApi.post(
    `/organizaciones/${idOrganizacion}/documento`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
};

// ─────────────────────────────────────────────
// CAUSAS SOCIALES
// ─────────────────────────────────────────────

/**
 * Obtiene el listado de causas sociales activas.
 *
 * @returns {Promise<Array>} Listado de causas activas.
 */
export const getCausasActivas = async () => {
  const { data } = await clienteApi.get('/causas/activas');
  return data;
};

/**
 * Obtiene las causas sociales asociadas a una organización.
 *
 * @param {number|string} idOrganizacion - ID de la organización.
 * @returns {Promise<Array>} Listado de causas de esa organización.
 */
export const getCausasPorOrganizacion = async (idOrganizacion) => {
  const { data } = await clienteApi.get(`/causas/organizacion/${idOrganizacion}`);
  return data;
};

/**
 * Registra una nueva causa social vinculada a una organización.
 *
 * @param {Object} payload - { idOrganizacion, nombre, descripcion, objetivoMonto, fechaInicio }
 * @returns {Promise<Object>} Causa creada.
 */
export const crearCausa = async (payload) => {
  const { data } = await clienteApi.post('/causas', payload);
  return data;
};

/**
 * Elimina (desactiva) una causa social.
 *
 * @param {number|string} idCausa - ID de la causa.
 * @returns {Promise<void>}
 */
export const eliminarCausa = async (idCausa) => {
  await clienteApi.delete(`/causas/${idCausa}`);
};

// ─────────────────────────────────────────────
// PENDIENTES — endpoints que aún NO existen en MS-Donaciones
// Se dejan como stubs documentados para que el frontend ya esté
// "enchufado" cuando el backend los implemente. Cambiar solo el
// cuerpo de la función, no su firma, para no romper los componentes.
// ─────────────────────────────────────────────

/**
 * Obtiene el monto total donado a una organización.
 *
 * @param {number|string} idOrganizacion - ID de la organización.
 * @returns {Promise<number>} Monto acumulado en donaciones aprobadas.
 */
export const getTotalPorOrganizacion = async (idOrganizacion) => {
  const { data } = await clienteApi.get(`/donaciones/total/organizacion/${idOrganizacion}`);
  return data;
};

/**
 * Obtiene el historial de donaciones del usuario autenticado.
 * El backend extrae el userId directamente del JWT en el header Authorization.
 *
 * @returns {Promise<Array>} Listado de donaciones del usuario.
 */
export const getMisDonaciones = async () => {
  const { data } = await clienteApi.get('/donaciones/me');
  return data;
};

/**
 * Obtiene TODAS las causas sociales (incluyendo PENDIENTE), para que
 * el admin pueda revisarlas/activarlas igual que con organizaciones.
 *
 * ⚠️ PENDIENTE BACKEND: CausaSocialController hoy solo expone /activas.
 * Cuando exista GET /causas (todas), reemplazar por:
 *   const { data } = await clienteApi.get('/causas');
 *   return data;
 *
 * @returns {Promise<Array>} Por ahora devuelve solo las activas.
 */
export const getCausas = async () => {
  return getCausasActivas();
};

/**
 * Activa una causa social PENDIENTE.
 *
 * ⚠️ PENDIENTE BACKEND: no existe aún PUT /causas/{id}/activar.
 * Cuando exista, reemplazar por:
 *   const { data } = await clienteApi.put(`/causas/${idCausa}/activar`);
 *   return data;
 *
 * @param {number|string} _idCausa - ID de la causa.
 * @returns {Promise<null>} No hace nada mientras no exista el endpoint.
 */
export const activarCausa = async (_idCausa) => {
  logger.warn('[donacionesApi] activarCausa: endpoint aún no implementado en MS-Donaciones');
  return null;
};

// ─────────────────────────────────────────────
// FLUJOS COMPUESTOS (encadenan endpoints existentes)
// ─────────────────────────────────────────────

/**
 * [ADMIN] Crea una organización "desde cero" y la activa de inmediato,
 * completando también sus datos bancarios.
 *
 * Encadena dos endpoints que YA EXISTEN en MS-Donaciones:
 *   1. POST /organizaciones                 -> crea con datos básicos (queda PENDIENTE)
 *   2. PUT  /organizaciones/{id}/activar     -> completa datos bancarios (pasa a ACTIVA)
 *
 * No requiere cambios en el backend.
 *
 * @param {Object} datosBasicos - { nombre, rut, email, telefono, direccion }
 * @param {Object} datosBancarios - { banco, tipoCuenta, numeroCuenta, titularCuenta, rutTitular, metodoPago }
 * @returns {Promise<Object>} Organización creada y ya activada.
 */
export const crearOrganizacionActiva = async (datosBasicos, datosBancarios) => {
  const nueva = await crearOrganizacion(datosBasicos);
  return activarOrganizacion(nueva.idOrganizacion, datosBancarios);
};

/**
 * [ADMIN] Crea una causa social "desde cero" y la deja ACTIVA de inmediato.
 *
 * ⚠️ PENDIENTE VERIFICAR BACKEND: se envía `estado: 'ACTIVA'` en el payload,
 * pero hoy no está confirmado si CausaSocialController.crear() respeta ese
 * campo o si siempre asigna un estado por defecto (ej. PENDIENTE). Si lo
 * ignora, esta causa quedará en el estado que el backend determine y
 * habrá que pedir a Marcelo/equipo MS-Donaciones que:
 *   a) respete `estado` cuando lo envía un ADMINPLATAFORMA, o
 *   b) agregue un endpoint PUT /causas/{id}/activar análogo al de organizaciones.
 *
 * @param {Object} payload - { idOrganizacion, nombre, descripcion, objetivoMonto, fechaInicio }
 * @returns {Promise<Object>} Causa creada.
 */
export const crearCausaActiva = async (payload) => {
  const { data } = await clienteApi.post('/causas', { ...payload, estado: 'ACTIVA' });
  return data;
};

/**
 * [ORGANIZADOR] Flujo de alta de una nueva organización: crea la
 * organización (datos básicos), crea su causa social asociada, y sube
 * el documento de convenio. Ambas quedan en el estado por defecto del
 * backend (organización: PENDIENTE) hasta que el admin la active.
 *
 * Encadena tres endpoints que YA EXISTEN en MS-Donaciones:
 *   1. POST /organizaciones
 *   2. POST /causas
 *   3. POST /organizaciones/{id}/documento
 *
 * @param {Object} datosOrganizacion - { nombre, rut, email, telefono, direccion }
 * @param {Object} datosCausa - { nombre, descripcion, objetivoMonto, fechaInicio }
 * @param {File} documento - Archivo PDF del convenio.
 * @returns {Promise<{organizacion: Object, causa: Object}>}
 */
export const solicitarRegistroOrganizacion = async (datosOrganizacion, datosCausa, documento) => {
  const organizacion = await crearOrganizacion(datosOrganizacion);
  const causa = await crearCausa({
    ...datosCausa,
    idOrganizacion: organizacion.idOrganizacion,
  });
  await subirDocumentoOrganizacion(organizacion.idOrganizacion, documento);
  return { organizacion, causa };
};


export default {
  getOrganizaciones,
  getOrganizacionesActivas,
  getOrganizacionPorId,
  crearOrganizacion,
  editarOrganizacion,
  activarOrganizacion,
  eliminarOrganizacion,
  subirDocumentoOrganizacion,
  getCausasActivas,
  getCausasPorOrganizacion,
  crearCausa,
  eliminarCausa,
  getTotalPorOrganizacion,
  getMisDonaciones,
  getCausas,
  activarCausa,
  crearOrganizacionActiva,
  crearCausaActiva,
  solicitarRegistroOrganizacion,
};
