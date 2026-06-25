import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../test-utils';

vi.mock('../../src/components/layout/Header', () => ({
  default: () => <header data-testid="header" />,
}));

vi.mock('../../src/components/layout/Footer', () => ({
  default: () => <footer data-testid="footer" />,
}));

vi.mock('../../src/utils/logger', () => ({
  default: { log: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import Contacto from '../../src/pages/Contacto';

describe('Contacto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renderiza header y footer', () => {
    renderWithRouter(<Contacto />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('muestra el título de la página', () => {
    renderWithRouter(<Contacto />);
    expect(screen.getByText('Contacto')).toBeInTheDocument();
  });

  it('muestra tarjetas de información de contacto', () => {
    renderWithRouter(<Contacto />);
    expect(screen.getByText('contacto@ticketti.org')).toBeInTheDocument();
    expect(screen.getByText('+56 9 1234 5678')).toBeInTheDocument();
    expect(screen.getByText('Santiago, Chile')).toBeInTheDocument();
  });

  it('muestra horario de atención', () => {
    renderWithRouter(<Contacto />);
    expect(screen.getByText('Lunes a Viernes')).toBeInTheDocument();
    expect(screen.getByText('9:00 - 18:00 hrs')).toBeInTheDocument();
  });

  it('muestra las 3 preguntas frecuentes', () => {
    renderWithRouter(<Contacto />);
    expect(screen.getByText('¿Cómo creo un evento?')).toBeInTheDocument();
    expect(screen.getByText('¿Los eventos son gratuitos?')).toBeInTheDocument();
    expect(screen.getByText('¿Cómo compro entradas?')).toBeInTheDocument();
  });

  it('permite填写 el formulario y enviar', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithRouter(<Contacto />);

    await user.type(screen.getByPlaceholderText(/Juan Pérez/), 'Juan');
    await user.type(screen.getByPlaceholderText(/tu@email.com/), 'juan@test.com');
    await user.type(screen.getByPlaceholderText(/Motivo/), 'Consulta');
    await user.type(screen.getByPlaceholderText(/Escribe aquí/), 'Tengo una duda');

    await user.click(screen.getByText('Enviar mensaje'));

    expect(screen.getByText(/Mensaje enviado correctamente/)).toBeInTheDocument();
  });

  it('limpia el formulario después de enviar', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithRouter(<Contacto />);

    await user.type(screen.getByPlaceholderText(/Juan Pérez/), 'Juan');
    await user.type(screen.getByPlaceholderText(/tu@email.com/), 'juan@test.com');
    await user.type(screen.getByPlaceholderText(/Motivo/), 'Consulta');
    await user.type(screen.getByPlaceholderText(/Escribe aquí/), 'Mensaje');

    await user.click(screen.getByText('Enviar mensaje'));

    expect(screen.getByPlaceholderText(/Juan Pérez/)).toHaveValue('');
    expect(screen.getByPlaceholderText(/tu@email.com/)).toHaveValue('');
  });

  it('oculta el alerta de éxito después de 3 segundos', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithRouter(<Contacto />);

    await user.type(screen.getByPlaceholderText(/Juan Pérez/), 'Juan');
    await user.type(screen.getByPlaceholderText(/tu@email.com/), 'juan@test.com');
    await user.type(screen.getByPlaceholderText(/Motivo/), 'Consulta');
    await user.type(screen.getByPlaceholderText(/Escribe aquí/), 'Test');

    await user.click(screen.getByText('Enviar mensaje'));
    expect(screen.getByText(/Mensaje enviado correctamente/)).toBeInTheDocument();

    await act(() => {
      vi.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(screen.queryByText(/Mensaje enviado correctamente/)).not.toBeInTheDocument();
    });
  });
});
