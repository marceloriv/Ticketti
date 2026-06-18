import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@utils/routes';
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
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Definir la jerarquía de roles en el frontend
  const tieneAcceso = (rolUsuario, rolRequerido) => {
    if (!rolRequerido) return true;
    if (!rolUsuario) return false;

    const jerarquia = {
      CLIENTE: 1,
      ORGANIZADOR: 2,
      ADMINPLATAFORMA: 3,
    };

    const nivelUsuario = jerarquia[rolUsuario.toUpperCase()] || 0;
    const nivelRequerido = jerarquia[rolRequerido.toUpperCase()] || 0;

    return nivelUsuario >= nivelRequerido;
  };

  // Si se requiere un rol específico y no coincide jerárquicamente, mandarlo al home
  if (requiredRole && !tieneAcceso(rol, requiredRole)) {
    return <Navigate to={ROUTES.INICIO} replace />;
  }

  return element;
}
