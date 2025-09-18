import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import { useField } from 'formik';
import { loadApiOptions } from '../../lib/api';

const { Option } = Select;

/**
 * Select Field component
 */
const SelectField = ({ 
  field, 
  formikProps, 
  disabled, 
  size, 
  placeholder, 
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
        console.error('Failed to load select options:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (value) => {
    setFieldValue(field.name, value);
  };

  const handleBlur = () => {
    setFieldTouched(field.name, true);
  };

  const selectProps = {
    value: formikField.value,
    onChange: handleChange,
    onBlur: handleBlur,
    disabled,
    size,
    placeholder: placeholder || field.placeholder || 'Please select...',
    style: { width: '100%', ...style },
    className,
    loading,
    allowClear: field.allowClear !== false,
    showSearch: field.showSearch || false,
    mode: field.mode, // 'multiple', 'tags', etc.
    maxTagCount: field.maxTagCount,
    filterOption: field.filterOption !== false,
    notFoundContent: field.notFoundContent,
  };

  // Handle search functionality
  if (field.showSearch) {
    selectProps.filterOption = (input, option) => {
      const label = option.children || option.label || '';
      return label.toLowerCase().includes(input.toLowerCase());
    };
  }

  return (
    <Select {...selectProps}>
      {options.map((option, index) => (
        <Option 
          key={option.value || index} 
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </Option>
      ))}
    </Select>
  );
};

export default SelectField;
