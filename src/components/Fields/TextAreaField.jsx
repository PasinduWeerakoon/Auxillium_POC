import React from 'react';
import { Input } from 'antd';
import { useField } from 'formik';

const { TextArea } = Input;

/**
 * TextArea Field component
 */
const TextAreaField = ({ 
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

  const textAreaProps = {
    ...formikField,
    onChange: handleChange,
    onBlur: handleBlur,
    disabled,
    size,
    placeholder: placeholder || field.placeholder,
    style,
    className,
    rows: field.rows || 4,
    maxLength: field.maxLength,
    showCount: field.showCount,
    autoSize: field.autoSize || false,
  };

  return <TextArea {...textAreaProps} />;
};

export default TextAreaField;
