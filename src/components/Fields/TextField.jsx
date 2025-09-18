import React from 'react';
import { Input } from 'antd';
import { useField } from 'formik';

/**
 * Text Field component
 */
const TextField = ({ 
  field, 
  formikProps, 
  disabled, 
  size, 
  placeholder, 
  style, 
  className 
}) => {
  const [formikField, meta] = useField(field.name);
  const { setFieldValue, setFieldTouched } = formikProps;

  const handleChange = (e) => {
    const value = e.target.value;
    setFieldValue(field.name, value);
  };

  const handleBlur = (e) => {
    setFieldTouched(field.name, true);
    if (formikField.onBlur) {
      formikField.onBlur(e);
    }
  };

  // Field-specific props
  const inputProps = {
    ...formikField,
    onChange: handleChange,
    onBlur: handleBlur,
    disabled,
    size,
    placeholder: placeholder || field.placeholder,
    style,
    className,
    maxLength: field.maxLength,
    showCount: field.showCount,
  };

  // Add prefix/suffix if specified
  if (field.prefix) inputProps.prefix = field.prefix;
  if (field.suffix) inputProps.suffix = field.suffix;
  if (field.addonBefore) inputProps.addonBefore = field.addonBefore;
  if (field.addonAfter) inputProps.addonAfter = field.addonAfter;

  // Handle different input variants
  const { variant = 'default' } = field;

  switch (variant) {
    case 'password':
      return <Input.Password {...inputProps} />;
    case 'search':
      return (
        <Input.Search 
          {...inputProps} 
          onSearch={field.onSearch}
          enterButton={field.enterButton}
        />
      );
    default:
      return <Input {...inputProps} />;
  }
};

export default TextField;
