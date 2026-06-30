import clienteApi from './clienteApi';

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
export const getOrganizacionesActivas = async (options = {}) => {
  const { data } = await clienteApi.get('/organizaciones', options);
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

  // No fijar Content-Type a mano: axios necesita generar el boundary del
  // multipart automáticamente al detectar un FormData. Si se fuerza el
  // header aquí, se pierde el boundary y el backend no puede parsear el
  // archivo (org.springframework.web.multipart.MultipartException).
  const { data } = await clienteApi.post(
    `/organizaciones/${idOrganizacion}/documento`,
    formData
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
export const getCausasActivas = async (options = {}) => {
  const { data } = await clienteApi.get('/causas/activas', options);
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

/**
 * [ORGANIZADOR] Sube el documento de respaldo (PDF) de una causa social
 * recién creada, para validación. No se persiste en disco: el backend lo
 * reenvía por correo al equipo Ticketti, que lo revisa y luego activa la
 * causa con activarCausa().
 *
 * @param {number|string} idCausa - ID de la causa.
 * @param {File} archivo - Archivo PDF de respaldo.
 * @param {string} nombreOrganizador - Nombre de quien sube el documento.
 * @returns {Promise<Object>} Causa actualizada (documentoEnviado: true).
 */
export const subirDocumentoCausa = async (idCausa, archivo, nombreOrganizador) => {
  const formData = new FormData();
  formData.append('archivo', archivo);
  formData.append('nombreOrganizador', nombreOrganizador);

  // No fijar Content-Type a mano: axios necesita generar el boundary del
  // multipart automáticamente al detectar un FormData. Si se fuerza el
  // header aquí, se pierde el boundary y el backend no puede parsear el
  // archivo (org.springframework.web.multipart.MultipartException).
  const { data } = await clienteApi.post(
    `/causas/${idCausa}/documento`,
    formData
  );
  return data;
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
 * Obtiene el historial de donaciones del usuario autenticado
 * (idUsuario extraído del JWT en el backend).
 *
 * @returns {Promise<Array>} Listado de donaciones del usuario.
 */
export const getMisDonaciones = async (options = {}) => {
  const { data } = await clienteApi.get('/donaciones/me', options);
  return data;
};

/**
 * Obtiene TODAS las causas sociales (incluyendo PENDIENTE), para que
 * el admin pueda revisarlas/activarlas igual que con organizaciones.
 *
 * @returns {Promise<Array>} Listado completo de causas.
 */
export const getCausas = async () => {
  const { data } = await clienteApi.get('/causas/todas');
  return data;
};

/**
 * [ADMIN] Activa una causa social PENDIENTE, tras revisar (por correo)
 * el documento de respaldo enviado por el organizador.
 *
 * @param {number|string} idCausa - ID de la causa.
 * @returns {Promise<Object>} Causa con estado ACTIVA.
 */
export const activarCausa = async (idCausa) => {
  const { data } = await clienteApi.put(`/causas/${idCausa}/activar`);
  return data;
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
 * Como el admin la crea y revisa por su cuenta, no pasa por el flujo de
 * documento de respaldo del organizador (CausaSocialController.crear()
 * siempre la deja PENDIENTE; aquí se activa a continuación sin exigir
 * documento, igual que crearOrganizacionActiva con organizaciones).
 *
 * Encadena dos endpoints que YA EXISTEN en MS-Donaciones:
 *   1. POST /causas               -> crea (queda PENDIENTE)
 *   2. PUT  /causas/{id}/activar  -> pasa a ACTIVA
 *
 * @param {Object} payload - { idOrganizacion, nombre, descripcion, objetivoMonto, fechaInicio }
 * @returns {Promise<Object>} Causa creada y ya activada.
 */
export const crearCausaActiva = async (payload) => {
  const nueva = await crearCausa(payload);
  return activarCausa(nueva.idCausa);
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
  subirDocumentoCausa,
  getTotalPorOrganizacion,
  getMisDonaciones,
  getCausas,
  activarCausa,
  crearOrganizacionActiva,
  crearCausaActiva,
  solicitarRegistroOrganizacion,
};
