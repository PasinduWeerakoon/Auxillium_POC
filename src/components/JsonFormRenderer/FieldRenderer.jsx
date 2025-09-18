import React, { useMemo } from 'react';
import { Form } from 'antd';
import { getFieldComponent } from '../../lib/registry';
import { isVisible, isEnabled, isRequired } from '../../lib/conditions';
import { get } from '../../lib/utils';

/**
 * Field Renderer component that maps field types to their respective components
 */
const FieldRenderer = ({ field, formikProps, formConfig, userRole }) => {
  const { values, errors, touched } = formikProps;

  // Check field visibility (including role-based)
  const visible = useMemo(() => isVisible(values, field, userRole), [values, field, userRole]);
  const enabled = useMemo(() => isEnabled(values, field), [values, field]);
  const required = useMemo(() => isRequired(values, field), [values, field]);

  // Don't render if not visible
  if (!visible) {
    return null;
  }

  // Get field component
  const FieldComponent = getFieldComponent(field.type);

  if (!FieldComponent) {
    console.warn(`Unknown field type: ${field.type}`);
    return (
      <Form.Item
        label={field.label}
        help={`Unknown field type: ${field.type}`}
        validateStatus="error"
      >
        <div style={{ padding: '8px', border: '1px dashed #ff4d4f', borderRadius: '4px' }}>
          Unknown field type: {field.type}
        </div>
      </Form.Item>
    );
  }

  // Handle group/container fields
  if (field.type === 'group' && field.fields) {
    return (
      <div className="field-group">
        {field.label && <h4>{field.label}</h4>}
        {field.fields.map((subField, index) => (
          <FieldRenderer
            key={subField.name || subField.id || index}
            field={subField}
            formikProps={formikProps}
            formConfig={formConfig}
            userRole={userRole}
          />
        ))}
      </div>
    );
  }

  // Get field error and touched status
  const fieldError = get(errors, field.name);
  const fieldTouched = get(touched, field.name);
  const hasError = fieldTouched && fieldError;

  // Create Form.Item props - filter out props that don't belong to Form.Item
  const {
    validateMessages,
    requiredMark,
    size: formSize,
    ...validFormItemProps
  } = formConfig || {};

  const formItemProps = {
    name: field.name,
    label: field.label,
    required,
    help: hasError ? fieldError : field.help,
    validateStatus: hasError ? 'error' : undefined,
    tooltip: field.tooltip,
    extra: field.extra,
    ...validFormItemProps,
  };

  // Override form config with field-specific settings
  if (field.labelCol) formItemProps.labelCol = field.labelCol;
  if (field.wrapperCol) formItemProps.wrapperCol = field.wrapperCol;
  if (field.labelAlign) formItemProps.labelAlign = field.labelAlign;
  if (field.colon !== undefined) formItemProps.colon = field.colon;

  // Field-specific props
  const fieldProps = {
    field,
    formikProps,
    disabled: !enabled,
    size: field.size || formSize,
    placeholder: field.placeholder,
    style: field.style,
    className: field.className,
  };

  // Add computed field styling
  if (field.computed && field.computed.readOnly) {
    fieldProps.disabled = true;
    fieldProps.className = `${fieldProps.className || ''} computed-field`.trim();
  }

  return (
    <Form.Item {...formItemProps}>
      <FieldComponent {...fieldProps} />
    </Form.Item>
  );
};

export default FieldRenderer;
