import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó una excepción:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#090a0f] p-6 text-white font-sans">
          <div className="max-w-md w-full rounded-2xl border border-red-500/30 bg-neutral-900/90 p-6 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20 text-red-400">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white mb-2">
              Error de Renderizado en la Plataforma
            </h1>
            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              Ocurrió una excepción inesperada al cargar la interfaz. Los datos satelitales y capas WMS están protegidos.
            </p>

            {this.state.error && (
              <div className="mb-5 overflow-x-auto rounded-lg bg-black/60 p-3 text-left font-mono text-[11px] text-red-300 border border-neutral-800">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500 shadow-lg shadow-blue-600/30"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Recargar Plataforma</span>
              </button>
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-xs font-semibold text-neutral-200 transition hover:bg-neutral-700"
              >
                <Home className="h-4 w-4" />
                <span>Reintentar</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
