import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface Props {
  moduleName: string;
  fallbackMessage?: string;
  onRetry?: () => void;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ModuleErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[Safety Error Boundary - ${this.props.moduleName}]:`, error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-4 rounded-2xl bg-slate-900/90 border border-red-500/30 shadow-2xl backdrop-blur-md animate-fade-in text-slate-200">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 shrink-0">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/40">
                  Aislamiento de Contingencia
                </span>
                <span className="text-xs font-mono text-slate-500">Módulo Protegido</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 truncate">
                Fallo contenido en {this.props.moduleName}
              </h3>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                {this.props.fallbackMessage || 
                  "Este subsistema ha entrado en modo de protección para evitar la caída del panel de misión. El resto de la consola operativa continúa funcionando sin interrupción."}
              </p>
              
              {this.state.error && (
                <div className="mt-3 p-3 rounded-lg bg-black/40 border border-slate-800 font-mono text-xs text-red-300/80 overflow-x-auto">
                  {this.state.error.message || String(this.state.error)}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={this.handleRetry}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reactivar Módulo</span>
                </button>
                <span className="text-xs text-slate-500 font-mono">
                  Seguridad activa: Tolerancia total a fallos
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
