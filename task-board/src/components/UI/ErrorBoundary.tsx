import React, { Component } from "react";

// ─── Props & State Types ───────────────────────────────────────────────────

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode; // optional custom fallback UI
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

// ─── ErrorBoundary Component ───────────────────────────────────────────────
/**
 * Class component (required by React for error boundaries).
 * Catches any JS errors in the component tree below it.
 *
 * Usage:
 * <ErrorBoundary>
 *   <SomeComponent />
 * </ErrorBoundary>
 *
 * Or with custom fallback:
 * <ErrorBoundary fallback={<p>Something went wrong</p>}>
 *   <SomeComponent />
 * </ErrorBoundary>
 */

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  // ─── Catch errors from child components ─────────────────────────────
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  // ─── Log error details ───────────────────────────────────────────────
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  // ─── Reset error state ───────────────────────────────────────────────
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // ── Use custom fallback if provided ──
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // ── Default fallback UI ──
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
          <div className="bg-gray-900 border border-red-500/30 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            {/* Icon */}
            <div className="flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mx-auto mb-6">
              <span className="text-3xl">⚠️</span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-white text-center mb-2">
              Something went wrong
            </h2>

            {/* Description */}
            <p className="text-gray-400 text-center text-sm mb-6">
              An unexpected error occurred in this part of the application. Try
              resetting or refreshing the page.
            </p>

            {/* Error message */}
            {this.state.error && (
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <p className="text-red-400 text-xs font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Error info (component stack) */}
            {this.state.errorInfo && (
              <details className="mb-6">
                <summary className="text-gray-500 text-xs cursor-pointer hover:text-gray-300 transition-colors">
                  Show component stack
                </summary>
                <pre className="mt-2 text-gray-600 text-xs overflow-auto max-h-40 bg-gray-800 rounded p-3">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
