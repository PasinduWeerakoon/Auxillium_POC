// Field component registry - maps field type to renderer component
import TextField from '../components/Fields/TextField';
import TextAreaField from '../components/Fields/TextAreaField';
import NumberField from '../components/Fields/NumberField';
import SelectField from '../components/Fields/SelectField';
import RadioGroupField from '../components/Fields/RadioGroupField';
import CheckboxField from '../components/Fields/CheckboxField';
import SwitchField from '../components/Fields/SwitchField';
import DateField from '../components/Fields/DateField';
import TimeField from '../components/Fields/TimeField';
import DateTimeField from '../components/Fields/DateTimeField';
import SliderField from '../components/Fields/SliderField';
import ColorField from '../components/Fields/ColorField';
import UploadField from '../components/Fields/UploadField';
import RichTextField from '../components/Fields/RichTextField';
import ArrayField from '../components/JsonFormRenderer/ArrayField';
import TableRenderer from '../components/JsonFormRenderer/TableRenderer';

/**
 * Default field type to component mapping
 */
const defaultRegistry = {
    text: TextField,
    textarea: TextAreaField,
    number: NumberField,
    select: SelectField,
    radio: RadioGroupField,
    checkbox: CheckboxField,
    switch: SwitchField,
    date: DateField,
    time: TimeField,
    datetime: DateTimeField,
    slider: SliderField,
    color: ColorField,
    upload: UploadField,
    richtext: RichTextField,
    array: ArrayField,
    table: TableRenderer,
    group: null, // Will be handled by Section component
};

/**
 * Custom field registry for user-defined components
 */
let customRegistry = {};

/**
 * Get component for a field type
 * @param {string} type - Field type
 * @returns {React.Component|null} Component for the field type
 */
export const getFieldComponent = (type) => {
    return customRegistry[type] || defaultRegistry[type] || null;
};

/**
 * Register a custom field component
 * @param {string} type - Field type
 * @param {React.Component} component - Component to register
 */
export const registerFieldComponent = (type, component) => {
    customRegistry[type] = component;
};

/**
 * Unregister a custom field component
 * @param {string} type - Field type
 */
export const unregisterFieldComponent = (type) => {
    delete customRegistry[type];
};

/**
 * Get all registered field types
 * @returns {Array} Array of registered field types
 */
export const getRegisteredTypes = () => {
    return [
        ...Object.keys(defaultRegistry),
        ...Object.keys(customRegistry)
    ];
};

/**
 * Check if a field type is registered
 * @param {string} type - Field type
 * @returns {boolean} True if type is registered
 */
export const isTypeRegistered = (type) => {
    return !!(customRegistry[type] || defaultRegistry[type]);
};

/**
 * Reset custom registry (useful for testing)
 */
export const resetCustomRegistry = () => {
    customRegistry = {};
};

/**
 * Get the default registry (read-only)
 * @returns {Object} Default field type registry
 */
export const getDefaultRegistry = () => {
    return { ...defaultRegistry };
};

/**
 * Get the custom registry (read-only)
 * @returns {Object} Custom field type registry
 */
export const getCustomRegistry = () => {
    return { ...customRegistry };
};

/**
 * Batch register multiple field components
 * @param {Object} components - Object mapping field types to components
 */
export const registerFieldComponents = (components) => {
    Object.entries(components).forEach(([type, component]) => {
        registerFieldComponent(type, component);
    });
};

/**
 * Field type categories for UI organization
 */
export const FIELD_CATEGORIES = {
    TEXT: ['text', 'textarea', 'richtext'],
    NUMERIC: ['number', 'slider'],
    SELECTION: ['select', 'radio', 'checkbox'],
    DATE_TIME: ['date', 'time', 'datetime'],
    BOOLEAN: ['switch', 'checkbox'],
    COMPLEX: ['array', 'table', 'group'],
    SPECIAL: ['color', 'upload'],
};

/**
 * Get field category for a field type
 * @param {string} type - Field type
 * @returns {string|null} Category name or null if not found
 */
export const getFieldCategory = (type) => {
    for (const [category, types] of Object.entries(FIELD_CATEGORIES)) {
        if (types.includes(type)) {
            return category;
        }
    }
    return null;
};

/**
 * Get all field types in a category
 * @param {string} category - Category name
 * @returns {Array} Array of field types in the category
 */
export const getFieldTypesByCategory = (category) => {
    return FIELD_CATEGORIES[category] || [];
};
