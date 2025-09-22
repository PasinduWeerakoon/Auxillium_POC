import * as Yup from 'yup';
import { get } from './utils';
export const createYupSchema = (fields, allValues = {}) => {
    const shape = {};
    fields.forEach(field => {
        if (!field.name) return;
        const fieldSchema = createFieldSchema(field, allValues);
        if (fieldSchema) {
            setNestedSchema(shape, field.name, fieldSchema);
        }
    });
    return Yup.object().shape(shape);
};
const createFieldSchema = (field, allValues) => {
    const { validation, required, requiredWhen, type } = field;
    if (!validation && !required && !requiredWhen) {
        return null;
    }
    let schema;
    switch (type) {
        case 'text':
        case 'textarea':
        case 'select':
        case 'radio':
        case 'richtext':
            schema = Yup.string();
            break;
        case 'number':
        case 'slider':
            schema = Yup.number();
            break;
        case 'date':
        case 'time':
        case 'datetime':
            schema = Yup.date();
            break;
        case 'checkbox':
        case 'switch':
            schema = Yup.boolean();
            break;
        case 'array':
            schema = Yup.array();
            break;
        default:
            schema = Yup.mixed();
    }
    if (validation) {
        schema = applyValidationRules(schema, validation, type);
    }
    if (required) {
        schema = schema.required(validation?.requiredMessage || `${field.label || field.name} is required`);
    } else if (requiredWhen) {
        schema = schema.when([], {
            is: () => evaluateConditions(requiredWhen, allValues),
            then: (schema) => schema.required(validation?.requiredMessage || `${field.label || field.name} is required`),
            otherwise: (schema) => schema.nullable()
        });
    }
    return schema;
};
const applyValidationRules = (schema, validation, fieldType) => {
    const { type, min, max, regex, email, url, integer, positive, oneOf, message } = validation;
    if (type === 'string' || fieldType === 'text' || fieldType === 'textarea') {
        if (min !== undefined) {
            schema = schema.min(min, message || `Must be at least ${min} characters`);
        }
        if (max !== undefined) {
            schema = schema.max(max, message || `Must be at most ${max} characters`);
        }
        if (regex) {
            const regexObj = new RegExp(regex);
            schema = schema.matches(regexObj, message || 'Invalid format');
        }
        if (email) {
            schema = schema.email(message || 'Invalid email address');
        }
        if (url) {
            schema = schema.url(message || 'Invalid URL');
        }
    }
    if (type === 'number' || fieldType === 'number' || fieldType === 'slider') {
        if (min !== undefined) {
            schema = schema.min(min, message || `Must be at least ${min}`);
        }
        if (max !== undefined) {
            schema = schema.max(max, message || `Must be at most ${max}`);
        }
        if (integer) {
            schema = schema.integer(message || 'Must be an integer');
        }
        if (positive) {
            schema = schema.positive(message || 'Must be positive');
        }
    }
    if (type === 'date' || fieldType === 'date' || fieldType === 'datetime') {
        if (min) {
            schema = schema.min(new Date(min), message || `Must be after ${min}`);
        }
        if (max) {
            schema = schema.max(new Date(max), message || `Must be before ${max}`);
        }
    }
    if (type === 'array' || fieldType === 'array') {
        if (min !== undefined) {
            schema = schema.min(min, message || `Must have at least ${min} items`);
        }
        if (max !== undefined) {
            schema = schema.max(max, message || `Must have at most ${max} items`);
        }
    }
    if (oneOf) {
        schema = schema.oneOf(oneOf, message || 'Invalid selection');
    }
    return schema;
};
const setNestedSchema = (shape, path, schema) => {
    const keys = path.split('.');
    let current = shape;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key]) {
            current[key] = Yup.object().shape({});
        }
        if (current[key]._type !== 'object') {
            current[key] = Yup.object().shape({});
        }
        current = current[key].fields || (current[key].fields = {});
    }
    current[keys[keys.length - 1]] = schema;
};
const evaluateConditions = (conditions, values) => {
    if (!Array.isArray(conditions)) return false;
    return conditions.every(condition => {
        if (condition.js) {
            return true;
        }
        const { op, left, right } = condition;
        const leftValue = get(values, left);
        switch (op) {
            case 'eq':
                return leftValue === right;
            case 'ne':
                return leftValue !== right;
            case 'gt':
                return leftValue > right;
            case 'gte':
                return leftValue >= right;
            case 'lt':
                return leftValue < right;
            case 'lte':
                return leftValue <= right;
            case 'truthy':
                return !!leftValue;
            case 'falsy':
                return !leftValue;
            case 'empty':
                return !leftValue || leftValue === '' || (Array.isArray(leftValue) && leftValue.length === 0);
            case 'notEmpty':
                return leftValue && leftValue !== '' && (!Array.isArray(leftValue) || leftValue.length > 0);
            case 'in':
                return Array.isArray(right) && right.includes(leftValue);
            case 'notIn':
                return Array.isArray(right) && !right.includes(leftValue);
            default:
                return false;
        }
    });
};
export const createStepSchema = (step, allValues = {}) => {
    const fields = [];
    const collectFields = (container) => {
        if (container.fields) {
            fields.push(...container.fields);
        }
        if (container.sections) {
            container.sections.forEach(collectFields);
        }
        if (container.tabs) {
            container.tabs.forEach(collectFields);
        }
    };
    collectFields(step);
    return createYupSchema(fields, allValues);
};
