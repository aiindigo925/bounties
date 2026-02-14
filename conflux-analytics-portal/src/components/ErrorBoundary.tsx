'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
          <div className="bg-red-900 border border-red-500 p-8 rounded-xl shadow-xl max-w-md">
            <h2 className="text-2xl font-bold text-red-300 mb-4">Something went wrong</h2>
            <p className="text-red-200 mb-4">
              An unexpected error occurred while loading the dashboard.
            </p>
            <details className="mb-4">
              <summary className="cursor-pointer text-red-300 hover:text-red-200">
                Error details
              </summary>
              <pre className="mt-2 text-xs text-red-200 bg-red-950 p-2 rounded overflow-x-auto">
                {this.state.error?.message}
              </pre>
            </details>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;