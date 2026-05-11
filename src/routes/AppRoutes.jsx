import { Routes, Route, Navigate } from 'react-router-dom';
import Inicio from '@pages/Inicio';
import Login from '@pages/Login';
import Registro from '@pages/Registro';
import DetalleEvento from '@pages/DetalleEvento';
import DashboardAdmin from '@pages/DashboardAdmin';
import DashboardOrganizador from '@pages/DashboardOrganizador';
import PerfilCliente from '@pages/PerfilCliente';

const token = () => localStorage.getItem('token');
const rol   = () => localStorage.getItem('rol');

const PrivateRoute    = ({ children }) => token() ? children : <Navigate to="/login" replace />;
const AdminRoute      = ({ children }) => token() && rol() === 'ADMIN'        ? children : <Navigate to={token() ? '/home' : '/login'} replace />;
const OrgRoute        = ({ children }) => token() && rol() === 'ORGANIZADOR'  ? children : <Navigate to={token() ? '/home' : '/login'} replace />;
const ClienteRoute    = ({ children }) => token() && rol() === 'CLIENTE'      ? children : <Navigate to={token() ? '/home' : '/login'} replace />;

export default function AppRoutes() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/"        element={<Inicio />} />
      <Route path="/home"    element={<Inicio />} />
      <Route path="/login"   element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/evento/:id" element={<DetalleEvento />} />
      
      <Route path="/admin"       element={<AdminRoute><DashboardAdmin /></AdminRoute>} />
      <Route path="/organizador" element={<OrgRoute><DashboardOrganizador /></OrgRoute>} />
      <Route path="/perfil"      element={<ClienteRoute><PerfilCliente /></ClienteRoute>} />


      <Route path="*" element={<Inicio />} />
    </Routes>
  );
}