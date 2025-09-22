import axios from 'axios';
import { get } from './utils';
const api = axios.create({
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);
export const loadApiOptions = async (config, formValues = {}) => {
    try {
        const { url, method = 'GET', params, headers, valueKey = 'value', labelKey = 'label' } = config;
        const resolvedUrl = replaceVariables(url, formValues);
        const resolvedParams = replaceVariables(params, formValues);
        let data;
        if (mockResponses[resolvedUrl]) {
            console.log(`Using mock data for ${resolvedUrl}`);
            data = mockResponses[resolvedUrl];
        } else {
            const response = await api.request({
                url: resolvedUrl,
                method,
                params: resolvedParams,
                headers,
            });
            data = response.data;
        }
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
export const executeApiAction = async (action, formValues = {}) => {
    try {
        const { api: apiConfig } = action;
        const { url, method = 'POST', data, params, headers } = apiConfig;
        const resolvedUrl = replaceVariables(url, formValues);
        const resolvedData = replaceVariables(data || formValues, formValues);
        const resolvedParams = replaceVariables(params, formValues);
        if (mockResponses[resolvedUrl]) {
            console.log(`Using mock response for API action: ${resolvedUrl}`);
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
export const addMockResponse = (url, data) => {
    mockResponses[url] = data;
};
export default api;
