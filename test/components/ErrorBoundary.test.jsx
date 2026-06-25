import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../../src/utils/logger', () => ({
  default: { log: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import ErrorBoundary from '../../src/components/ErrorBoundary';

const ThrowingComponent = () => {
  throw new Error('Test error');
};

const GoodComponent = () => <div>Child content</div>;

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('renderiza children cuando no hay error', () => {
    render(
      <ErrorBoundary>
        <GoodComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('muestra mensaje de error cuando child falla', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(screen.getByText(/error inesperado/)).toBeInTheDocument();
  });

  it('muestra botón de recargar', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Recargar página')).toBeInTheDocument();
  });

  it('llama a window.location.reload al hacer click en recargar', () => {
    const originalReload = window.location.reload;
    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: mockReload },
      writable: true,
    });
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    screen.getByText('Recargar página').click();
    expect(mockReload).toHaveBeenCalled();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: originalReload },
      writable: true,
    });
  });

  it('no renderiza children cuando hay error', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.queryByText('Child content')).not.toBeInTheDocument();
  });
});
