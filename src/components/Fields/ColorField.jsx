import React, { useState } from 'react';
import { Input, ColorPicker, Space } from 'antd';
import { useField } from 'formik';

/**
 * Color Field component
 */
const ColorField = ({ 
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
  const [colorValue, setColorValue] = useState(formikField.value || '#000000');

  const handleColorChange = (color, hex) => {
    const value = hex || color.toHexString();
    setColorValue(value);
    setFieldValue(field.name, value);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setColorValue(value);
    setFieldValue(field.name, value);
  };

  const handleBlur = () => {
    setFieldTouched(field.name, true);
  };

  const colorPickerProps = {
    value: colorValue,
    onChange: handleColorChange,
    disabled,
    size,
    showText: field.showText || false,
    allowClear: field.allowClear || false,
    format: field.format || 'hex',
    placement: field.placement || 'bottomLeft',
    presets: field.presets || [
      {
        label: 'Recommended',
        colors: [
          '#F5222D',
          '#FA8C16',
          '#FADB14',
          '#8BBB11',
          '#52C41A',
          '#13A8A8',
          '#1677FF',
          '#2F54EB',
          '#722ED1',
          '#EB2F96',
        ],
      },
    ],
  };

  // Show input alongside color picker if specified
  if (field.showInput !== false) {
    return (
      <Space.Compact style={{ width: '100%' }}>
        <ColorPicker {...colorPickerProps} />
        <Input
          value={colorValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={disabled}
          size={size}
          placeholder={placeholder || field.placeholder || '#000000'}
          style={style}
          className={className}
        />
      </Space.Compact>
    );
  }

  return <ColorPicker {...colorPickerProps} />;
};

export default ColorField;
