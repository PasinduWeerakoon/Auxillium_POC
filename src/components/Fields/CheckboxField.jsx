import React, { useState, useEffect } from 'react';
import { Checkbox } from 'antd';
import { useField } from 'formik';
import { loadApiOptions } from '../../lib/api';

/**
 * Checkbox Field component
 * Can render as single checkbox or checkbox group
 */
const CheckboxField = ({ 
  field, 
  formikProps, 
  disabled, 
  size, 
  style, 
  className 
}) => {
  const [formikField, meta] = useField(field.name);
  const { setFieldValue, setFieldTouched, values } = formikProps;
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Determine if this is a group or single checkbox
  const isGroup = field.options && (field.options.static || field.options.api);

  // Load options for checkbox group
  useEffect(() => {
    if (isGroup) {
      loadOptions();
    }
  }, [field.options, values, isGroup]);

  const loadOptions = async () => {
    if (!field.options) return;

    const { source, static: staticOptions, api } = field.options;

    if (source === 'static' && staticOptions) {
      setOptions(staticOptions);
    } else if (source === 'api' && api) {
      setLoading(true);
      try {
        const apiOptions = await loadApiOptions(api, values);
        setOptions(apiOptions);
      } catch (error) {
        console.error('Failed to load checkbox options:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSingleChange = (e) => {
    const checked = e.target.checked;
    setFieldValue(field.name, checked);
  };

  const handleGroupChange = (checkedValues) => {
    setFieldValue(field.name, checkedValues);
  };

  const handleBlur = () => {
    setFieldTouched(field.name, true);
  };

  // Single checkbox
  if (!isGroup) {
    return (
      <Checkbox
        checked={!!formikField.value}
        onChange={handleSingleChange}
        onBlur={handleBlur}
        disabled={disabled}
        style={style}
        className={className}
      >
        {field.checkboxLabel || field.label}
      </Checkbox>
    );
  }

  // Checkbox group
  const checkboxGroupProps = {
    value: formikField.value || [],
    onChange: handleGroupChange,
    onBlur: handleBlur,
    disabled,
    style,
    className,
  };

  // Handle different layouts
  const { layout = 'horizontal' } = field;

  if (layout === 'vertical') {
    return (
      <Checkbox.Group {...checkboxGroupProps}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {options.map((option, index) => (
            <Checkbox 
              key={option.value || index} 
              value={option.value}
              disabled={option.disabled || loading}
            >
              {option.label}
            </Checkbox>
          ))}
        </div>
      </Checkbox.Group>
    );
  }

  // Horizontal layout
  return (
    <Checkbox.Group {...checkboxGroupProps}>
      {options.map((option, index) => (
        <Checkbox 
          key={option.value || index} 
          value={option.value}
          disabled={option.disabled || loading}
          style={{ marginRight: '16px' }}
        >
          {option.label}
        </Checkbox>
      ))}
    </Checkbox.Group>
  );
};

export default CheckboxField;
