import React from 'react';

/**
 * Specialized error boundary specifically for ResizeObserver errors
 * This handles errors that escape other suppression methods
 */
class ResizeObserverErrorHandler extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Check if this is a ResizeObserver error
    const isResizeObserverError = (err) => {
      const message = err?.message || '';
      const stack = err?.stack || '';
      return message.includes('ResizeObserver loop completed with undelivered notifications') ||
             message.includes('ResizeObserver loop limit exceeded') ||
             stack.includes('ResizeObserver') ||
             message.includes('ResizeObserver');
    };

    if (isResizeObserverError(error)) {
      // Don't show error UI for ResizeObserver errors
      return { hasError: false };
    }

    // Let other errors bubble up to parent error boundaries
    throw error;
  }

  componentDidCatch(error, errorInfo) {
    // Check if this is a ResizeObserver error
    const isResizeObserverError = (err) => {
      const message = err?.message || '';
      const stack = err?.stack || '';
      return message.includes('ResizeObserver loop completed with undelivered notifications') ||
             message.includes('ResizeObserver loop limit exceeded') ||
             stack.includes('ResizeObserver') ||
             message.includes('ResizeObserver');
    };

    if (isResizeObserverError(error)) {
      // Silently handle ResizeObserver errors
      this.setState({ hasError: false });
      return;
    }

    // Re-throw other errors to be handled by parent boundaries
    throw error;
  }

  componentDidMount() {
    // Add additional error event listeners specific to this component
    const handleGlobalError = (event) => {
      const message = event.error?.message || event.message || '';
      if (message.includes('ResizeObserver loop completed with undelivered notifications')) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };

    window.addEventListener('error', handleGlobalError, true);
    
    // Store for cleanup
    this._globalErrorHandler = handleGlobalError;
  }

  componentWillUnmount() {
    if (this._globalErrorHandler) {
      window.removeEventListener('error', this._globalErrorHandler, true);
    }
  }

  render() {
    return this.props.children;
  }
}

export default ResizeObserverErrorHandler;
