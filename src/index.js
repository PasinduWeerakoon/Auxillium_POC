import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { router } from './app/routes';
import ErrorBoundary from './components/ErrorBoundary';
import ResizeObserverErrorHandler from './components/ResizeObserverErrorHandler';
import './index.css';
const suppressResizeObserverWarnings = () => {
    const originalError = window.console.error;
    const originalWarn = window.console.warn;
    const isResizeObserverError = (message) => {
        const msg = typeof message === 'string' ? message : message?.toString?.() || '';
        return msg.includes('ResizeObserver loop completed with undelivered notifications') ||
            msg.includes('ResizeObserver loop limit exceeded');
    };
    window.console.error = (...args) => {
        if (isResizeObserverError(args[0])) {
            return;
        }
        originalError(...args);
    };
    window.console.warn = (...args) => {
        if (isResizeObserverError(args[0])) {
            return;
        }
        originalWarn(...args);
    };
    window.addEventListener('error', (event) => {
        if (isResizeObserverError(event.message) || isResizeObserverError(event.error?.message)) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
        }
    });
    window.addEventListener('unhandledrejection', (event) => {
        if (isResizeObserverError(event.reason?.message) || isResizeObserverError(event.reason)) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
        }
    });
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
                    }
                });
            }
        };
    }
};
suppressResizeObserverWarnings();
const setupAggressiveErrorSuppression = () => {
    const originalOnError = window.onerror;
    window.onerror = function (message, source, lineno, colno, error) {
        if (typeof message === 'string' && message.includes('ResizeObserver loop completed with undelivered notifications')) {
            return true;
        }
        if (originalOnError) {
            return originalOnError.apply(this, arguments);
        }
        return false;
    };
    if (process.env.NODE_ENV === 'development') {
        const originalReportRuntimeError = window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__?.onUnhandledError;
        if (originalReportRuntimeError) {
            window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__.onUnhandledError = function (error) {
                if (error?.message?.includes('ResizeObserver loop completed with undelivered notifications')) {
                    return;
                }
                return originalReportRuntimeError.call(this, error);
            };
        }
        const originalHandleRuntimeError = window.__CRA_ERROR_OVERLAY__?.handleRuntimeError;
        if (originalHandleRuntimeError) {
            window.__CRA_ERROR_OVERLAY__.handleRuntimeError = function (error) {
                if (error?.message?.includes('ResizeObserver loop completed with undelivered notifications')) {
                    return;
                }
                return originalHandleRuntimeError.call(this, error);
            };
        }
    }
    const tryToFindHandleError = () => {
        try {
            if (window.__webpack_require__?.cache) {
                Object.keys(window.__webpack_require__.cache).forEach(key => {
                    const module = window.__webpack_require__.cache[key];
                    if (module?.exports?.handleError) {
                        const originalHandleError = module.exports.handleError;
                        module.exports.handleError = function (error) {
                            if (error?.message?.includes('ResizeObserver loop completed with undelivered notifications')) {
                                return;
                            }
                            return originalHandleError.call(this, error);
                        };
                    }
                });
            }
        } catch (e) {
        }
    };
    tryToFindHandleError();
    setTimeout(tryToFindHandleError, 100);
    setTimeout(tryToFindHandleError, 1000);
};
setupAggressiveErrorSuppression();
window.addEventListener('DOMContentLoaded', setupAggressiveErrorSuppression);
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
                            return;
                        }
                        throw error;
                    }
                }, 16);
            };
            super(debouncedCallback);
        }
    };
}
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
