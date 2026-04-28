import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center p-8" style={{ backgroundColor: 'var(--bg-mica)' }}>
          <div className="text-center space-y-3">
            <div className="text-4xl">⚠️</div>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>页面渲染出错</p>
            <p className="text-xs max-w-xs break-all" style={{ color: 'var(--text-tertiary)' }}>{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="fluent-btn-primary text-sm mt-2"
            >
              重试
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
