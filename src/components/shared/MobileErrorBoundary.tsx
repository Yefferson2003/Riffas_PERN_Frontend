import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class MobileErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
    
    // Log específico para móviles
    if (/mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
      console.error('Error en dispositivo móvil:', {
        error: error.message,
        stack: error.stack,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      
      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }
      
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-4 bg-red-50 rounded-lg border border-red-200">
          <h2 className="mb-2 text-xl font-bold text-red-700">¡Oops! Algo salió mal</h2>
          <p className="mb-4 text-center text-red-600">
            Se produjo un error inesperado. Esto puede deberse a problemas de compatibilidad en dispositivos móviles.
          </p>
          <button
            onClick={this.resetError}
            className="px-4 py-2 text-white transition-colors bg-red-600 rounded hover:bg-red-700"
          >
            Intentar de nuevo
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 text-xs text-gray-600">
              <summary>Detalles del error (desarrollo)</summary>
              <pre className="p-2 mt-2 overflow-auto text-xs bg-gray-100 rounded">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default MobileErrorBoundary;