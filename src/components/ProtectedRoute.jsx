import { useAuth } from '@hooks/useAuth';
import { Navigate } from 'react-router-dom';

/**
 * Componente ProtectedRoute para rutas que requieren autenticación
 */
export default function ProtectedRoute({ element, requiredRole = null }) {
  const { isAuthenticated } = useAuth();

  const obtenerRolDesdeToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.rol;
    } catch {
      return null;
    }
  };

  const token = localStorage.getItem('token');
  const rol = obtenerRolDesdeToken(token);

  // Si no está autenticado o no hay token, redirigir a login
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  // Si se requiere un rol específico y no coincide, mandarlo al home
  if (requiredRole && rol !== requiredRole) {
    return <Navigate to="/home" replace />;
  }

  return element;
}
