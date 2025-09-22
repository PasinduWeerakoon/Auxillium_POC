import React from 'react';
import { DatePicker } from 'antd';
import { useField } from 'formik';
import dayjs from 'dayjs';
const DateTimeField = ({ 
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
  const handleChange = (date, dateString) => {
    const value = date ? date.toISOString() : null;
    setFieldValue(field.name, value);
  };
  const handleBlur = () => {
    setFieldTouched(field.name, true);
  };
  const dateValue = formikField.value ? dayjs(formikField.value) : null;
  const datePickerProps = {
    value: dateValue,
    onChange: handleChange,
    onBlur: handleBlur,
    disabled,
    size,
    placeholder: placeholder || field.placeholder || 'Select date and time',
    style: { width: '100%', ...style },
    className,
    format: field.format || 'YYYY-MM-DD HH:mm:ss',
    allowClear: field.allowClear !== false,
    showTime: {
      format: field.timeFormat || 'HH:mm:ss',
      use12Hours: field.use12Hours || false,
      hourStep: field.hourStep || 1,
      minuteStep: field.minuteStep || 1,
      secondStep: field.secondStep || 1,
      hideDisabledOptions: field.hideDisabledOptions || false,
      ...field.showTime
    },
    showToday: field.showToday !== false,
  };
  if (field.minDate) {
    datePickerProps.disabledDate = (current) => {
      return current && current < dayjs(field.minDate);
    };
  }
  if (field.maxDate) {
    const existingDisabledDate = datePickerProps.disabledDate;
    datePickerProps.disabledDate = (current) => {
      const beforeMin = existingDisabledDate ? existingDisabledDate(current) : false;
      const afterMax = current && current > dayjs(field.maxDate);
      return beforeMin || afterMax;
    };
  }
  return <DatePicker {...datePickerProps} />;
};
export default DateTimeField;
