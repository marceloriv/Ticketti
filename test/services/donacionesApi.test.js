import { describe, it, expect } from 'vitest';

describe('src/services/donacionesApi.js', () => {
  it('re-exporta donacionesApi como default', async () => {
    const mod = await import('../../src/services/donacionesApi');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('object');
  });

  it('re-exporta funciones nombradas desde donacionesApi', async () => {
    const mod = await import('../../src/services/donacionesApi');
    expect(typeof mod.getOrganizaciones).toBe('function');
    expect(typeof mod.getCausasActivas).toBe('function');
    expect(typeof mod.getTotalPorOrganizacion).toBe('function');
    expect(typeof mod.crearOrganizacionActiva).toBe('function');
    expect(typeof mod.crearCausaActiva).toBe('function');
    expect(typeof mod.activarOrganizacion).toBe('function');
  });

  it('las funciones re-exportadas son las mismas que en el módulo original', async () => {
    const services = await import('../../src/services/donacionesApi');
    const original = await import('../../src/api/donacionesApi');
    expect(services.default).toBe(original.default);
    expect(services.getOrganizaciones).toBe(original.getOrganizaciones);
    expect(services.getCausasActivas).toBe(original.getCausasActivas);
  });
});
