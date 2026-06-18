import ProtectedRoute from '@components/ProtectedRoute';
import { useAuth } from '@hooks/useAuth';
import { ROLES, ROUTES } from '@utils/routes';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

// Componente fallback de carga para Suspense
const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center app-routes-loading py-5">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Cargando...</span>
    </div>
  </div>
);

// Importar páginas públicas de forma perezosa (Lazy Loading / Code Splitting)
const Inicio = lazy(() => import('@pages/Inicio'));
const Contacto = lazy(() => import('@pages/Contacto'));
const DetalleEvento = lazy(() => import('@pages/DetalleEvento'));
const Donaciones = lazy(() => import('@pages/Donaciones'));
const Eventos = lazy(() => import('@pages/Eventos'));
const Login = lazy(() => import('@pages/Login'));
const Nosotros = lazy(() => import('@pages/Nosotros'));
const Registro = lazy(() => import('@pages/Registro'));

// Importar páginas protegidas de forma perezosa (Lazy Loading / Code Splitting)
const DashboardAdmin = lazy(() => import('@pages/DashboardAdmin'));
const DashboardOrganizador = lazy(() => import('@pages/DashboardOrganizador'));
const HistorialNotificaciones = lazy(() => import('@pages/HistorialNotificaciones'));
const PaginaCarrito = lazy(() => import('@pages/PaginaCarrito'));
const PerfilCliente = lazy(() => import('@pages/PerfilCliente'));

export default function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
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
        <Route path={ROUTES.EVENTOS} element={<Eventos />} />
        <Route path={ROUTES.DONACIONES} element={<Donaciones />} />
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
    </Suspense>
  );
}
