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
});
