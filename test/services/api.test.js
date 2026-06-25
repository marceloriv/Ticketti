import { describe, it, expect } from 'vitest';

describe('src/services/api.js', () => {
  it('re-exporta clienteApi como default', async () => {
    const mod = await import('../../src/services/api');
    expect(mod.default).toBeDefined();
  });

  it('re-exporta es una instancia de axios con interceptors', async () => {
    const mod = await import('../../src/services/api');
    const clienteApi = mod.default;
    expect(clienteApi.interceptors).toBeDefined();
    expect(clienteApi.interceptors.request).toBeDefined();
    expect(clienteApi.interceptors.response).toBeDefined();
  });

  it('tiene método get', async () => {
    const mod = await import('../../src/services/api');
    expect(typeof mod.default.get).toBe('function');
  });

  it('tiene método post', async () => {
    const mod = await import('../../src/services/api');
    expect(typeof mod.default.post).toBe('function');
  });
});
