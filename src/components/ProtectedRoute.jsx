import { useAuth } from '@hooks/useAuth';
import { Navigate } from 'react-router-dom';

/**
 * Componente ProtectedRoute para rutas que requieren autenticación
 * @param {Object} props - Props del componente
 * @param {React.ReactElement} props.element - Elemento a renderizar si está autenticado
 * @param {string|null} props.requiredRole - Rol requerido (opcional)
 * @returns {React.ReactElement}
 */
export default function ProtectedRoute({ element, requiredRole = null }) {
  const { isAuthenticated, usuario } = useAuth();

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si se requiere un rol específico, validar
  if (requiredRole && usuario?.rol !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return element;
}
