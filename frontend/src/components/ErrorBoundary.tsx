import { Component, type ErrorInfo, type ReactNode } from "react";

interface State {
  error: Error | null;
}

/** Shows the error on screen instead of leaving a blank page. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App crashed:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto max-w-2xl p-8">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm">The page hit an unexpected error. Details (also in the browser console):</p>
        <pre className="mt-3 overflow-auto rounded-lg bg-sage-100 p-4 text-xs">{this.state.error.message}</pre>
        <button className="btn-primary mt-4" onClick={() => window.location.assign("/")}>Reload</button>
      </div>
    );
  }
}