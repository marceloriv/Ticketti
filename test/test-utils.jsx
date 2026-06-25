import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../src/contexts/auth/AuthContext';

export function renderWithRouter(ui, { route = '/', ...options } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>,
    options
  );
}

export function renderWithAuth(ui, { route = '/', authValue = {}, ...options } = {}) {
  const defaultAuth = {
    token: null,
    usuario: null,
    carritoId: null,
    isAuthenticated: false,
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    authFetch: vi.fn(),
    establecerCarritoId: vi.fn(),
    actualizarContextoUsuario: vi.fn(),
    ...authValue,
  };

  return render(
    <AuthContext.Provider value={defaultAuth}>
      <MemoryRouter initialEntries={[route]}>
        {ui}
      </MemoryRouter>
    </AuthContext.Provider>,
    options
  );
}

export function renderWithAuthAndRouter(ui, { route = '/', authValue = {}, ...options } = {}) {
  return renderWithAuth(ui, { route, authValue, ...options });
}
