import { describe, it, expect } from 'vitest';
import { ROUTES, ROLES } from '../../src/utils/routes';

describe('ROUTES', () => {
  it('contiene rutas estáticas correctas', () => {
    expect(ROUTES.HOME).toBe('/');
    expect(ROUTES.INICIO).toBe('/inicio');
    expect(ROUTES.LOGIN).toBe('/login');
    expect(ROUTES.REGISTRO).toBe('/registro');
    expect(ROUTES.EVENTOS).toBe('/eventos');
    expect(ROUTES.DONACIONES).toBe('/donaciones');
    expect(ROUTES.NOSOTROS).toBe('/nosotros');
    expect(ROUTES.CONTACTO).toBe('/contacto');
    expect(ROUTES.PERFIL).toBe('/perfil');
    expect(ROUTES.NOTIFICACIONES).toBe('/notificaciones');
    expect(ROUTES.ADMIN_DASHBOARD).toBe('/admin/dashboard');
    expect(ROUTES.ORGANIZADOR_DASHBOARD).toBe('/organizador/dashboard');
  });

  it('EVENTO_DETALLE genera ruta con id', () => {
    expect(ROUTES.EVENTO_DETALLE(1)).toBe('/evento/1');
    expect(ROUTES.EVENTO_DETALLE('42')).toBe('/evento/42');
  });

  it('CARRITO genera ruta con id', () => {
    expect(ROUTES.CARRITO(10)).toBe('/carrito/10');
    expect(ROUTES.CARRITO('abc')).toBe('/carrito/abc');
  });
});

describe('ROLES', () => {
  it('contiene los 3 roles', () => {
    expect(ROLES.CLIENTE).toBe('CLIENTE');
    expect(ROLES.ORGANIZADOR).toBe('ORGANIZADOR');
    expect(ROLES.ADMINPLATAFORMA).toBe('ADMINPLATAFORMA');
  });
});
