import ProtectedRoute from '@components/ProtectedRoute';
import { useAuth } from '@hooks/useAuth';
import { ROLES, ROUTES } from '@utils/routes';
import { Navigate, Route, Routes } from 'react-router-dom';

// Importar páginas públicas
import Contacto from '@pages/Contacto';
import DetalleEvento from '@pages/DetalleEvento';
import Inicio from '@pages/Inicio';
import Login from '@pages/Login';
import Nosotros from '@pages/Nosotros';
import Registro from '@pages/Registro';

// Importar páginas protegidas
import DashboardAdmin from '@pages/DashboardAdmin';
import DashboardOrganizador from '@pages/DashboardOrganizador';
import HistorialNotificaciones from '@pages/HistorialNotificaciones';
import PaginaCarrito from '@pages/PaginaCarrito';
import PerfilCliente from '@pages/PerfilCliente';

export default function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center app-routes-loading">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* ========== RUTAS PÚBLICAS ========== */}
      <Route path={ROUTES.HOME} element={<Inicio />} />
      <Route path={ROUTES.INICIO} element={<Inicio />} />

      <Route
        path={ROUTES.LOGIN}
        element={
          isAuthenticated ? <Navigate to={ROUTES.INICIO} replace /> : <Login />
        }
      />

      <Route
        path={ROUTES.REGISTRO}
        element={
          isAuthenticated ? (
            <Navigate to={ROUTES.INICIO} replace />
          ) : (
            <Registro />
          )
        }
      />

      {/* ========== RUTAS PÚBLICAS - EVENTOS ========== */}
      <Route path="/evento/:id" element={<DetalleEvento />} />
      <Route path={ROUTES.EVENTOS} element={<Inicio />} />
      <Route path={ROUTES.NOSOTROS} element={<Nosotros />} />
      <Route path={ROUTES.CONTACTO} element={<Contacto />} />

      {/* ========== RUTAS PROTEGIDAS - CLIENTE ========== */}
      <Route
        path={ROUTES.PERFIL}
        element={
          <ProtectedRoute
            element={<PerfilCliente />}
            requiredRole={ROLES.CLIENTE}
          />
        }
      />

      <Route
        path={ROUTES.NOTIFICACIONES}
        element={<ProtectedRoute element={<HistorialNotificaciones />} />}
      />

      <Route path="/carrito" element={<PaginaCarrito />} />
      <Route path="/carrito/:carritoId" element={<PaginaCarrito />} />

      {/* ========== RUTAS PROTEGIDAS - ADMIN PLATAFORMA ========== */}
      <Route
        path={ROUTES.ADMIN_DASHBOARD}
        element={
          <ProtectedRoute
            element={<DashboardAdmin />}
            requiredRole={ROLES.ADMINPLATAFORMA}
          />
        }
      />

      {/* ========== RUTAS PROTEGIDAS - ORGANIZADOR ========== */}
      <Route
        path={ROUTES.ORGANIZADOR_DASHBOARD}
        element={
          <ProtectedRoute
            element={<DashboardOrganizador />}
            requiredRole={ROLES.ORGANIZADOR}
          />
        }
      />

      {/* ========== RUTA 404 - NO ENCONTRADO ========== */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}
