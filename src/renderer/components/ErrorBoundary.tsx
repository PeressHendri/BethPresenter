import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React UI error:', error, errorInfo);
    this.setState({ errorInfo });
    // In production, we can ping ipcRenderer to log it using electron-log
    if ((window as any).electron) {
        (window as any).electron.ipcRenderer.send('log:error', { error: error.message, stack: errorInfo.componentStack });
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex-1 w-full h-screen flex items-center justify-center bg-surface-base p-10">
          <div className="bg-surface-elevated max-w-2xl w-full border border-danger-500/50 shadow-2xl rounded-2xl p-8 overflow-hidden relative">
             <div className="absolute top-0 right-0 p-3 opacity-10">
                <AlertTriangle size={150} />
             </div>
             
             <div className="flex items-center gap-4 mb-4 relative z-10 text-danger-500">
               <AlertTriangle size={40} />
               <div>
                  <h1 className="text-2xl font-black tracking-tight">UI Crash Terminated</h1>
                  <p className="text-sm font-semibold opacity-80 uppercase tracking-widest mt-1">Runtime Exception Halted Execution</p>
               </div>
             </div>

             <div className="bg-black/50 border border-border-strong rounded-lg p-4 mb-6 relative z-10 text-text-200">
                <p className="font-bold text-lg mb-2 text-red-300">{this.state.error?.message}</p>
                <div className="max-h-48 overflow-y-auto">
                   <pre className="text-[10px] font-mono whitespace-pre-wrap opacity-70">
                      {this.state.errorInfo?.componentStack || this.state.error?.stack}
                   </pre>
                </div>
             </div>

             <div className="flex justify-end gap-3 relative z-10">
                <Button variant="danger" className="gap-2 font-bold px-6" onClick={() => window.location.reload()}>
                   <RefreshCcw size={16} /> REBOOT RENDERER
                </Button>
             </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
