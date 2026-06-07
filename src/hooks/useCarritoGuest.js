import { useCallback, useState } from 'react';

/**
 * Clave utilizada para almacenar el carrito de invitado en localStorage
 */
const GUEST_CART_KEY = 'guestCart';

/**
 * Hook personalizado para gestionar el carrito de compras de usuarios no autenticados.
 * Utiliza localStorage para persistir el carrito entre sesiones del navegador.
 *
 * @returns {Object} Objeto con las funciones y estado del carrito de invitado
 * @returns {Array} cart - Array de entradas en el carrito
 * @returns {Function} agregarEntrada - Función para agregar una entrada al carrito
 * @returns {Function} eliminarEntrada - Función para eliminar una entrada del carrito
 * @returns {Function} actualizarCantidad - Función para actualizar la cantidad de una entrada
 * @returns {Function} limpiarCarrito - Función para limpiar todo el carrito
 * @returns {number} subtotal - Subtotal de las entradas (sin donación)
 * @returns {number} donacion - Monto de donación (10% del subtotal)
 * @returns {number} total - Total a pagar (subtotal + donación)
 * @returns {number} totalEntradas - Cantidad total de entradas en el carrito
 * @returns {boolean} isEmpty - Indica si el carrito está vacío
 */
export const useCarritoGuest = () => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(GUEST_CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  /**
   * Guarda el carrito en localStorage
   * @param {Array} newCart - Nuevo estado del carrito a guardar
   */
  const saveCart = useCallback((newCart) => {
    setCart(newCart);
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newCart));
  }, []);

  /**
   * Agrega una entrada al carrito de invitado
   * Si la entrada ya existe, actualiza la cantidad (máximo 4 por evento)
   *
   * @param {Object} entrada - Objeto con los datos de la entrada
   * @param {number} entrada.eventoId - ID del evento
   * @param {string} entrada.tipoEntrada - Tipo de entrada (ej: "General")
   * @param {number} entrada.cantidad - Cantidad de entradas a agregar
   * @param {number} entrada.precioUnitario - Precio unitario de la entrada
   * @param {string} [entrada.eventoNombre] - Nombre del evento (opcional)
   * @throws {Error} Si se intenta agregar más de 4 entradas del mismo evento
   */
  const agregarEntrada = useCallback((entrada) => {
    const newCart = [...cart];
    const existingIndex = newCart.findIndex(
      (item) => item.eventoId === entrada.eventoId
    );

    if (existingIndex >= 0) {
      // Actualizar cantidad si ya existe
      const newCantidad = newCart[existingIndex].cantidad + entrada.cantidad;
      if (newCantidad > 4) {
        throw new Error('Máximo 4 entradas por compra');
      }
      newCart[existingIndex].cantidad = newCantidad;
    } else {
      // Agregar nueva entrada
      if (entrada.cantidad > 4) {
        throw new Error('Máximo 4 entradas por compra');
      }
      newCart.push(entrada);
    }

    saveCart(newCart);
  }, [cart, saveCart]);

  /**
   * Elimina una entrada del carrito de invitado
   *
   * @param {number} eventoId - ID del evento cuya entrada se desea eliminar
   */
  const eliminarEntrada = useCallback((eventoId) => {
    const newCart = cart.filter((item) => item.eventoId !== eventoId);
    saveCart(newCart);
  }, [cart, saveCart]);

  /**
   * Actualiza la cantidad de una entrada específica en el carrito
   *
   * @param {number} eventoId - ID del evento cuya cantidad se desea actualizar
   * @param {number} cantidad - Nueva cantidad (debe ser entre 1 y 4)
   * @throws {Error} Si la cantidad no está entre 1 y 4
   */
  const actualizarCantidad = useCallback((eventoId, cantidad) => {
    if (cantidad < 1 || cantidad > 4) {
      throw new Error('Cantidad debe ser entre 1 y 4');
    }

    const newCart = cart.map((item) =>
      item.eventoId === eventoId ? { ...item, cantidad } : item
    );
    saveCart(newCart);
  }, [cart, saveCart]);

  /**
   * Limpia completamente el carrito de invitado
   */
  const limpiarCarrito = useCallback(() => {
    saveCart([]);
  }, [saveCart]);

  const totalEntradas = cart.reduce((sum, item) => sum + item.cantidad, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
  const donacion = subtotal * 0.1;
  const total = subtotal + donacion;

  return {
    cart,
    agregarEntrada,
    eliminarEntrada,
    actualizarCantidad,
    limpiarCarrito,
    totalEntradas,
    subtotal,
    donacion,
    total,
    isEmpty: cart.length === 0,
  };
};

export default useCarritoGuest;
