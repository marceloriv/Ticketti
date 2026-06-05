import { AuthContext } from '@contexts/auth';
import { useContext } from 'react';

/**
 * Hook personalizado para acceder al contexto de autenticación
 * @returns {Object} Objeto con funciones de autenticación y estado
 * @throws {Error} Si se usa fuera de un AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
