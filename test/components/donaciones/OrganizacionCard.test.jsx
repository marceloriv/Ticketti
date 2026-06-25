import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrganizacionCard from '../../../src/components/donaciones/OrganizacionCard';

const baseOrg = {
  idOrganizacion: 1,
  nombre: 'Fundación Test',
  rut: '12.345.678-9',
  email: 'contacto@fundacion.cl',
  telefono: '+56 9 1234 5678',
  direccion: 'Santiago, Chile',
  estado: 'ACTIVA',
  imagenUrl: '/img/org.jpg',
};

const renderCard = (props = {}) =>
  render(<OrganizacionCard organizacion={baseOrg} onVerDetalle={vi.fn()} {...props} />);

describe('OrganizacionCard', () => {
  it('renderiza nombre, RUT, email, teléfono y dirección', () => {
    renderCard();
    expect(screen.getByText('Fundación Test')).toBeInTheDocument();
    expect(screen.getByText(/12\.345\.678-9/)).toBeInTheDocument();
    expect(screen.getByText('contacto@fundacion.cl')).toBeInTheDocument();
    expect(screen.getByText('+56 9 1234 5678')).toBeInTheDocument();
    expect(screen.getByText('Santiago, Chile')).toBeInTheDocument();
  });

  it('muestra badge ACTIVA', () => {
    renderCard();
    expect(screen.getByText('ACTIVA')).toHaveClass('bg-success');
  });

  it('muestra badge PENDIENTE', () => {
    renderCard({ organizacion: { ...baseOrg, estado: 'PENDIENTE' } });
    expect(screen.getByText('PENDIENTE')).toHaveClass('bg-warning');
  });

  it('muestra badge INACTIVA', () => {
    renderCard({ organizacion: { ...baseOrg, estado: 'INACTIVA' } });
    expect(screen.getByText('INACTIVA')).toHaveClass('bg-secondary');
  });

  it('ejecuta onVerDetalle al hacer click', async () => {
    const onVerDetalle = vi.fn();
    renderCard({ onVerDetalle });
    await userEvent.setup().click(screen.getByText('Ver detalle'));
    expect(onVerDetalle).toHaveBeenCalled();
  });

  it('muestra botón Editar cuando se provee onEditar', () => {
    renderCard({ onEditar: vi.fn() });
    expect(screen.getByText('Editar')).toBeInTheDocument();
  });

  it('muestra botón Activar solo cuando estado es PENDIENTE', () => {
    renderCard({ organizacion: { ...baseOrg, estado: 'PENDIENTE' }, onActivar: vi.fn() });
    expect(screen.getByText('Activar')).toBeInTheDocument();
  });

  it('no muestra botón Activar cuando estado es ACTIVA', () => {
    renderCard({ onActivar: vi.fn() });
    expect(screen.queryByText('Activar')).not.toBeInTheDocument();
  });

  it('muestra botón Desactivar solo cuando estado es ACTIVA', () => {
    renderCard({ onDesactivar: vi.fn() });
    expect(screen.getByText('Desactivar')).toBeInTheDocument();
  });

  it('no muestra botón Desactivar cuando estado es PENDIENTE', () => {
    renderCard({ organizacion: { ...baseOrg, estado: 'PENDIENTE' }, onDesactivar: vi.fn() });
    expect(screen.queryByText('Desactivar')).not.toBeInTheDocument();
  });

  it('muestra documento de convenio cuando existe', () => {
    renderCard({ organizacion: { ...baseOrg, documentoConvenio: 'convenio.pdf' } });
    expect(screen.getByText(/convenio\.pdf/)).toBeInTheDocument();
  });

  it('no muestra documento cuando no existe', () => {
    renderCard();
    expect(screen.queryByText(/Documento:/)).not.toBeInTheDocument();
  });

  it('ejecuta onActivar cuando se hace click en Activar', async () => {
    const onActivar = vi.fn();
    renderCard({ organizacion: { ...baseOrg, estado: 'PENDIENTE' }, onActivar });
    await userEvent.setup().click(screen.getByText('Activar'));
    expect(onActivar).toHaveBeenCalled();
  });

  it('ejecuta onDesactivar cuando se hace click en Desactivar', async () => {
    const onDesactivar = vi.fn();
    renderCard({ onDesactivar });
    await userEvent.setup().click(screen.getByText('Desactivar'));
    expect(onDesactivar).toHaveBeenCalled();
  });
});
