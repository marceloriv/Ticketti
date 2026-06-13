import { createContext } from 'react';

/**
 * Contexto de React para la gestión del estado de autenticación y sesión de usuarios.
 * Permite acceder al token, datos del usuario, ID de su carrito y métodos de autenticación
 * en cualquier parte del árbol de componentes.
 * 
 * @type {React.Context<Object|null>}
 */
export const AuthContext = createContext(null);

