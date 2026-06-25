import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithAuthAndRouter } from '../test-utils';

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../src/api/api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

vi.mock('../../src/api/usuariosApi', () => ({
  obtenerUsuario: vi.fn(),
  actualizarUsuario: vi.fn(),
}));

vi.mock('../../src/api/carritoApi', () => ({
  solicitarDevolucion: vi.fn(),
  obtenerCarrito: vi.fn(),
}));

vi.mock('../../src/components/layout/Header', () => ({
  default: () => <header data-testid="header" />,
}));

vi.mock('../../src/components/layout/Footer', () => ({
  default: () => <footer data-testid="footer" />,
}));

vi.mock('../../src/utils/logger', () => ({
  default: { log: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import PerfilCliente from '../../src/pages/PerfilCliente';
import { useAuth } from '../../src/hooks/useAuth';
import api from '../../src/api/api';
import { obtenerUsuario, actualizarUsuario } from '../../src/api/usuariosApi';
import { solicitarDevolucion, obtenerCarrito } from '../../src/api/carritoApi';

describe('PerfilCliente', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      usuario: { id: 1, nombre: 'Juan', correo: 'juan@test.com', rol: 'CLIENTE' },
      actualizarContextoUsuario: vi.fn(),
    });
    api.get.mockResolvedValue({ data: [] });
    obtenerUsuario.mockResolvedValue({ data: { id: 1, nombre: 'Juan', correo: 'juan@test.com', telefono: '123456', direccion: 'Calle 1' } });
  });

  it('renderiza el perfil del cliente', async () => {
    renderWithAuthAndRouter(<PerfilCliente />);
    await waitFor(() => {
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('muestra las pestañas del perfil', async () => {
    renderWithAuthAndRouter(<PerfilCliente />);
    await waitFor(() => {
      expect(screen.getAllByRole('tab').length).toBeGreaterThan(0);
    });
  });

  it('carga los datos del perfil al montar', async () => {
    renderWithAuthAndRouter(<PerfilCliente />);
    await waitFor(() => {
      expect(obtenerUsuario).toHaveBeenCalledWith(1);
    });
  });

  it('carga las notificaciones al montar', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('notificaciones')) return Promise.resolve({ data: [{ idNotificacion: 1, mensaje: 'Hola' }] });
      return Promise.resolve({ data: [] });
    });
    renderWithAuthAndRouter(<PerfilCliente />);
    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });
  });

  it('muestra el nombre del usuario en el header', async () => {
    renderWithAuthAndRouter(<PerfilCliente />);
    await waitFor(() => {
      expect(screen.getByText('Juan')).toBeInTheDocument();
    });
  });

  it('muestra badge del rol', async () => {
    renderWithAuthAndRouter(<PerfilCliente />);
    await waitFor(() => {
      expect(screen.getByText('CLIENTE')).toBeInTheDocument();
    });
  });

  it('muestra Información Personal', async () => {
    renderWithAuthAndRouter(<PerfilCliente />);
    await waitFor(() => {
      expect(screen.getByText(/Información Personal/i)).toBeInTheDocument();
    });
  });

  it('muestra carritos REEMBOLSADO en el historial de compras', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('Carrito/listar')) {
        return Promise.resolve({
          data: {
            data: [
              { idCarrito: 1, estadoCarrito: 'PAGADO', total: 20000, items: [{ tipoEntrada: 'General', cantidad: 2 }], fechaCreacion: '2026-06-01T10:00:00' },
              { idCarrito: 2, estadoCarrito: 'REEMBOLSADO', total: 15000, items: [{ tipoEntrada: 'General', cantidad: 1 }], fechaCreacion: '2026-06-02T10:00:00' },
            ],
          },
        });
      }
      return Promise.resolve({ data: [] });
    });
    renderWithAuthAndRouter(<PerfilCliente />);
    await waitFor(() => {
      expect(screen.getAllByText('Reembolsado').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getByText('Pagado')).toBeInTheDocument();
  });

  it('muestra botón "Solicitar devolución" para carritos PAGADO', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('Carrito/listar')) {
        return Promise.resolve({
          data: {
            data: [
              { idCarrito: 10, estadoCarrito: 'PAGADO', total: 30000, items: [{ tipoEntrada: 'VIP', cantidad: 1 }], fechaCreacion: '2026-06-10T10:00:00' },
            ],
          },
        });
      }
      return Promise.resolve({ data: [] });
    });
    renderWithAuthAndRouter(<PerfilCliente />);
    await waitFor(() => {
      expect(screen.getByText('Solicitar devolución')).toBeInTheDocument();
    });
  });

  it('abre modal de devolución al hacer clic en "Solicitar devolución"', async () => {
    const user = userEvent.setup();
    api.get.mockImplementation((url) => {
      if (url.includes('Carrito/listar')) {
        return Promise.resolve({
          data: {
            data: [
              { idCarrito: 10, estadoCarrito: 'PAGADO', total: 30000, items: [{ tipoEntrada: 'VIP', cantidad: 1 }], fechaCreacion: '2026-06-10T10:00:00' },
            ],
          },
        });
      }
      return Promise.resolve({ data: [] });
    });
    renderWithAuthAndRouter(<PerfilCliente />);
    await waitFor(() => {
      expect(screen.getByText('Solicitar devolución')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Solicitar devolución'));
    expect(screen.getByText('¿Estás seguro de que deseas solicitar la devolución de esta compra?')).toBeInTheDocument();
    expect(screen.getByText('Confirmar devolución')).toBeInTheDocument();
  });

  it('procesa devolución y muestra resultado en el modal', async () => {
    const user = userEvent.setup();
    api.get.mockImplementation((url) => {
      if (url.includes('Carrito/listar')) {
        return Promise.resolve({
          data: {
            data: [
              { idCarrito: 10, estadoCarrito: 'PAGADO', total: 30000, items: [{ tipoEntrada: 'VIP', cantidad: 1 }], fechaCreacion: '2026-06-10T10:00:00' },
            ],
          },
        });
      }
      return Promise.resolve({ data: [] });
    });
    obtenerCarrito.mockResolvedValue({ idCarrito: 10, estadoCarrito: 'PAGADO', total: 30000 });
    solicitarDevolucion.mockResolvedValue({
      pedidoId: 10,
      estadoDevolucion: 'REEMBOLSADO',
      montoTotal: 30000,
      montoDevolucion: 25500,
      montoDonacionNoReembolsable: 3000,
      mensaje: 'Devolucion procesada exitosamente. El 10% de donacion no es reembolsable.',
      fechaProcesamiento: '2026-06-25T10:30:00',
    });
    renderWithAuthAndRouter(<PerfilCliente />);
    await waitFor(() => {
      expect(screen.getByText('Solicitar devolución')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Solicitar devolución'));
    await user.click(screen.getByText('Confirmar devolución'));
    await waitFor(() => {
      expect(solicitarDevolucion).toHaveBeenCalledWith(10, { razon: '' });
    });
    await waitFor(() => {
      expect(screen.getByText('Devolución procesada exitosamente')).toBeInTheDocument();
    });
    expect(screen.getByText('$25.500')).toBeInTheDocument();
  });

  it('muestra error si el carrito ya no está en estado PAGADO al confirmar devolución', async () => {
    const user = userEvent.setup();
    api.get.mockImplementation((url) => {
      if (url.includes('Carrito/listar')) {
        return Promise.resolve({
          data: {
            data: [
              { idCarrito: 10, estadoCarrito: 'PAGADO', total: 30000, items: [{ tipoEntrada: 'VIP', cantidad: 1 }], fechaCreacion: '2026-06-10T10:00:00' },
            ],
          },
        });
      }
      return Promise.resolve({ data: [] });
    });
    obtenerCarrito.mockResolvedValue({ idCarrito: 10, estadoCarrito: 'CREADO', total: 30000 });
    renderWithAuthAndRouter(<PerfilCliente />);
    await waitFor(() => {
      expect(screen.getByText('Solicitar devolución')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Solicitar devolución'));
    await user.click(screen.getByText('Confirmar devolución'));
    await waitFor(() => {
      expect(screen.getByText(/Esta compra ya no está en estado pagado/)).toBeInTheDocument();
    });
    expect(solicitarDevolucion).not.toHaveBeenCalled();
  });

  it('pre-check exitoso: obtenerCarrito retorna PAGADO y procede con la devolución', async () => {
    const user = userEvent.setup();
    api.get.mockImplementation((url) => {
      if (url.includes('Carrito/listar')) {
        return Promise.resolve({
          data: {
            data: [
              { idCarrito: 10, estadoCarrito: 'PAGADO', total: 30000, items: [{ tipoEntrada: 'VIP', cantidad: 1 }], fechaCreacion: '2026-06-10T10:00:00' },
            ],
          },
        });
      }
      return Promise.resolve({ data: [] });
    });
    obtenerCarrito.mockResolvedValue({ idCarrito: 10, estadoCarrito: 'PAGADO', total: 30000 });
    solicitarDevolucion.mockResolvedValue({
      pedidoId: 10,
      estadoDevolucion: 'REEMBOLSADO',
      montoTotal: 30000,
      montoDevolucion: 25500,
      montoDonacionNoReembolsable: 3000,
      mensaje: 'Devolucion procesada exitosamente.',
      fechaProcesamiento: '2026-06-25T10:30:00',
    });
    renderWithAuthAndRouter(<PerfilCliente />);
    await waitFor(() => {
      expect(screen.getByText('Solicitar devolución')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Solicitar devolución'));
    await user.click(screen.getByText('Confirmar devolución'));
    await waitFor(() => {
      expect(obtenerCarrito).toHaveBeenCalledWith(10);
    });
    await waitFor(() => {
      expect(solicitarDevolucion).toHaveBeenCalledWith(10, { razon: '' });
    });
    expect(screen.getByText('Devolución procesada exitosamente')).toBeInTheDocument();
  });
});
