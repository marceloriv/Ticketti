import { useCallback, useEffect, useState } from 'react';
import carritoApi from '../api/carritoApi';

/**
 * Hook personalizado para gestionar el carrito de compras de usuarios autenticados.
 * Proporciona funciones y estados reactivos para interactuar con el microservicio de carrito del backend.
 *
 * @param {number|null} carritoId - Identificador único del carrito de compras (opcional).
 * @returns {Object} Estados y funciones para la administración del carrito.
 * @returns {Object|null} resumen - Resumen consolidado del carrito (ítems, totales, causas).
 * @returns {Object|null} carritoCreado - Objeto del carrito cuando se crea un nuevo registro.
 * @returns {boolean} loading - Indica si hay una operación asíncrona en curso.
 * @returns {string|null} error - Mensaje descriptivo si ocurre algún error durante las peticiones.
 * @returns {Function} limpiarError - Restablece el estado del mensaje de error a null.
 * @returns {Function} crearCarrito - Crea un nuevo registro de carrito de compras en el backend.
 * @returns {Function} inicializarCarrito - Busca un carrito activo en estado 'CREADO' o inicia uno nuevo.
 * @returns {Function} obtenerCarrito - Obtiene el detalle técnico de un carrito por su ID.
 * @returns {Function} obtenerResumen - Actualiza y obtiene los montos y productos del carrito.
 * @returns {Function} agregarEntrada - Añade entradas de un evento específico al carrito.
 * @returns {Function} eliminarEntrada - Remueve un ítem del desglose del carrito.
 * @returns {Function} actualizarCarrito - Modifica la información general de la compra en el carrito.
 * @returns {Function} iniciarCheckout - Inicia el flujo de pago asociándolo a una causa social.
 * @returns {Function} renovarReserva - Extiende la vigencia del bloqueo temporal de las entradas.
 * @returns {Function} listarCarritos - Retorna todos los carritos históricos del cliente autenticado.
 */
