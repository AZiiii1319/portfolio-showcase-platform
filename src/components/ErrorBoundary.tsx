import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#fee', border: '1px solid #fcc' }}>
          <h1>出现错误了！</h1>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>错误详情</summary>
            {this.state.error?.toString()}
            {this.state.error?.stack}
          </details>
          <button 
            onClick={() => this.setState({ hasError: false })}
            style={{ marginTop: '10px', padding: '5px 10px' }}
          >
            重试
          </button>
        </div>
      )
    }

    return this.props.children
  }
}