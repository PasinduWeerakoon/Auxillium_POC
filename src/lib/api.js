import axios from 'axios';
import { get } from './utils';

/**
 * Configure axios defaults
 */
const api = axios.create({
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Response interceptor for handling errors
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

/**
 * Load options from API endpoint
 * @param {Object} config - API configuration
 * @param {Object} formValues - Current form values for dynamic URLs
 * @returns {Promise<Array>} Array of options
 */
export const loadApiOptions = async (config, formValues = {}) => {
    try {
        const { url, method = 'GET', params, headers, valueKey = 'value', labelKey = 'label' } = config;

        // Replace variables in URL with form values
        const resolvedUrl = replaceVariables(url, formValues);
        const resolvedParams = replaceVariables(params, formValues);

        // Check if we have mock data for this URL
        let data;
        if (mockResponses[resolvedUrl]) {
            console.log(`Using mock data for ${resolvedUrl}`);
            data = mockResponses[resolvedUrl];
        } else {
            // Fall back to real API call
            const response = await api.request({
                url: resolvedUrl,
                method,
                params: resolvedParams,
                headers,
            });
            data = response.data;
        }

        // Handle different response formats
        if (Array.isArray(data)) {
            return data.map(item => ({
                label: get(item, labelKey, item[labelKey] || item.label || item.name || String(item)),
                value: get(item, valueKey, item[valueKey] || item.value || item.id || item),
            }));
        }

        if (data && Array.isArray(data.data)) {
            return data.data.map(item => ({
                label: get(item, labelKey, item[labelKey] || item.label || item.name || String(item)),
                value: get(item, valueKey, item[valueKey] || item.value || item.id || item),
            }));
        }

        if (data && Array.isArray(data.options)) {
            return data.options.map(item => ({
                label: get(item, labelKey, item[labelKey] || item.label || item.name || String(item)),
                value: get(item, valueKey, item[valueKey] || item.value || item.id || item),
            }));
        }

        console.warn('Unexpected API response format:', data);
        return [];
    } catch (error) {
        console.error('Failed to load API options:', error);
        return [];
    }
};

/**
 * Execute custom API action
 * @param {Object} action - Action configuration
 * @param {Object} formValues - Current form values
 * @returns {Promise<*>} API response
 */
export const executeApiAction = async (action, formValues = {}) => {
    try {
        const { api: apiConfig } = action;
        const { url, method = 'POST', data, params, headers } = apiConfig;

        // Replace variables in configuration
        const resolvedUrl = replaceVariables(url, formValues);
        const resolvedData = replaceVariables(data || formValues, formValues);
        const resolvedParams = replaceVariables(params, formValues);

        // Check if we have mock response for this URL
        if (mockResponses[resolvedUrl]) {
            console.log(`Using mock response for API action: ${resolvedUrl}`);
            // For actions, we'll just return a success response
            return { success: true, message: 'Action completed successfully (mock)' };
        }

        const response = await api.request({
            url: resolvedUrl,
            method,
            data: resolvedData,
            params: resolvedParams,
            headers,
        });

        return response.data;
    } catch (error) {
        console.error('API action failed:', error);
        throw error;
    }
};

/**
 * Replace variables in a string or object with form values
 * @param {*} template - Template string or object with variables
 * @param {Object} values - Values to replace variables with
 * @returns {*} Resolved template
 */
const replaceVariables = (template, values) => {
    if (typeof template === 'string') {
        return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
            const value = get(values, path);
            return value !== undefined ? String(value) : match;
        });
    }

    if (Array.isArray(template)) {
        return template.map(item => replaceVariables(item, values));
    }

    if (template && typeof template === 'object') {
        const resolved = {};
        Object.entries(template).forEach(([key, value]) => {
            resolved[key] = replaceVariables(value, values);
        });
        return resolved;
    }

    return template;
};

/**
 * Validate API configuration
 * @param {Object} config - API configuration
 * @returns {boolean} True if configuration is valid
 */
export const validateApiConfig = (config) => {
    if (!config || typeof config !== 'object') {
        return false;
    }

    if (!config.url || typeof config.url !== 'string') {
        return false;
    }

    const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    if (config.method && !validMethods.includes(config.method.toUpperCase())) {
        return false;
    }

    return true;
};

/**
 * Mock API responses for development/testing
 */
const mockResponses = {
    '/api/countries': [
        { code: 'US', name: 'United States' },
        { code: 'CA', name: 'Canada' },
        { code: 'UK', name: 'United Kingdom' },
        { code: 'AU', name: 'Australia' },
        { code: 'DE', name: 'Germany' },
        { code: 'FR', name: 'France' },
        { code: 'JP', name: 'Japan' },
        { code: 'IN', name: 'India' },
    ],
    '/api/drafts': { success: true, message: 'Draft saved successfully', id: 'draft_123' },
    '/api/states': [
        { code: 'CA', name: 'California' },
        { code: 'NY', name: 'New York' },
        { code: 'TX', name: 'Texas' },
        { code: 'FL', name: 'Florida' },
    ],
    '/api/cities': [
        { code: 'SF', name: 'San Francisco' },
        { code: 'LA', name: 'Los Angeles' },
        { code: 'NYC', name: 'New York City' },
        { code: 'CHI', name: 'Chicago' },
    ],
};

/**
 * Enable mock mode for testing
 * @param {boolean} enabled - Whether to enable mock mode
 */
export const setMockMode = (enabled) => {
    if (enabled) {
        api.interceptors.request.use((config) => {
            const mockData = mockResponses[config.url];
            if (mockData) {
                return Promise.reject({
                    config,
                    response: { data: mockData, status: 200 },
                });
            }
            return config;
        });
    }
};

/**
 * Add mock response
 * @param {string} url - URL to mock
 * @param {*} data - Mock response data
 */
export const addMockResponse = (url, data) => {
    mockResponses[url] = data;
};

export default api;
