// src/hooks/useAuth.js
import { useState, useEffect } from 'react';

/**
 * Hook de autenticación.
 * Lee token y rol desde localStorage.
 * Cuando el BFF incluya el rol en la respuesta,
 * este hook ya está listo para usarlo.
 */
export const useAuth = () => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rol   = localStorage.getItem('rol');
    const nombre = localStorage.getItem('nombre');
    if (token) {
      setUsuario({ token, rol: rol || 'CLIENTE', nombre: nombre || '' });
    }
    setCargando(false);
  }, []);

  const login = (token, rol, nombre) => {
    localStorage.setItem('token', token);
    localStorage.setItem('rol', rol || 'CLIENTE');
    if (nombre) localStorage.setItem('nombre', nombre);
    setUsuario({ token, rol: rol || 'CLIENTE', nombre: nombre || '' });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('nombre');
    setUsuario(null);
    window.location.href = '/login';
  };

  const esAdmin       = () => usuario?.rol === 'ADMIN';
  const esOrganizador = () => usuario?.rol === 'ORGANIZADOR';
  const esCliente     = () => usuario?.rol === 'CLIENTE';
  const estaLogueado  = () => !!usuario;

  return {
    usuario,
    cargando,
    login,
    logout,
    esAdmin,
    esOrganizador,
    esCliente,
    estaLogueado,
  };
};