import React from 'react';
import { Slider, InputNumber, Row, Col } from 'antd';
import { useField } from 'formik';

/**
 * Slider Field component
 */
const SliderField = ({ 
  field, 
  formikProps, 
  disabled, 
  size, 
  style, 
  className 
}) => {
  const [formikField, meta] = useField(field.name);
  const { setFieldValue, setFieldTouched } = formikProps;

  const handleSliderChange = (value) => {
    setFieldValue(field.name, value);
  };

  const handleInputChange = (value) => {
    setFieldValue(field.name, value);
  };

  const handleBlur = () => {
    setFieldTouched(field.name, true);
  };

  const sliderProps = {
    value: formikField.value || field.min || 0,
    onChange: handleSliderChange,
    onBlur: handleBlur,
    disabled,
    style,
    className,
    min: field.min || 0,
    max: field.max || 100,
    step: field.step || 1,
    marks: field.marks,
    dots: field.dots || false,
    included: field.included !== false,
    range: field.range || false,
    vertical: field.vertical || false,
    reverse: field.reverse || false,
    tooltip: {
      formatter: field.tooltipFormatter,
      open: field.tooltipVisible,
      ...field.tooltip
    },
  };

  // Show input alongside slider if specified
  if (field.showInput) {
    return (
      <Row gutter={16} align="middle">
        <Col flex="auto">
          <Slider {...sliderProps} />
        </Col>
        <Col>
          <InputNumber
            value={formikField.value}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={disabled}
            size={size}
            min={field.min}
            max={field.max}
            step={field.step}
            style={{ width: '80px' }}
          />
        </Col>
      </Row>
    );
  }

  return <Slider {...sliderProps} />;
};

export default SliderField;
