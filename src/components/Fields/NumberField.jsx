import React from 'react';
import { InputNumber } from 'antd';
import { useField } from 'formik';

/**
 * Number Field component
 */
const NumberField = ({ 
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

  const handleChange = (value) => {
    setFieldValue(field.name, value);
  };

  const handleBlur = () => {
    setFieldTouched(field.name, true);
  };

  const numberProps = {
    value: formikField.value,
    onChange: handleChange,
    onBlur: handleBlur,
    disabled,
    size,
    placeholder: placeholder || field.placeholder,
    style: { width: '100%', ...style },
    className,
    min: field.min,
    max: field.max,
    step: field.step || 1,
    precision: field.precision,
    stringMode: field.stringMode || false,
    controls: field.controls !== false,
  };

  // Add prefix/suffix if specified
  if (field.prefix) numberProps.prefix = field.prefix;
  if (field.suffix) numberProps.suffix = field.suffix;
  if (field.addonBefore) numberProps.addonBefore = field.addonBefore;
  if (field.addonAfter) numberProps.addonAfter = field.addonAfter;

  // Handle formatter and parser
  if (field.formatter) {
    numberProps.formatter = field.formatter;
  }
  if (field.parser) {
    numberProps.parser = field.parser;
  }

  return <InputNumber {...numberProps} />;
};

export default NumberField;
