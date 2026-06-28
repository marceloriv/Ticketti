import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mockear los alias de API para que los componentes y el test compartan la misma instancia mockeada
vi.mock('@api/index', () => ({
  eventosApi: {
    buscarEvento: vi.fn(),
    listarEventos: vi.fn(),
    listarMisEventos: vi.fn(),
  },
  carritoApi: {
    crearCarrito: vi.fn(),
    obtenerCarrito: vi.fn(),
    obtenerResumen: vi.fn(),
    agregarEntrada: vi.fn(),
    eliminarEntrada: vi.fn(),
    actualizarCarrito: vi.fn(),
    iniciarCheckout: vi.fn(),
    renovarReserva: vi.fn(),
    listarCarritos: vi.fn(),
  },
  donacionesApi: {
    getCausasActivas: vi.fn(),
    getOrganizacionesActivas: vi.fn(),
  },
}));

vi.mock('@api/donacionesApi', () => {
  const getCausasActivasMock = vi.fn();
  const getOrganizacionesActivasMock = vi.fn();
  return {
    default: {
      getCausasActivas: getCausasActivasMock,
      getOrganizacionesActivas: getOrganizacionesActivasMock,
    },
    getCausasActivas: getCausasActivasMock,
    getOrganizacionesActivas: getOrganizacionesActivasMock,
  };
});

vi.mock('@api/carritoApi', () => {
  const mockCarritoObj = {
    crearCarrito: vi.fn(),
    obtenerCarrito: vi.fn(),
    obtenerResumen: vi.fn(),
    agregarEntrada: vi.fn(),
    eliminarEntrada: vi.fn(),
    actualizarCarrito: vi.fn(),
    iniciarCheckout: vi.fn(),
    renovarReserva: vi.fn(),
    listarCarritos: vi.fn(),
  };
  return {
    default: mockCarritoObj,
    crearCarrito: mockCarritoObj.crearCarrito,
    obtenerCarrito: mockCarritoObj.obtenerCarrito,
    obtenerResumen: mockCarritoObj.obtenerResumen,
    agregarEntrada: mockCarritoObj.agregarEntrada,
    eliminarEntrada: mockCarritoObj.eliminarEntrada,
    actualizarCarrito: mockCarritoObj.actualizarCarrito,
    iniciarCheckout: mockCarritoObj.iniciarCheckout,
    renovarReserva: mockCarritoObj.renovarReserva,
    listarCarritos: mockCarritoObj.listarCarritos,
  };
});

vi.mock('@api/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));

vi.mock('@components/layout/Header', () => ({
  default: () => <header data-testid="header" />,
}));

vi.mock('@components/layout/Footer', () => ({
  default: () => <footer data-testid="footer" />,
}));

vi.mock('@utils/logger', () => ({
  default: { log: vi.fn(), warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useParams: vi.fn(() => ({ id: '1', carritoId: '99' })),
  };
});

import DetalleEvento from '@pages/DetalleEvento';
import PaginaCarrito from '@pages/PaginaCarrito';
import { eventosApi } from '@api/index';
import carritoApi from '@api/carritoApi';
import { getCausasActivas } from '@api/donacionesApi';
import { renderWithAuthAndRouter } from '../test-utils';
import { useParams } from 'react-router-dom';

describe('Integración Frontend - Flujo de Compra', () => {
  const mockUsuario = { id: 1, correo: 'cliente@ticketti.com', rol: 'CLIENTE' };

  const mockEvento = {
    id: 1,
    nombre: 'Concierto de Rock',
    precioEntrada: 10000,
    stock: 10,
    descripcion: 'Gran concierto de bandas locales',
    genero: 'Rock',
  };

  const mockResumenCarrito = {
    items: [
      {
        idDetalle: 5,
        eventoId: 1,
        eventoNombre: 'Concierto de Rock',
        cantidad: 2,
        precioUnitario: 10000,
        subtotal: 20000,
      },
    ],
    subtotal: 20000,
    montoDonacion: 2000,
    total: 22000,
    estadoCarrito: 'CREADO',
    causaSocialId: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe permitir agregar entradas desde la página de detalle y navegar al carrito', async () => {
    useParams.mockReturnValue({ id: '1' });
    eventosApi.buscarEvento.mockResolvedValue(mockEvento);
    carritoApi.crearCarrito.mockResolvedValue({ idCarrito: 99 });
    carritoApi.agregarEntrada.mockResolvedValue({ idCarrito: 99 });

    const user = userEvent.setup();
    renderWithAuthAndRouter(<DetalleEvento />, {
      route: '/evento/1',
      authValue: { isAuthenticated: true, usuario: mockUsuario, establecerCarritoId: vi.fn() },
    });

    // Validar carga del evento
    expect(await screen.findByText('Concierto de Rock')).toBeInTheDocument();
    expect(screen.getByText('Gran concierto de bandas locales')).toBeInTheDocument();

    // Hacer clic en agregar al carrito (abre modal o confirma cantidad)
    const btnComprar = screen.getByRole('button', { name: /comprar entrada/i });
    await user.click(btnComprar);

    // Ajustar cantidad de entradas en el modal a 2 y confirmar
    const inputCantidad = screen.getByRole('spinbutton');
    fireEvent.change(inputCantidad, { target: { value: '2' } });

    const btnConfirmar = screen.getByRole('button', { name: /agregar.*carrito/i });
    await user.click(btnConfirmar);

    // Verificar interacciones de inicialización y agregar
    await waitFor(() => {
      expect(carritoApi.crearCarrito).toHaveBeenCalled();
      expect(carritoApi.agregarEntrada).toHaveBeenCalledWith(
        99,
        {
          eventoId: 1,
          tipoEntrada: 'General',
          cantidad: 2,
          precioUnitario: 10000,
        }
      );
    });
  });

  it('debe permitir seleccionar una causa social y realizar el checkout en la página del carrito', async () => {
    useParams.mockReturnValue({ carritoId: '99' });
    getCausasActivas.mockResolvedValue([
      { idCausa: 201, nombre: 'Ayuda Humanitaria Infantil' },
    ]);
    carritoApi.obtenerResumen.mockResolvedValue(mockResumenCarrito);
    carritoApi.iniciarCheckout.mockResolvedValue({
      idCarrito: 99,
      estadoCarrito: 'RESERVADO',
      causaSocialId: 201,
    });

    const user = userEvent.setup();
    renderWithAuthAndRouter(<PaginaCarrito />, {
      route: '/carrito/99',
      authValue: { isAuthenticated: true, usuario: mockUsuario, establecerCarritoId: vi.fn() },
    });

    // Validar visualización de entradas en el carrito
    expect(await screen.findByText('Concierto de Rock')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('$20.000')).toBeInTheDocument();

    // Esperar a que se carguen las causas en el selector
    expect(await screen.findByText('Ayuda Humanitaria Infantil')).toBeInTheDocument();

    // Seleccionar la causa social
    const selectorCausa = screen.getByRole('combobox');
    await user.selectOptions(selectorCausa, '201');

    // Confirmar que el botón de checkout se habilite y hacer clic
    const btnPagar = screen.getByRole('button', { name: /proceder al pago seguro/i });
    expect(btnPagar).toBeEnabled();

    await user.click(btnPagar);

    // Verificar que se haya llamado al API de checkout
    await waitFor(() => {
      expect(carritoApi.iniciarCheckout).toHaveBeenCalledWith('99', {
        causaSocialId: '201',
        idempotencyKey: expect.any(String),
      });
    });
  });
});
