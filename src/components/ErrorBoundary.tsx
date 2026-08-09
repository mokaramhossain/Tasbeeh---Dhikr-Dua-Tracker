import React from 'react';

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Without this, any render error leaves an installed PWA showing a permanently
 * blank screen with no way back — the user cannot even reach a settings page to
 * clear the bad state. The fallback offers a reload and, as a last resort, a
 * way to clear stored app data.
 */
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Dhikr Tracker crashed:', error, info.componentStack);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearData = () => {
    const confirmed = window.confirm(
      'This will erase your saved counts, favourites and settings on this device. Continue?'
    );
    if (!confirmed) return;
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith('dhikr-'))
        .forEach((key) => localStorage.removeItem(key));
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen bg-bg text-text-main flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-xl">
          <h1 className="text-xl font-bold text-gold-ink mb-3">Something went wrong</h1>
          <p className="text-sm text-text-sub leading-relaxed mb-6">
            The app hit an unexpected error. Reloading usually fixes it. Your saved data is untouched.
          </p>
          <button
            onClick={this.handleReload}
            className="w-full py-3.5 bg-gold text-on-gold font-bold rounded-2xl transition-colors hover:bg-gold/90"
          >
            Reload app
          </button>
          <button
            onClick={this.handleClearData}
            className="mt-3 w-full py-3 text-xs font-bold uppercase tracking-widest text-text-muted transition-colors hover:text-red-400"
          >
            Reset app data
          </button>
          <p className="mt-6 text-[10px] font-mono text-text-muted break-words opacity-70">{error.message}</p>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
