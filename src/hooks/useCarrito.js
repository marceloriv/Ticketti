import { useCallback, useEffect, useState } from 'react';
import carritoApi from '../api/carritoApi';
import logger from '../utils/logger';

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
    setActiveCarritoId(carritoId);
    if (!carritoId) {
      setResumen(null);
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
   * Si existe un carrito de invitado en localStorage, fusiona sus items con el carrito autenticado.
   *
   * @returns {Promise<Object>} Estructura conteniendo { carritoId, carrito }.
   */
  const inicializarCarrito = useCallback(async () => {
    let targetId = null;
    let targetCarrito = null;

    try {
      const existentes = await listarCarritos();
      const activo = Array.isArray(existentes)
        ? existentes.find((c) => (c.estadoCarrito || c.estado) === 'CREADO')
        : null;
      if (activo?.idCarrito || activo?.id) {
        targetId = activo.idCarrito || activo.id;
        targetCarrito = activo;
      }
    } catch (e) {
      logger.warn(
        '[Carrito] No se pudo recuperar carritos existentes:',
        e.message || e
      );
    }

    if (!targetId) {
      try {
        const nuevo = await crearCarrito();
        if (nuevo) {
          targetId = nuevo?.idCarrito || nuevo?.id;
          targetCarrito = nuevo;
        }
      } catch (e) {
        logger.error(
          '[Carrito] Error al crear nuevo carrito de compras:',
          e.message || e
        );
      }
    }

    if (targetId) {
      setActiveCarritoId(targetId);

      // Fusionar carrito de invitado si existe
      try {
        const savedGuest = localStorage.getItem('guestCart');
        if (savedGuest) {
          const guestItems = JSON.parse(savedGuest);
          if (Array.isArray(guestItems) && guestItems.length > 0) {
            logger.log('[Carrito] Fusionando carrito de invitado en carrito autenticado:', targetId);
            for (const item of guestItems) {
              try {
                await carritoApi.agregarEntrada(targetId, {
                  eventoId: item.eventoId || item.idEvento,
                  tipoEntrada: item.tipoEntrada || 'General',
                  cantidad: item.cantidad || 1,
                  precioUnitario: item.precioUnitario || 0,
                });
              } catch (addErr) {
                logger.error('[Carrito] Error migrando item invitado:', addErr);
              }
            }
            localStorage.removeItem('guestCart');
          }
        }
      } catch (mergeErr) {
        logger.error('[Carrito] Error leyendo guestCart para fusión:', mergeErr);
      }

      return { carritoId: targetId, carrito: targetCarrito };
    }

    return { carritoId: null, carrito: null };
  }, [crearCarrito, listarCarritos]);

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
        const generarUUID = () => {
          if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
          }
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });
        };
        const idempotencyKey = generarUUID();

        const datos = await carritoApi.iniciarCheckout(targetId, {
          causaSocialId,
          idempotencyKey,
        });

        // El pago se procesa automáticamente en el backend durante el checkout
        // No es necesario llamar al pago manual desde el frontend

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
