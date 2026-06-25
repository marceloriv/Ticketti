import { Component } from 'react';
import logger from '../utils/logger';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-ticketti">
          <h1>Algo salió mal</h1>
          <p>Ha ocurrido un error inesperado. Por favor, intenta recargar la página.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              border: '1px solid #721c24',
              borderRadius: '4px',
              background: '#fff',
              color: '#721c24',
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
