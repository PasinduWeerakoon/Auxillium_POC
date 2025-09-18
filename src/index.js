import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { router } from './app/routes';
import ErrorBoundary from './components/ErrorBoundary';
import ResizeObserverErrorHandler from './components/ResizeObserverErrorHandler';
import './index.css';

// Suppress ResizeObserver loop warnings (common in React apps with Monaco Editor + Ant Design)
const suppressResizeObserverWarnings = () => {
    // Store original console methods
    const originalError = window.console.error;
    const originalWarn = window.console.warn;

    // Helper function to check if message contains ResizeObserver error
    const isResizeObserverError = (message) => {
        const msg = typeof message === 'string' ? message : message?.toString?.() || '';
        return msg.includes('ResizeObserver loop completed with undelivered notifications') ||
            msg.includes('ResizeObserver loop limit exceeded');
    };

    // Suppress console errors
    window.console.error = (...args) => {
        if (isResizeObserverError(args[0])) {
            return;
        }
        originalError(...args);
    };

    // Suppress console warnings
    window.console.warn = (...args) => {
        if (isResizeObserverError(args[0])) {
            return;
        }
        originalWarn(...args);
    };

    // Global error handler to catch uncaught errors
    window.addEventListener('error', (event) => {
        if (isResizeObserverError(event.message) || isResizeObserverError(event.error?.message)) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
        }
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        if (isResizeObserverError(event.reason?.message) || isResizeObserverError(event.reason)) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
        }
    });

    // Override the native ResizeObserver to catch errors at the source
    if (window.ResizeObserver) {
        const OriginalResizeObserver = window.ResizeObserver;
        window.ResizeObserver = class extends OriginalResizeObserver {
            constructor(callback) {
                super((entries, observer) => {
                    try {
                        callback(entries, observer);
                    } catch (error) {
                        if (!isResizeObserverError(error.message)) {
                            throw error;
                        }
                        // Silently ignore ResizeObserver errors
                    }
                });
            }
        };
    }
};

suppressResizeObserverWarnings();

// Additional aggressive ResizeObserver error suppression
const setupAggressiveErrorSuppression = () => {
    // Override React's error handling for ResizeObserver errors
    const originalOnError = window.onerror;
    window.onerror = function (message, source, lineno, colno, error) {
        if (typeof message === 'string' && message.includes('ResizeObserver loop completed with undelivered notifications')) {
            return true; // Prevent default error handling
        }
        if (originalOnError) {
            return originalOnError.apply(this, arguments);
        }
        return false;
    };

    // More aggressive error suppression for React dev tools and error overlay
    if (process.env.NODE_ENV === 'development') {
        // Override React's error overlay reporting
        const originalReportRuntimeError = window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__?.onUnhandledError;
        if (originalReportRuntimeError) {
            window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__.onUnhandledError = function (error) {
                if (error?.message?.includes('ResizeObserver loop completed with undelivered notifications')) {
                    return; // Don't show in error overlay
                }
                return originalReportRuntimeError.call(this, error);
            };
        }

        // Override Create React App's error reporting
        const originalHandleRuntimeError = window.__CRA_ERROR_OVERLAY__?.handleRuntimeError;
        if (originalHandleRuntimeError) {
            window.__CRA_ERROR_OVERLAY__.handleRuntimeError = function (error) {
                if (error?.message?.includes('ResizeObserver loop completed with undelivered notifications')) {
                    return; // Don't show in error overlay
                }
                return originalHandleRuntimeError.call(this, error);
            };
        }
    }

    // Handle errors from React's error boundaries and webpack
    const tryToFindHandleError = () => {
        try {
            // Look for webpack's error handling
            if (window.__webpack_require__?.cache) {
                Object.keys(window.__webpack_require__.cache).forEach(key => {
                    const module = window.__webpack_require__.cache[key];
                    if (module?.exports?.handleError) {
                        const originalHandleError = module.exports.handleError;
                        module.exports.handleError = function (error) {
                            if (error?.message?.includes('ResizeObserver loop completed with undelivered notifications')) {
                                return; // Silently ignore
                            }
                            return originalHandleError.call(this, error);
                        };
                    }
                });
            }
        } catch (e) {
            // Ignore errors in error handling override
        }
    };

    // Try immediately and after DOM is ready
    tryToFindHandleError();
    setTimeout(tryToFindHandleError, 100);
    setTimeout(tryToFindHandleError, 1000);
};

// Run immediately and after DOM content loads
setupAggressiveErrorSuppression();
window.addEventListener('DOMContentLoaded', setupAggressiveErrorSuppression);

// Debounced ResizeObserver to reduce frequency of observations
if (window.ResizeObserver) {
    const OriginalResizeObserver = window.ResizeObserver;
    window.ResizeObserver = class extends OriginalResizeObserver {
        constructor(callback) {
            let timeoutId;
            const debouncedCallback = (entries, observer) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    try {
                        callback(entries, observer);
                    } catch (error) {
                        if (error?.message?.includes('ResizeObserver loop completed with undelivered notifications')) {
                            // Silently ignore
                            return;
                        }
                        throw error;
                    }
                }, 16); // ~60fps debouncing
            };
            super(debouncedCallback);
        }
    };
}

// Configure Ant Design globally
const antdConfig = {
    theme: {
        token: {
            colorPrimary: '#1677ff',
        },
    },
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ResizeObserverErrorHandler>
            <ErrorBoundary>
                <ConfigProvider {...antdConfig}>
                    <RouterProvider router={router} />
                </ConfigProvider>
            </ErrorBoundary>
        </ResizeObserverErrorHandler>
    </React.StrictMode>
);

