import React from 'react';
import { Switch } from 'antd';
import { useField } from 'formik';

/**
 * Switch Field component
 */
const SwitchField = ({ 
  field, 
  formikProps, 
  disabled, 
  size, 
  style, 
  className 
}) => {
  const [formikField, meta] = useField(field.name);
  const { setFieldValue, setFieldTouched } = formikProps;

  const handleChange = (checked) => {
    setFieldValue(field.name, checked);
  };

  const handleBlur = () => {
    setFieldTouched(field.name, true);
  };

  const switchProps = {
    checked: !!formikField.value,
    onChange: handleChange,
    onBlur: handleBlur,
    disabled,
    size,
    style,
    className,
    checkedChildren: field.checkedChildren,
    unCheckedChildren: field.unCheckedChildren,
    loading: field.loading || false,
  };

  return <Switch {...switchProps} />;
};

export default SwitchField;
