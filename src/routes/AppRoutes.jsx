import { Routes, Route } from 'react-router-dom';
import Inicio from '@pages/Inicio';
import Login from '@pages/Login';
import Registro from '@pages/Registro';
import DetalleEvento from '@pages/DetalleEvento';


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/home" element={<Inicio />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="*" element={<Inicio />} />
      <Route path="/evento/:id" element={<DetalleEvento />} />
    </Routes>
  );
}