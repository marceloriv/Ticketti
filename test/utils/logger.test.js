import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('logger', () => {
  let logger;

  const mockConsole = () => ({
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    info: vi.spyOn(console, 'info').mockImplementation(() => {}),
  });

  beforeEach(() => {
    vi.resetModules();
  });

  it('tiene los 4 métodos', async () => {
    const mocks = mockConsole();
    const mod = await import('../../src/utils/logger');
    logger = mod.default;
    expect(typeof logger.log).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.info).toBe('function');
    mocks.log.mockRestore();
    mocks.warn.mockRestore();
    mocks.error.mockRestore();
    mocks.info.mockRestore();
  });

  it('log llama a console.log cuando isProd es false', async () => {
    const mocks = mockConsole();
    const mod = await import('../../src/utils/logger');
    logger = mod.default;
    logger.log('test message');
    if (!import.meta.env.PROD) {
      expect(mocks.log).toHaveBeenCalledWith('test message');
    }
    mocks.log.mockRestore();
    mocks.warn.mockRestore();
    mocks.error.mockRestore();
    mocks.info.mockRestore();
  });

  it('warn llama a console.warn', async () => {
    const mocks = mockConsole();
    const mod = await import('../../src/utils/logger');
    logger = mod.default;
    logger.warn('warn message');
    if (!import.meta.env.PROD) {
      expect(mocks.warn).toHaveBeenCalledWith('warn message');
    }
    mocks.log.mockRestore();
    mocks.warn.mockRestore();
    mocks.error.mockRestore();
    mocks.info.mockRestore();
  });

  it('error llama a console.error', async () => {
    const mocks = mockConsole();
    const mod = await import('../../src/utils/logger');
    logger = mod.default;
    logger.error('error message');
    if (!import.meta.env.PROD) {
      expect(mocks.error).toHaveBeenCalledWith('error message');
    }
    mocks.log.mockRestore();
    mocks.warn.mockRestore();
    mocks.error.mockRestore();
    mocks.info.mockRestore();
  });

  it('info llama a console.info', async () => {
    const mocks = mockConsole();
    const mod = await import('../../src/utils/logger');
    logger = mod.default;
    logger.info('info message');
    if (!import.meta.env.PROD) {
      expect(mocks.info).toHaveBeenCalledWith('info message');
    }
    mocks.log.mockRestore();
    mocks.warn.mockRestore();
    mocks.error.mockRestore();
    mocks.info.mockRestore();
  });
});
