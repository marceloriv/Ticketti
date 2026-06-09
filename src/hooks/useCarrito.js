import api from '@api/api';
import { useCallback, useState } from 'react';

/**
 * Hook personalizado para gestionar el carrito de compras de usuarios autenticados.
 * Proporciona funciones para crear, obtener, actualizar y manipular carritos de compras.
 *
 * @param {number|null} carritoId - ID del carrito de compras (opcional)
 * @returns {Object} Objeto con las funciones y estado del carrito
 * @returns {Object} resumen - Resumen del carrito con items y totales
 * @returns {Object} carritoCreado - Carrito recién creado
 * @returns {boolean} loading - Indica si está cargando
 * @returns {string|null} error - Mensaje de error si existe
 * @returns {Function} limpiarError - Función para limpiar el error
 * @returns {Function} crearCarrito - Función para crear un nuevo carrito
 * @returns {Function} inicializarCarrito - Función para buscar o crear carrito activo
 * @returns {Function} obtenerCarrito - Función para obtener un carrito por ID
 * @returns {Function} obtenerResumen - Función para obtener el resumen del carrito
 * @returns {Function} agregarEntrada - Función para agregar una entrada al carrito
 * @returns {Function} eliminarEntrada - Función para eliminar una entrada del carrito
 * @returns {Function} actualizarCarrito - Función para actualizar el carrito
 * @returns {Function} iniciarCheckout - Función para iniciar el proceso de checkout
 * @returns {Function} renovarReserva - Función para renovar la reserva del carrito
 * @returns {Function} listarCarritos - Función para listar todos los carritos del usuario
 */
