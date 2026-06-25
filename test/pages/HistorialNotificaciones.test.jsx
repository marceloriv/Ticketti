import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../test-utils';

vi.mock('../../src/api/api', () => ({
  default: { get: vi.fn() },
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

import HistorialNotificaciones from '../../src/pages/HistorialNotificaciones';
import api from '../../src/api/api';

const notificacionesMock = [
  { idNotificacion: 1, tipo: 'CONFIRMACION_COMPRA', asunto: 'Compra confirmada', estado: 'ENVIADO', fechaEnvio: '2026-06-15T10:30:00' },
  { idNotificacion: 2, tipo: 'RECORDATORIO_EVENTO', asunto: 'Evento mañana', estado: 'PENDIENTE', fechaEnvio: '2026-06-20T08:00:00' },
];

const createToken = (payload) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = 'fake-signature';
  return `${header}.${body}.${signature}`;
};

describe('HistorialNotificaciones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renderiza header y footer', async () => {
    localStorage.setItem('token', createToken({ userId: 1 }));
    api.get.mockResolvedValue({ data: [] });
    renderWithRouter(<HistorialNotificaciones />);
    await waitFor(() => {
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('muestra título de la página', async () => {
    localStorage.setItem('token', createToken({ userId: 1 }));
    api.get.mockResolvedValue({ data: [] });
    renderWithRouter(<HistorialNotificaciones />);
    await waitFor(() => {
      expect(screen.getByText('Mis Notificaciones')).toBeInTheDocument();
    });
  });

  it('muestra error cuando no hay token', async () => {
    renderWithRouter(<HistorialNotificaciones />);
    await waitFor(() => {
      expect(screen.getByText(/Debes iniciar sesión/)).toBeInTheDocument();
    });
  });

  it('carga notificaciones desde la API', async () => {
    localStorage.setItem('token', createToken({ userId: 1 }));
    api.get.mockResolvedValue({ data: notificacionesMock });
    renderWithRouter(<HistorialNotificaciones />);
    await waitFor(() => {
      expect(screen.getByText('Compra confirmada')).toBeInTheDocument();
    });
    expect(screen.getByText('Evento mañana')).toBeInTheDocument();
  });

  it('muestra mensaje cuando no hay notificaciones', async () => {
    localStorage.setItem('token', createToken({ userId: 1 }));
    api.get.mockResolvedValue({ data: [] });
    renderWithRouter(<HistorialNotificaciones />);
    await waitFor(() => {
      expect(screen.getByText(/No tienes notificaciones/)).toBeInTheDocument();
    });
  });

  it('muestra error cuando falla la API', async () => {
    localStorage.setItem('token', createToken({ userId: 1 }));
    api.get.mockRejectedValue(new Error('Error'));
    renderWithRouter(<HistorialNotificaciones />);
    await waitFor(() => {
      expect(screen.getByText(/No se pudo cargar/)).toBeInTheDocument();
    });
  });

  it('muestra la tabla con encabezados cuando hay datos', async () => {
    localStorage.setItem('token', createToken({ userId: 1 }));
    api.get.mockResolvedValue({ data: notificacionesMock });
    renderWithRouter(<HistorialNotificaciones />);
    await waitFor(() => {
      expect(screen.getByText('Tipo')).toBeInTheDocument();
    });
    expect(screen.getByText('Asunto')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
  });
});
