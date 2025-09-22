import React from 'react';
class ResizeObserverErrorHandler extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    const isResizeObserverError = (err) => {
      const message = err?.message || '';
      const stack = err?.stack || '';
      return message.includes('ResizeObserver loop completed with undelivered notifications') ||
             message.includes('ResizeObserver loop limit exceeded') ||
             stack.includes('ResizeObserver') ||
             message.includes('ResizeObserver');
    };
    if (isResizeObserverError(error)) {
      return { hasError: false };
    }
    throw error;
  }
  componentDidCatch(error, errorInfo) {
    const isResizeObserverError = (err) => {
      const message = err?.message || '';
      const stack = err?.stack || '';
      return message.includes('ResizeObserver loop completed with undelivered notifications') ||
             message.includes('ResizeObserver loop limit exceeded') ||
             stack.includes('ResizeObserver') ||
             message.includes('ResizeObserver');
    };
    if (isResizeObserverError(error)) {
      this.setState({ hasError: false });
      return;
    }
    throw error;
  }
  componentDidMount() {
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
