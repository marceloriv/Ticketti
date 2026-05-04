import { Routes, Route } from 'react-router-dom';
import Inicio from '@pages/Inicio';
import Login from '@pages/login';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}
