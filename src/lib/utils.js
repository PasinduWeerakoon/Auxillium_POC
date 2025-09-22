import { Parser } from 'expr-eval';
export const get = (obj, path, defaultValue = undefined) => {
    if (!obj || !path) return defaultValue;
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
        if (result == null || typeof result !== 'object') {
            return defaultValue;
        }
        result = result[key];
    }
    return result === undefined ? defaultValue : result;
};
export const set = (obj, path, value) => {
    if (!obj || !path) return obj;
    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = obj;
    for (const key of keys) {
        if (!(key in target) || typeof target[key] !== 'object') {
            target[key] = {};
        }
        target = target[key];
    }
    target[lastKey] = value;
    return obj;
};
export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (Array.isArray(obj)) return obj.map(deepClone);
    const cloned = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
};
export const safeEval = (expression, context = {}) => {
    try {
        const parser = new Parser();
        const expr = parser.parse(expression);
        return expr.evaluate(context);
    } catch (error) {
        console.warn('Expression evaluation failed:', expression, error);
        return undefined;
    }
};
export const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
};
export const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
};
export const isEmpty = (value) => {
    if (value == null) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
};
export const flatten = (obj, prefix = '') => {
    const flattened = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                Object.assign(flattened, flatten(obj[key], newKey));
            } else {
                flattened[newKey] = obj[key];
            }
        }
    }
    return flattened;
};
export const extractFieldNames = (config) => {
    const fieldNames = [];
    const traverse = (item) => {
        if (item.fields) {
            item.fields.forEach(field => {
                if (field.name) {
                    fieldNames.push(field.name);
                }
                if (field.fields) {
                    traverse(field);
                }
            });
        }
        if (item.sections) {
            item.sections.forEach(traverse);
        }
        if (item.tabs) {
            item.tabs.forEach(traverse);
        }
    };
    traverse(config);
    return fieldNames;
};
