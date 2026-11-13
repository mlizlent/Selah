import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('ErrorBoundary caught:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <span className="text-d-headline">⚠️</span>
          </span>
          <h2 className="font-display text-d-title font-semibold text-ink-800">Something went wrong</h2>
          <p className="max-w-sm text-d-body text-ink-500">
            We hit an unexpected error. Please refresh the page to try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Refresh page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
