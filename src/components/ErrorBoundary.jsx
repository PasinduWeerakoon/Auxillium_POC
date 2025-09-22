import React from 'react';
import { Result, Button } from 'antd';
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    const isResizeObserverError = (err) => {
      const message = err?.message || '';
      return message.includes('ResizeObserver loop completed with undelivered notifications') ||
             message.includes('ResizeObserver loop limit exceeded') ||
             message.includes('ResizeObserver');
    };
    if (isResizeObserverError(error)) {
      return { hasError: false };
    }
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    const isResizeObserverError = (err) => {
      const message = err?.message || '';
      return message.includes('ResizeObserver loop completed with undelivered notifications') ||
             message.includes('ResizeObserver loop limit exceeded') ||
             message.includes('ResizeObserver');
    };
    if (isResizeObserverError(error)) {
      this.setState({ hasError: false });
      return;
    }
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }
  handleReload = () => {
    window.location.reload();
  };
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '50px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '100vh'
        }}>
          <Result
            status="error"
            title="Something went wrong"
            subTitle="An unexpected error occurred. Please try reloading the page."
            extra={[
              <Button type="primary" onClick={this.handleReload} key="reload">
                Reload Page
              </Button>,
              <Button key="home" onClick={() => window.location.href = '/'}>
                Go Home
              </Button>
            ]}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
