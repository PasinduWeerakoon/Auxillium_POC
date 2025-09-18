import React from 'react';
import { DatePicker } from 'antd';
import { useField } from 'formik';
import dayjs from 'dayjs';

/**
 * Date Field component
 */
const DateField = ({ 
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
    // Store as ISO string or the format specified
    const value = date ? date.toISOString() : null;
    setFieldValue(field.name, value);
  };

  const handleBlur = () => {
    setFieldTouched(field.name, true);
  };

  // Convert value to dayjs object for DatePicker
  const dateValue = formikField.value ? dayjs(formikField.value) : null;

  const datePickerProps = {
    value: dateValue,
    onChange: handleChange,
    onBlur: handleBlur,
    disabled,
    size,
    placeholder: placeholder || field.placeholder || 'Select date',
    style: { width: '100%', ...style },
    className,
    format: field.format || 'YYYY-MM-DD',
    allowClear: field.allowClear !== false,
    showTime: field.showTime || false,
    showToday: field.showToday !== false,
  };

  // Add min/max dates if specified
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

  // Handle different picker modes
  const { mode = 'date' } = field;

  switch (mode) {
    case 'week':
      return <DatePicker.WeekPicker {...datePickerProps} />;
    case 'month':
      return <DatePicker.MonthPicker {...datePickerProps} />;
    case 'quarter':
      return <DatePicker.QuarterPicker {...datePickerProps} />;
    case 'year':
      return <DatePicker.YearPicker {...datePickerProps} />;
    case 'range':
      return <DatePicker.RangePicker {...datePickerProps} />;
    default:
      return <DatePicker {...datePickerProps} />;
  }
};

export default DateField;
