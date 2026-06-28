import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@api/donacionesApi', () => ({
  getCausasActivas: vi.fn(),
  default: { getCausasActivas: vi.fn() },
}));

import { getCausasActivas } from '@api/donacionesApi';
import ResumenCarrito from '../../src/components/ResumenCarrito';

const resumenConItems = {
  items: [
    { idDetalle: 1, nombreEvento: 'Rock Show', cantidad: 2, precioUnitario: 15000 },
    { idDetalle: 2, nombreEvento: 'Jazz Night', cantidad: 1, precioUnitario: 20000 },
  ],
  subtotal: 50000,
  montoDonacion: 5000,
  total: 55000,
  estadoCarrito: 'CREADO',
  estadoPago: null,
};

const resumenVacio = { items: [], subtotal: 0, montoDonacion: 0, total: 0, estadoCarrito: 'CREADO' };

const resumenPagado = {
  items: [{ idDetalle: 1, nombreEvento: 'Event', cantidad: 1, precioUnitario: 10000 }],
  subtotal: 10000,
  montoDonacion: 1000,
  total: 11000,
  estadoCarrito: 'PAGADO',
};

describe('ResumenCarrito', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCausasActivas.mockResolvedValue([{ idCausa: '1', nombre: 'UNICEF' }]);
  });

  it('renderiza título "Resumen de Compra"', () => {
    render(<ResumenCarrito resumen={resumenConItems} onCheckout={vi.fn()} />);
    expect(screen.getByText('Resumen de Compra')).toBeInTheDocument();
  });

  it('muestra subtotal formateado en CLP', () => {
    render(<ResumenCarrito resumen={resumenConItems} onCheckout={vi.fn()} />);
    expect(screen.getByText(/\$50\.000/)).toBeInTheDocument();
  });

  it('muestra donación del 10%', () => {
    render(<ResumenCarrito resumen={resumenConItems} onCheckout={vi.fn()} />);
    expect(screen.getByText(/10% del subtotal/)).toBeInTheDocument();
    expect(screen.getByText(/\$5\.000/)).toBeInTheDocument();
  });

  it('muestra total final con donación incluida', () => {
    render(<ResumenCarrito resumen={resumenConItems} onCheckout={vi.fn()} />);
    const totals = screen.getAllByText(/\$55\.000/);
    expect(totals.length).toBeGreaterThanOrEqual(1);
  });

  it('muestra "Gratis" en despacho', () => {
    render(<ResumenCarrito resumen={resumenConItems} onCheckout={vi.fn()} />);
    expect(screen.getByText('Gratis')).toBeInTheDocument();
  });

  it('muestra selector de causa social para usuario autenticado', async () => {
    render(<ResumenCarrito resumen={resumenConItems} onCheckout={vi.fn()} />);
    expect(await screen.findByText('UNICEF')).toBeInTheDocument();
  });

  it('no muestra selector de causa para invitado', () => {
    render(<ResumenCarrito resumen={resumenConItems} onCheckout={vi.fn()} isGuest={true} />);
    expect(screen.queryByText('UNICEF')).not.toBeInTheDocument();
  });

  it('muestra botón de pago', () => {
    render(<ResumenCarrito resumen={resumenConItems} onCheckout={vi.fn()} />);
    expect(screen.getByText('Proceder al Pago Seguro')).toBeInTheDocument();
  });

  it('muestra "Pago confirmado" cuando el carrito está pagado', () => {
    render(<ResumenCarrito resumen={resumenPagado} onCheckout={vi.fn()} esCarritoPagado={true} />);
    expect(screen.getByText(/Pago confirmado/)).toBeInTheDocument();
  });

  it('ejecuta onCheckout con causaSocialId al enviar', async () => {
    const onCheckout = vi.fn();
    render(<ResumenCarrito resumen={resumenConItems} onCheckout={onCheckout} />);
    const user = userEvent.setup();
    expect(await screen.findByText('UNICEF')).toBeInTheDocument();
    await user.selectOptions(screen.getByRole('combobox'), '1');
    await user.click(screen.getByText('Proceder al Pago Seguro'));
    expect(onCheckout).toHaveBeenCalledWith('1');
  });

  it('muestra badge del estado del carrito', () => {
    render(<ResumenCarrito resumen={resumenConItems} onCheckout={vi.fn()} />);
    expect(screen.getByText('Carro: CREADO')).toBeInTheDocument();
  });

  it('muestra "Iniciar sesión" para invitado', () => {
    render(<ResumenCarrito resumen={resumenConItems} onCheckout={vi.fn()} isGuest={true} />);
    expect(screen.getByText('Iniciar sesión para comprar')).toBeInTheDocument();
  });
});
