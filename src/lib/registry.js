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
    group: null, 
};
let customRegistry = {};
export const getFieldComponent = (type) => {
    return customRegistry[type] || defaultRegistry[type] || null;
};
export const registerFieldComponent = (type, component) => {
    customRegistry[type] = component;
};
export const unregisterFieldComponent = (type) => {
    delete customRegistry[type];
};
export const getRegisteredTypes = () => {
    return [
        ...Object.keys(defaultRegistry),
        ...Object.keys(customRegistry)
    ];
};
export const isTypeRegistered = (type) => {
    return !!(customRegistry[type] || defaultRegistry[type]);
};
export const resetCustomRegistry = () => {
    customRegistry = {};
};
export const getDefaultRegistry = () => {
    return { ...defaultRegistry };
};
export const getCustomRegistry = () => {
    return { ...customRegistry };
};
export const registerFieldComponents = (components) => {
    Object.entries(components).forEach(([type, component]) => {
        registerFieldComponent(type, component);
    });
};
export const FIELD_CATEGORIES = {
    TEXT: ['text', 'textarea', 'richtext'],
    NUMERIC: ['number', 'slider'],
    SELECTION: ['select', 'radio', 'checkbox'],
    DATE_TIME: ['date', 'time', 'datetime'],
    BOOLEAN: ['switch', 'checkbox'],
    COMPLEX: ['array', 'table', 'group'],
    SPECIAL: ['color', 'upload'],
};
export const getFieldCategory = (type) => {
    for (const [category, types] of Object.entries(FIELD_CATEGORIES)) {
        if (types.includes(type)) {
            return category;
        }
    }
    return null;
};
export const getFieldTypesByCategory = (category) => {
    return FIELD_CATEGORIES[category] || [];
};
