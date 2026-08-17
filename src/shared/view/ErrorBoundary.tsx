import { Component, ReactNode } from "react";


interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/**
 * 렌더링 중 발생한 에러로 뷰 전체가 unmount되어 빈 화면이 되는 것을 방지하는 error boundary
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div style={{ padding: "1em", color: "var(--text-normal)" }}>
          <h3>Daily Routine crashed</h3>
          <pre style={{
            whiteSpace: "pre-wrap",
            padding: "0.5em",
            border: "1px solid var(--background-modifier-border)",
            borderRadius: "4px",
            color: "var(--text-muted)",
            overflowX: "auto"
          }}>
            {error.message || String(error)}
          </pre>
          <button onClick={() => this.setState({ error: null })}>Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}
