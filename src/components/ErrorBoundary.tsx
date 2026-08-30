import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: ErrorBoundaryProps;
  public state: ErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('self_attendance_records');
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Something went wrong
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                An unexpected interface error occurred. You can reload the workspace or restore default sample data.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-left overflow-x-auto max-h-32 text-[11px] font-mono text-rose-600 dark:text-rose-400">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <Home className="w-3.5 h-3.5" />
                Reload Application
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset & Restore
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
