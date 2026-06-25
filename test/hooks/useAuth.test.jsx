import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAuth } from '../../src/hooks/useAuth';
import { AuthContext } from '../../src/contexts/auth/AuthContext';

describe('useAuth', () => {
  it('lanza error cuando se usa fuera de AuthProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth debe ser usado dentro de un AuthProvider');

    consoleSpy.mockRestore();
  });

  it('retorna el contexto de autenticación cuando se usa dentro de AuthProvider', () => {
    const mockContext = {
      token: 'test-token',
      usuario: { nombre: 'Test User', rol: 'CLIENTE' },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <AuthContext.Provider value={mockContext}>
          {children}
        </AuthContext.Provider>
      ),
    });

    expect(result.current).toEqual(mockContext);
    expect(result.current.token).toBe('test-token');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('retorna isAuthenticated false cuando no hay token', () => {
    const mockContext = {
      token: null,
      usuario: null,
      isAuthenticated: false,
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <AuthContext.Provider value={mockContext}>
          {children}
        </AuthContext.Provider>
      ),
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBeNull();
  });
});
