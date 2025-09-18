import * as Yup from 'yup';
import { get } from './utils';

/**
 * Convert JSON validation config to Yup schema
 * @param {Array} fields - Array of field configurations
 * @param {Object} allValues - All form values (for conditional validation)
 * @returns {Object} Yup schema object
 */
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

/**
 * Create Yup schema for a single field
 * @param {Object} field - Field configuration
 * @param {Object} allValues - All form values
 * @returns {Object} Yup schema for the field
 */
const createFieldSchema = (field, allValues) => {
    const { validation, required, requiredWhen, type } = field;

    if (!validation && !required && !requiredWhen) {
        return null;
    }

    let schema;

    // Base schema based on field type
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

    // Apply validation rules
    if (validation) {
        schema = applyValidationRules(schema, validation, type);
    }

    // Handle required logic
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

/**
 * Apply validation rules to a Yup schema
 * @param {Object} schema - Yup schema
 * @param {Object} validation - Validation configuration
 * @param {string} fieldType - Field type
 * @returns {Object} Enhanced Yup schema
 */
const applyValidationRules = (schema, validation, fieldType) => {
    const { type, min, max, regex, email, url, integer, positive, oneOf, message } = validation;

    // String validations
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

    // Number validations
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

    // Date validations
    if (type === 'date' || fieldType === 'date' || fieldType === 'datetime') {
        if (min) {
            schema = schema.min(new Date(min), message || `Must be after ${min}`);
        }
        if (max) {
            schema = schema.max(new Date(max), message || `Must be before ${max}`);
        }
    }

    // Array validations
    if (type === 'array' || fieldType === 'array') {
        if (min !== undefined) {
            schema = schema.min(min, message || `Must have at least ${min} items`);
        }
        if (max !== undefined) {
            schema = schema.max(max, message || `Must have at most ${max} items`);
        }
    }

    // Enum validation
    if (oneOf) {
        schema = schema.oneOf(oneOf, message || 'Invalid selection');
    }

    return schema;
};

/**
 * Set nested schema in shape object using dot notation
 * @param {Object} shape - Shape object to modify
 * @param {string} path - Dot notation path
 * @param {Object} schema - Yup schema to set
 */
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

/**
 * Evaluate conditional logic for validation
 * @param {Array} conditions - Array of condition objects
 * @param {Object} values - Form values
 * @returns {boolean} True if conditions are met
 */
const evaluateConditions = (conditions, values) => {
    if (!Array.isArray(conditions)) return false;

    return conditions.every(condition => {
        if (condition.js) {
            // JavaScript expression evaluation would go here
            // For now, we'll handle basic cases
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

/**
 * Create validation schema for a specific step
 * @param {Object} step - Step configuration
 * @param {Object} allValues - All form values
 * @returns {Object} Yup schema for the step
 */
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
