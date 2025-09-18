import React, { useState, useEffect } from 'react';
import { Radio } from 'antd';
import { useField } from 'formik';
import { loadApiOptions } from '../../lib/api';

/**
 * Radio Group Field component
 */
const RadioGroupField = ({ 
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

  // Load options on mount and when dependencies change
  useEffect(() => {
    loadOptions();
  }, [field.options, values]);

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
        console.error('Failed to load radio options:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setFieldValue(field.name, value);
  };

  const handleBlur = () => {
    setFieldTouched(field.name, true);
  };

  const radioGroupProps = {
    value: formikField.value,
    onChange: handleChange,
    onBlur: handleBlur,
    disabled,
    size,
    style,
    className,
    optionType: field.optionType || 'default', // 'default' or 'button'
    buttonStyle: field.buttonStyle || 'outline', // 'outline' or 'solid'
  };

  // Handle different layouts
  const { layout = 'horizontal' } = field;
  
  if (layout === 'vertical') {
    return (
      <Radio.Group {...radioGroupProps}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {options.map((option, index) => (
            <Radio 
              key={option.value || index} 
              value={option.value}
              disabled={option.disabled || loading}
            >
              {option.label}
            </Radio>
          ))}
        </div>
      </Radio.Group>
    );
  }

  // Horizontal layout or button style
  if (field.optionType === 'button') {
    return (
      <Radio.Group {...radioGroupProps}>
        {options.map((option, index) => (
          <Radio.Button 
            key={option.value || index} 
            value={option.value}
            disabled={option.disabled || loading}
          >
            {option.label}
          </Radio.Button>
        ))}
      </Radio.Group>
    );
  }

  // Default horizontal layout
  return (
    <Radio.Group {...radioGroupProps}>
      {options.map((option, index) => (
        <Radio 
          key={option.value || index} 
          value={option.value}
          disabled={option.disabled || loading}
          style={{ marginRight: '16px' }}
        >
          {option.label}
        </Radio>
      ))}
    </Radio.Group>
  );
};

export default RadioGroupField;
