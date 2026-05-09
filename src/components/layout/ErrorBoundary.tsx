import React from 'react';

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-3 p-8">
          <p className="text-white/50 text-sm text-center">表示中にエラーが発生しました</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-accent text-sm underline"
          >
            再試行
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
