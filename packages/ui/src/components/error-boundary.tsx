import { Component, type ErrorInfo, type ReactNode } from 'react';

export type ErrorBoundaryFallback = ReactNode | ((error: Error, reset: () => void) => ReactNode);

export type ErrorBoundaryProps = {
  children: ReactNode;
  fallback: ErrorBoundaryFallback;
  onError?: (error: Error, info: ErrorInfo) => void;
  resetKey?: string | number;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  componentDidUpdate(previousProps: ErrorBoundaryProps) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.reset();
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return typeof this.props.fallback === 'function'
        ? this.props.fallback(this.state.error, this.reset)
        : this.props.fallback;
    }

    return this.props.children;
  }
}
