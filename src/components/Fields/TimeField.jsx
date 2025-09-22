import React from 'react';
import { TimePicker } from 'antd';
import { useField } from 'formik';
import dayjs from 'dayjs';
const TimeField = ({ 
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
  const handleChange = (time, timeString) => {
    const value = time ? time.format(field.format || 'HH:mm:ss') : null;
    setFieldValue(field.name, value);
  };
  const handleBlur = () => {
    setFieldTouched(field.name, true);
  };
  const timeValue = formikField.value ? dayjs(formikField.value, field.format || 'HH:mm:ss') : null;
  const timePickerProps = {
    value: timeValue,
    onChange: handleChange,
    onBlur: handleBlur,
    disabled,
    size,
    placeholder: placeholder || field.placeholder || 'Select time',
    style: { width: '100%', ...style },
    className,
    format: field.format || 'HH:mm:ss',
    allowClear: field.allowClear !== false,
    use12Hours: field.use12Hours || false,
    hourStep: field.hourStep || 1,
    minuteStep: field.minuteStep || 1,
    secondStep: field.secondStep || 1,
    hideDisabledOptions: field.hideDisabledOptions || false,
  };
  if (field.disabledHours) {
    timePickerProps.disabledHours = field.disabledHours;
  }
  if (field.disabledMinutes) {
    timePickerProps.disabledMinutes = field.disabledMinutes;
  }
  if (field.disabledSeconds) {
    timePickerProps.disabledSeconds = field.disabledSeconds;
  }
  return <TimePicker {...timePickerProps} />;
};
export default TimeField;
