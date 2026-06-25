import { vi } from 'vitest';

const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  create: vi.fn(() => mockAxios),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
  defaults: {
    headers: {
      common: {},
    },
  },
};

export default mockAxios;
