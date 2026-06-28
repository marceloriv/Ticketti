import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../test-utils';

vi.mock('../../../src/api/usuariosApi', () => ({
  listarUsuarios: vi.fn(),
  actualizarUsuario: vi.fn(),
  eliminarUsuario: vi.fn(),
}));

vi.mock('../../../src/utils/logger', () => ({
  default: { log: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import DashAdminUsuarios from '../../../src/components/Admin/DashAdminUsuarios';
import {
  listarUsuarios,
  actualizarUsuario,
  eliminarUsuario,
} from '../../../src/api/usuariosApi';

const usuariosMock = [
  { id: 1, nombre: 'Juan', correo: 'juan@test.com', telefono: '123', direccion: 'Calle 1', rol: 'CLIENTE' },
  { id: 2, nombre: 'Ana', correo: 'ana@test.com', telefono: '456', direccion: 'Calle 2', rol: 'ORGANIZADOR' },
];

describe('DashAdminUsuarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    listarUsuarios.mockResolvedValue(usuariosMock);
  });

  afterEach(() => {
    window.confirm.mockRestore?.();
  });

  it('renderiza el título de gestión de usuarios', async () => {
    renderWithRouter(<DashAdminUsuarios />);
    await waitFor(() => {
      expect(screen.getByText('Gestión de usuarios')).toBeInTheDocument();
    });
  });

  it('carga y muestra usuarios en la tabla', async () => {
    renderWithRouter(<DashAdminUsuarios />);
    await waitFor(() => {
      expect(screen.getByText('Juan')).toBeInTheDocument();
      expect(screen.getByText('Ana')).toBeInTheDocument();
    });
  });

  it('muestra los correos de los usuarios', async () => {
    renderWithRouter(<DashAdminUsuarios />);
    await waitFor(() => {
      expect(screen.getByText('juan@test.com')).toBeInTheDocument();
      expect(screen.getByText('ana@test.com')).toBeInTheDocument();
    });
  });

  it('muestra badges de rol', async () => {
    renderWithRouter(<DashAdminUsuarios />);
    await waitFor(() => {
      expect(screen.getAllByText('CLIENTE').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('ORGANIZADOR').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('muestra spinner mientras carga', async () => {
    listarUsuarios.mockReturnValue(new Promise(() => {}));
    renderWithRouter(<DashAdminUsuarios />);
    await waitFor(() => {
      expect(document.querySelector('.spinner-ticketti')).toBeTruthy();
    });
  });

  it('muestra error cuando falla la carga', async () => {
    listarUsuarios.mockRejectedValue(new Error('Error de red'));
    renderWithRouter(<DashAdminUsuarios />);
    await waitFor(() => {
      expect(screen.getByText('Error de red')).toBeInTheDocument();
    });
  });

  it('muestra error del backend con campo mensaje', async () => {
    listarUsuarios.mockRejectedValue({ response: { data: { mensaje: 'No autorizado' } } });
    renderWithRouter(<DashAdminUsuarios />);
    await waitFor(() => {
      expect(screen.getByText('No autorizado')).toBeInTheDocument();
    });
  });

  it('cambia el rol de un usuario en el select', async () => {
    const user = userEvent.setup();
    renderWithRouter(<DashAdminUsuarios />);
    await waitFor(() => {
      expect(screen.getByText('Juan')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'ORGANIZADOR');

    expect(selects[0]).toHaveValue('ORGANIZADOR');
  });

  it('guarda el cambio de rol exitosamente', async () => {
    actualizarUsuario.mockResolvedValue({});
    const user = userEvent.setup();
    renderWithRouter(<DashAdminUsuarios />);

    await waitFor(() => {
      expect(screen.getByText('Juan')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'ORGANIZADOR');

    const saveButtons = screen.getAllByTitle('Guardar cambio de rol');
    await user.click(saveButtons[0]);

    await waitFor(() => {
      expect(actualizarUsuario).toHaveBeenCalledWith(1, expect.objectContaining({ rol: 'ORGANIZADOR' }));
      expect(screen.getByText('Rol actualizado correctamente.')).toBeInTheDocument();
    });
  });

  it('muestra error cuando guardar rol falla', async () => {
    actualizarUsuario.mockRejectedValue({ response: { data: { message: 'Forbidden' } } });
    const user = userEvent.setup();
    renderWithRouter(<DashAdminUsuarios />);

    await waitFor(() => {
      expect(screen.getByText('Juan')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'ORGANIZADOR');

    const saveButtons = screen.getAllByTitle('Guardar cambio de rol');
    await user.click(saveButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Forbidden')).toBeInTheDocument();
    });
  });

  it('elimina un usuario exitosamente', async () => {
    eliminarUsuario.mockResolvedValue({});
    const user = userEvent.setup();
    renderWithRouter(<DashAdminUsuarios />);

    await waitFor(() => {
      expect(screen.getByText('Juan')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Eliminar usuario');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(eliminarUsuario).toHaveBeenCalledWith(1);
      expect(screen.getByText('Usuario eliminado correctamente.')).toBeInTheDocument();
    });
  });

  it('no elimina usuario si el usuario cancela el confirm', async () => {
    window.confirm.mockReturnValue(false);
    const user = userEvent.setup();
    renderWithRouter(<DashAdminUsuarios />);

    await waitFor(() => {
      expect(screen.getByText('Juan')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Eliminar usuario');
    await user.click(deleteButtons[0]);

    expect(eliminarUsuario).not.toHaveBeenCalled();
  });

  it('muestra error cuando eliminar falla', async () => {
    eliminarUsuario.mockRejectedValue(new Error('Server error'));
    const user = userEvent.setup();
    renderWithRouter(<DashAdminUsuarios />);

    await waitFor(() => {
      expect(screen.getByText('Juan')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Eliminar usuario');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('deshabilita botón de guardar cuando el rol no cambió', async () => {
    renderWithRouter(<DashAdminUsuarios />);
    await waitFor(() => {
      expect(screen.getByText('Juan')).toBeInTheDocument();
    });

    const saveButtons = screen.getAllByTitle('Guardar cambio de rol');
    expect(saveButtons[0]).toBeDisabled();
  });

  it('recarga usuarios al hacer click en Actualizar', async () => {
    const user = userEvent.setup();
    renderWithRouter(<DashAdminUsuarios />);
    await waitFor(() => {
      expect(listarUsuarios).toHaveBeenCalledTimes(1);
    });

    const refreshButton = screen.getByText('Actualizar');
    await user.click(refreshButton);

    await waitFor(() => {
      expect(listarUsuarios).toHaveBeenCalledTimes(2);
    });
  });

  it('muestra las columnas de la tabla correctamente', async () => {
    renderWithRouter(<DashAdminUsuarios />);
    await waitFor(() => {
      expect(screen.getByText('Nombre')).toBeInTheDocument();
      expect(screen.getByText('Correo')).toBeInTheDocument();
      expect(screen.getByText('Teléfono')).toBeInTheDocument();
      expect(screen.getByText('Dirección')).toBeInTheDocument();
      expect(screen.getByText('Rol actual')).toBeInTheDocument();
      expect(screen.getByText('Cambiar rol')).toBeInTheDocument();
      expect(screen.getByText('Acciones')).toBeInTheDocument();
    });
  });

  it('muestra teléfono y dirección de los usuarios', async () => {
    renderWithRouter(<DashAdminUsuarios />);
    await waitFor(() => {
      expect(screen.getByText('123')).toBeInTheDocument();
      expect(screen.getByText('456')).toBeInTheDocument();
      expect(screen.getByText('Calle 1')).toBeInTheDocument();
      expect(screen.getByText('Calle 2')).toBeInTheDocument();
    });
  });
});
