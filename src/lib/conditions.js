import { get, safeEval } from './utils';
import { isRoleVisible } from './roles';
export const isVisible = (values, field, userRole = null) => {
    if (userRole && !isRoleVisible(userRole, field)) {
        return false;
    }
    if (!field.visibleWhen) return true;
    return evaluateConditions(field.visibleWhen, values);
};
export const isEnabled = (values, field) => {
    if (!field.enabledWhen) return true;
    return evaluateConditions(field.enabledWhen, values);
};
export const isRequired = (values, field) => {
    if (field.required) return true;
    if (!field.requiredWhen) return false;
    return evaluateConditions(field.requiredWhen, values);
};
export const evaluateConditions = (conditions, values) => {
    if (!Array.isArray(conditions)) return false;
    if (conditions.length === 0) return true;
    return conditions.every(condition => evaluateCondition(condition, values));
};
export const evaluateCondition = (condition, values) => {
    if (condition.js) {
        return !!safeEval(condition.js, values);
    }
    const { op, left, right } = condition;
    if (!op || left === undefined) return false;
    const leftValue = get(values, left);
    switch (op) {
        case 'eq':
        case '==':
        case '===':
            return leftValue === right;
        case 'ne':
        case '!=':
        case '!==':
            return leftValue !== right;
        case 'gt':
        case '>':
            return Number(leftValue) > Number(right);
        case 'gte':
        case '>=':
            return Number(leftValue) >= Number(right);
        case 'lt':
        case '<':
            return Number(leftValue) < Number(right);
        case 'lte':
        case '<=':
            return Number(leftValue) <= Number(right);
        case 'truthy':
            return !!leftValue;
        case 'falsy':
            return !leftValue;
        case 'empty':
            return isEmpty(leftValue);
        case 'notEmpty':
            return !isEmpty(leftValue);
        case 'in':
            return Array.isArray(right) && right.includes(leftValue);
        case 'notIn':
            return Array.isArray(right) && !right.includes(leftValue);
        case 'contains':
            if (typeof leftValue === 'string') {
                return leftValue.includes(right);
            }
            if (Array.isArray(leftValue)) {
                return leftValue.includes(right);
            }
            return false;
        case 'startsWith':
            return typeof leftValue === 'string' && leftValue.startsWith(right);
        case 'endsWith':
            return typeof leftValue === 'string' && leftValue.endsWith(right);
        case 'regex':
            if (typeof leftValue !== 'string') return false;
            try {
                const regex = new RegExp(right);
                return regex.test(leftValue);
            } catch {
                return false;
            }
        case 'between':
            if (Array.isArray(right) && right.length === 2) {
                const numValue = Number(leftValue);
                return numValue >= Number(right[0]) && numValue <= Number(right[1]);
            }
            return false;
        default:
            console.warn(`Unknown condition operator: ${op}`);
            return false;
    }
};
const isEmpty = (value) => {
    if (value == null) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    if (typeof value === 'number') return isNaN(value);
    return false;
};
export const evaluateComputed = (computed, values) => {
    if (!computed || !computed.expr) return undefined;
    try {
        const context = { ...values };
        if (computed.deps && Array.isArray(computed.deps)) {
            const depContext = {};
            computed.deps.forEach(dep => {
                depContext[dep] = get(values, dep);
            });
            Object.assign(context, depContext);
        }
        return safeEval(computed.expr, context);
    } catch (error) {
        console.warn('Computed field evaluation failed:', computed.expr, error);
        return undefined;
    }
};
export const getComputedDependencies = (fields) => {
    const dependencies = {};
    const processField = (field) => {
        if (field.computed && field.computed.deps) {
            dependencies[field.name] = field.computed.deps;
        }
        if (field.fields) {
            Object.assign(dependencies, getComputedDependencies(field.fields));
        }
    };
    fields.forEach(processField);
    return dependencies;
};
export const getFieldsToRecalculate = (prevValues, currentValues, dependencies) => {
    const fieldsToRecalc = [];
    Object.entries(dependencies).forEach(([fieldName, deps]) => {
        const needsRecalc = deps.some(dep => {
            const prevValue = get(prevValues, dep);
            const currentValue = get(currentValues, dep);
            return prevValue !== currentValue;
        });
        if (needsRecalc) {
            fieldsToRecalc.push(fieldName);
        }
    });
    return fieldsToRecalc;
};