export const useCarrito = (carritoId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [carritoCreado, setCarritoCreado] = useState(null);
  const [activeCarritoId, setActiveCarritoId] = useState(carritoId);

  // Sincronizar el ID del carrito si cambia el parámetro inicial del hook
  useEffect(() => {
    if (carritoId) {
      setActiveCarritoId(carritoId);
    }
  }, [carritoId]);

  /**
   * Limpia el mensaje de error activo en el estado.
   */
  const limpiarError = useCallback(() => setError(null), []);

  /**
   * Crea un nuevo carrito en el backend.
   *
   * @returns {Promise<Object>} Datos del carrito creado.
   */
  const crearCarrito = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const carrito = await carritoApi.crearCarrito();
      return carrito;
    } catch (err) {
      const msg =
        err.response?.data?.mensaje || err.message || 'Error al crear carrito';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene la estructura técnica del carrito por su ID.
   *
   * @param {number|string} id - ID del carrito.
   * @returns {Promise<Object|null>} Carrito obtenido o null.
   */
  const obtenerCarrito = useCallback(async (id) => {
    if (!id) return null;
    setLoading(true);
    setError(null);
    try {
      const carrito = await carritoApi.obtenerCarrito(id);
      setCarritoCreado(carrito);
      setActiveCarritoId(id);
      return carrito;
    } catch (err) {
      const msg =
        err.response?.data?.mensaje ||
        err.message ||
        'Error al obtener carrito';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene el resumen de montos y totales del carrito activo.
   *
   * @param {number|string} [alternateCarritoId] - ID de carrito alternativo para el flujo de inicialización.
   * @returns {Promise<Object>} Resumen del carrito.
   */
  const obtenerResumen = useCallback(async (alternateCarritoId) => {
    const targetId = alternateCarritoId || activeCarritoId;
    if (!targetId) return;
    setLoading(true);
    setError(null);
    try {
      const datos = await carritoApi.obtenerResumen(targetId);
      setResumen(datos || null);
      setCarritoCreado(null);
      return datos;
    } catch (err) {
      const msg =
        err.response?.data?.mensaje ||
        err.response?.data?.message ||
        err.message ||
        'Error al obtener resumen del carrito';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [activeCarritoId]);

  /**
   * Agrega una entrada al carrito activo.
   *
   * @param {Object} entradaData - Estructura de la entrada (eventoId, tipo, cantidad, precio).
   * @param {number|string} [alternateCarritoId] - ID de carrito alternativo.
   * @returns {Promise<Object>} Respuesta del servidor.
   */
  const agregarEntrada = useCallback(
    async (entradaData, alternateCarritoId) => {
      const targetId = alternateCarritoId || activeCarritoId;
      if (!targetId) {
        const errorMsg = 'No hay un ID de carrito activo para agregar entradas.';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
      setLoading(true);
      setError(null);
      try {
        const datos = await carritoApi.agregarEntrada(targetId, entradaData);
        await obtenerResumen(targetId);
        return datos;
      } catch (err) {
        const msg =
          err.response?.data?.mensaje ||
          err.response?.data?.message ||
          err.message ||
          'Error al agregar entrada al carrito';
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [activeCarritoId, obtenerResumen]
  );

  /**
   * Elimina un ítem específico del desglose del carrito activo.
   *
   * @param {number|string} detalleId - ID de detalle del ítem.
   * @param {number|string} [alternateCarritoId] - ID de carrito alternativo.
   * @returns {Promise<Object>} Respuesta del servidor.
   */
  const eliminarEntrada = useCallback(
    async (detalleId, alternateCarritoId) => {
      const targetId = alternateCarritoId || activeCarritoId;
      if (!targetId) return;
      setLoading(true);
      setError(null);
      try {
        const datos = await carritoApi.eliminarEntrada(targetId, detalleId);
        await obtenerResumen(targetId);
        return datos;
      } catch (err) {
        const msg =
          err.response?.data?.mensaje ||
          err.response?.data?.message ||
          err.message ||
          'Error al eliminar entrada del carrito';
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [activeCarritoId, obtenerResumen]
  );

  /**
   * Actualiza la información o estado general del carrito activo.
   *
   * @param {Object} entradaData - Datos a actualizar.
   * @param {number|string} [alternateCarritoId] - ID de carrito alternativo.
   * @returns {Promise<Object>} Carrito actualizado.
   */
  const actualizarCarrito = useCallback(
    async (entradaData, alternateCarritoId) => {
      const targetId = alternateCarritoId || activeCarritoId;
      if (!targetId) return;
      setLoading(true);
      setError(null);
      try {
        const datos = await carritoApi.actualizarCarrito(
          targetId,
          entradaData
        );
        await obtenerResumen(targetId);
        return datos;
      } catch (err) {
        const msg =
          err.response?.data?.mensaje ||
          err.response?.data?.message ||
          err.message ||
          'Error al actualizar el carrito';
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [activeCarritoId, obtenerResumen]
  );

  /**
   * Inicia el flujo de checkout vinculando la compra a una causa social.
   *
   * @param {number|string} causaSocialId - ID de la causa social seleccionada.
   * @param {number|string} [alternateCarritoId] - ID de carrito alternativo.
   * @returns {Promise<Object>} Transacción o respuesta de checkout iniciada.
   */
  const iniciarCheckout = useCallback(
    async (causaSocialId, alternateCarritoId) => {
      const targetId = alternateCarritoId || activeCarritoId;
      if (!targetId) return;
      setLoading(true);
      setError(null);
      try {
        const idempotencyKey =
          'kilo-' +
          Date.now().toString(36) +
          Math.random().toString(36).substring(2, 10);

        const datos = await carritoApi.iniciarCheckout(targetId, {
          causaSocialId,
          idempotencyKey,
        });
        return datos;
      } catch (err) {
        const msg =
          err.response?.data?.mensaje ||
          err.response?.data?.message ||
          err.message ||
          'Error al iniciar checkout';
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [activeCarritoId]
  );

  /**
   * Renueva el bloqueo temporal de entradas (reserva) del carrito activo.
   *
   * @param {number|string} [alternateCarritoId] - ID de carrito alternativo.
   * @returns {Promise<Object>} Datos actualizados.
   */
  const renovarReserva = useCallback(async (alternateCarritoId) => {
    const targetId = alternateCarritoId || activeCarritoId;
    if (!targetId) return;
    setLoading(true);
    setError(null);
    try {
      const datos = await carritoApi.renovarReserva(targetId);
      await obtenerResumen(targetId);
      return datos;
    } catch (err) {
      const msg =
        err.response?.data?.mensaje ||
        err.response?.data?.message ||
        err.message ||
        'Error al renovar reserva';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [activeCarritoId, obtenerResumen]);

  /**
   * Lista todos los carritos asociados al usuario.
   *
   * @returns {Promise<Array>} Listado de carritos.
   */
  const listarCarritos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const datos = await carritoApi.listarCarritos();
      return datos;
    } catch (err) {
      const msg =
        err.response?.data?.mensaje ||
        err.message ||
        'Error al listar carritos';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Busca un carrito activo en estado 'CREADO' del usuario o crea uno nuevo en su lugar.
   *
   * @returns {Promise<Object>} Estructura conteniendo { carritoId, carrito }.
   */
  const inicializarCarrito = useCallback(async () => {
    try {
      const existentes = await listarCarritos();
      const activo = existentes.find(
        (c) => (c.estadoCarrito || c.estado) === 'CREADO'
      );
      if (activo?.idCarrito || activo?.id) {
        const id = activo.idCarrito || activo.id;
        setActiveCarritoId(id);
        return { carritoId: id, carrito: activo };
      }
    } catch (e) {
      console.warn(
        '[Carrito] No se pudo recuperar carritos existentes:',
        e.message || e
      );
    }

    try {
      const nuevo = await crearCarrito();
      if (!nuevo) return { carritoId: null, carrito: null };
      const id = nuevo?.idCarrito || nuevo?.id;
      setActiveCarritoId(id);
      return { carritoId: id || null, carrito: nuevo };
    } catch (e) {
      console.error(
        '[Carrito] Error al crear nuevo carrito de compras:',
        e.message || e
      );
      return { carritoId: null, carrito: null };
    }
  }, [crearCarrito, listarCarritos]);

  return {
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
