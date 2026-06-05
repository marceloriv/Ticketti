import { useCallback, useState } from 'react';
import api from '../services/api';

export const useCarrito = (carritoId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [carritoCreado, setCarritoCreado] = useState(null);

  const limpiarError = useCallback(() => setError(null), []);

  // ── POST /Carrito/crear ──────────────────────────────────────────────
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
  const obtenerResumen = useCallback(async () => {
    if (!carritoId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/Carrito/resumen/${carritoId}`);
      // respuesta envuelta en ApiRespuestaDto → { exito, mensaje, data }
      setResumen(response.data?.data || null);
      setCarritoCreado(null);
      return response.data?.data;
    } catch (err) {
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
  const agregarEntrada = useCallback(
    async (entradaData) => {
      if (!carritoId) return;

      setLoading(true);
      setError(null);
      try {
        const response = await api.post(
          `/Carrito/${carritoId}/entradas`,
          entradaData
        );
        // respuesta envuelta en ApiRespuestaDto
        await obtenerResumen();
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