export const useCarrito = (initialCarritoId) => {
  /** Indica si una operación está en curso */
  const [loading, setLoading] = useState(false);
  /** Mensaje de error si existe */
  const [error, setError] = useState(null);
  /** Resumen del carrito con items y totales */
  const [resumen, setResumen] = useState(null);
  /** Carrito recién creado */
  const [carritoCreado, setCarritoCreado] = useState(null);
  /** ID del carrito actual */
  const [carritoId, setCarritoId] = useState(initialCarritoId);

  /**
   * Limpia el mensaje de error
   */
  const limpiarError = useCallback(() => setError(null), []);

  // ── POST /Carrito/crear ──────────────────────────────────────────────
  /**
   * Crea un nuevo carrito de compras
   *
   * @returns {Promise<Object>} Promesa que resuelve con el carrito creado
   * @throws {Error} Si hay un error al crear el carrito
   */
  const crearCarrito = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/Carrito/crear');
      const carrito = response.data?.data;
      return carrito;
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al crear carrito';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── GET /Carrito/obtener/{id} ─────────────────────────────────────────
  /**
   * Obtiene un carrito por su ID
   *
   * @param {number} id - ID del carrito a obtener
   * @returns {Promise<Object|null>} Promesa que resuelve con el carrito o null
   * @throws {Error} Si hay un error al obtener el carrito
   */
  const obtenerCarrito = useCallback(async (id) => {
    if (!id) return null;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/Carrito/obtener/${id}`);
      const carrito = response.data?.data;
      setCarritoCreado(carrito);
      return carrito;
    } catch {
      const msg = 'Error al obtener carrito';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── GET /Carrito/resumen/{id} ─────────────────────────────────────────
  /**
   * Obtiene el resumen del carrito actual con items y totales
   *
   * @returns {Promise<Object>} Promesa que resuelve con el resumen del carrito
   * @throws {Error} Si hay un error al obtener el resumen
   */
  const obtenerResumen = useCallback(async (targetCarritoId = null) => {
    const idCarrito = targetCarritoId || carritoId;
    if (!idCarrito) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/Carrito/resumen/${idCarrito}`);
      // respuesta envuelta en ApiRespuestaDto → { exito, mensaje, data }
      setResumen(response.data?.data || null);
      setCarritoCreado(null);
      return response.data?.data;
    } catch (err) {
      // Si el carrito no existe (404), crear uno nuevo
      if (err.response?.status === 404) {
        console.log('[Carrito] Carrito no encontrado, creando nuevo carrito');
        try {
          const responseCrear = await api.post('/Carrito/crear');
          const nuevoCarrito = responseCrear.data?.data;
          if (nuevoCarrito) {
            const nuevoId = nuevoCarrito?.idCarrito || nuevoCarrito?.id;
            setCarritoId(nuevoId);
            localStorage.setItem('carritoId', nuevoId);
            // Intentar obtener el resumen del nuevo carrito
            const response = await api.get(`/Carrito/resumen/${nuevoId}`);
            setResumen(response.data?.data || null);
            setCarritoCreado(null);
            return response.data?.data;
          }
        } catch (crearErr) {
          console.error('[Carrito] Error al crear nuevo carrito:', crearErr);
        }
      }
      const msg =
        err.response?.data?.mensaje ||
        err.response?.data?.message ||
        'Error al obtener resumen del carrito';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [carritoId]);

  // ── POST /Carrito/{id}/entradas ───────────────────────────────────────
  /**
   * Agrega una entrada al carrito
   *
   * @param {Object} entradaData - Datos de la entrada a agregar
   * @param {number} entradaData.eventoId - ID del evento
   * @param {string} entradaData.tipoEntrada - Tipo de entrada
   * @param {number} entradaData.cantidad - Cantidad de entradas
   * @param {number} entradaData.precioUnitario - Precio unitario
   * @param {number} targetCarritoId - ID del carrito (opcional, usa el estado interno si no se proporciona)
   * @returns {Promise<Object>} Promesa que resuelve con la entrada agregada
   * @throws {Error} Si hay un error al agregar la entrada
   */
  const agregarEntrada = useCallback(
    async (entradaData, targetCarritoId = null) => {
      const idCarrito = targetCarritoId || carritoId;
      if (!idCarrito) {
        throw new Error('No hay carrito disponible para agregar entradas');
      }

      setLoading(true);
      setError(null);
      try {
        const response = await api.post(
          `/Carrito/${idCarrito}/entradas`,
          entradaData
        );
        // respuesta envuelta en ApiRespuestaDto
        await obtenerResumen(idCarrito);
        return response.data?.data;
      } catch (err) {
        const msg =
          err.response?.data?.mensaje ||
          err.response?.data?.message ||
          'Error al agregar entrada al carrito';
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [carritoId, obtenerResumen]
  );

  // ── DELETE /Carrito/{id}/entradas/{detalleId} ──────────────────────────
  /**
   * Elimina una entrada del carrito
   *
   * @param {number} detalleId - ID del detalle de la entrada a eliminar
   * @returns {Promise<Object>} Promesa que resuelve con el resultado
   * @throws {Error} Si hay un error al eliminar la entrada
   */
  const eliminarEntrada = useCallback(
    async (detalleId) => {
      if (!carritoId) return;

      setLoading(true);
      setError(null);
      try {
        const response = await api.delete(
          `/Carrito/${carritoId}/entradas/${detalleId}`
        );
        // respuesta envuelta en ApiRespuestaDto
        await obtenerResumen();
        return response.data?.data;
      } catch (err) {
        const msg =
          err.response?.data?.mensaje ||
          err.response?.data?.message ||
          'Error al eliminar entrada del carrito';
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [carritoId, obtenerResumen]
  );

  // ── PUT /Carrito/actualizar/{id} ───────────────────────────────────────
  /**
   * Actualiza el carrito con nuevos datos
   *
   * @param {Object} entradaData - Datos para actualizar el carrito
   * @returns {Promise<Object>} Promesa que resuelve con el carrito actualizado
   * @throws {Error} Si hay un error al actualizar el carrito
   */
  const actualizarCarrito = useCallback(
    async (entradaData) => {
      if (!carritoId) return;

      setLoading(true);
      setError(null);
      try {
        const response = await api.put(
          `/Carrito/actualizar/${carritoId}`,
          entradaData
        );
        await obtenerResumen();
        return response.data?.data;
      } catch (err) {
        const msg =
          err.response?.data?.mensaje ||
          err.response?.data?.message ||
          'Error al actualizar el carrito';
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [carritoId, obtenerResumen]
  );

  // ── POST /Carrito/checkout/{id} ────────────────────────────────────────
  /**
   * Inicia el proceso de checkout del carrito
   *
   * @param {string|number} causaSocialId - ID de la causa social seleccionada
   * @returns {Promise<Object>} Promesa que resuelve con el resultado del checkout
   * @throws {Error} Si hay un error al iniciar el checkout
   */
  const iniciarCheckout = useCallback(
    async (causaSocialId) => {
      if (!carritoId) return;

      setLoading(true);
      setError(null);
      try {
        const idempotencyKey =
          'kilo-' +
          Date.now().toString(36) +
          Math.random().toString(36).substring(2, 10);
        const response = await api.post(
          `/Carrito/checkout/${carritoId}`,
          {
            causaSocialId: parseInt(causaSocialId, 10),
            idempotencyKey,
          }
        );
        return response.data?.data;
      } catch (err) {
        const msg =
          err.response?.data?.mensaje ||
          err.response?.data?.message ||
          'Error al iniciar checkout';
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [carritoId]
  );

  // ── POST /Carrito/renovar/{id} ─────────────────────────────────────────
  /**
   * Renueva la reserva del carrito para extender el tiempo de reserva
   *
   * @returns {Promise<Object>} Promesa que resuelve con el resultado de la renovación
   * @throws {Error} Si hay un error al renovar la reserva
   */
  const renovarReserva = useCallback(async () => {
    if (!carritoId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/Carrito/renovar/${carritoId}`);
      await obtenerResumen();
      return response.data?.data;
    } catch (err) {
      const msg =
        err.response?.data?.mensaje ||
        err.response?.data?.message ||
        'Error al renovar reserva';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [carritoId, obtenerResumen]);

  // ── GET /Carrito/listar ────────────────────────────────────────────────
  /**
   * Lista todos los carritos del usuario autenticado
   *
   * @returns {Promise<Array>} Promesa que resuelve con la lista de carritos
   * @throws {Error} Si hay un error al listar los carritos
   */
  const listarCarritos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/Carrito/listar');
      return response.data?.data || [];
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al listar carritos';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Buscar carrito activo del usuario, o crear uno nuevo ───────────────
  /**
   * Busca un carrito activo (estado CREADO) del usuario o crea uno nuevo
   *
   * @returns {Promise<Object>} Promesa que resuelve con { carritoId, carrito }
   * @throws {Error} Si hay un error al buscar o crear el carrito
   */
  const inicializarCarrito = useCallback(async () => {
    // 1. Intentar listar y buscar un carrito en estado CREADO
    try {
      const existentes = await listarCarritos();
      const activo = existentes.find(
        (c) => (c.estadoCarrito || c.estado) === 'CREADO'
      );
      if (activo?.idCarrito || activo?.id) {
        const id = activo.idCarrito || activo.id;
        return { carritoId: id, carrito: activo };
      }
    } catch {
      // silecioso — intentamos crear
    }

    // 2. No hay carrito activo → crear uno nuevo
    try {
      const nuevo = await crearCarrito();
      if (!nuevo) return { carritoId: null, carrito: null };
      const id = nuevo?.idCarrito || nuevo?.id;
      return { carritoId: id || null, carrito: nuevo };
    } catch {
      return { carritoId: null, carrito: null };
    }
  }, [crearCarrito, listarCarritos]);

  return {
    carritoId,
    setCarritoId,
    resumen,
    carritoCreado,
    loading,
    error,
    limpiarError,
    crearCarrito,
    inicializarCarrito,
    obtenerCarrito,
    obtenerResumen,
    agregarEntrada,
    eliminarEntrada,
    actualizarCarrito,
    iniciarCheckout,
    renovarReserva,
    listarCarritos,
  };
};

export default useCarrito;
