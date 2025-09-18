import React from 'react';
import { Result, Button } from 'antd';

/**
 * Error Boundary component to catch and handle React errors gracefully
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Helper function to check if error is ResizeObserver related
    const isResizeObserverError = (err) => {
      const message = err?.message || '';
      return message.includes('ResizeObserver loop completed with undelivered notifications') ||
             message.includes('ResizeObserver loop limit exceeded') ||
             message.includes('ResizeObserver');
    };

    // Immediately ignore ResizeObserver errors
    if (isResizeObserverError(error)) {
      return { hasError: false };
    }
    
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Helper function to check if error is ResizeObserver related
    const isResizeObserverError = (err) => {
      const message = err?.message || '';
      return message.includes('ResizeObserver loop completed with undelivered notifications') ||
             message.includes('ResizeObserver loop limit exceeded') ||
             message.includes('ResizeObserver');
    };

    // Suppress ResizeObserver errors as they're harmless
    if (isResizeObserverError(error)) {
      this.setState({ hasError: false });
      return;
    }

    // Log other errors
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
      // Render fallback UI
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
