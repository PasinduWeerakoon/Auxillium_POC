import React, { useMemo } from 'react';
import { Input } from 'antd';
import { useField } from 'formik';

const { TextArea } = Input;

/**
 * Rich Text Field component
 * Note: This is a simplified version. For production, you'd want to integrate
 * a proper rich text editor like react-quill, @tinymce/tinymce-react, etc.
 */
const RichTextField = ({ 
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

  // For now, render as a large text area with some formatting buttons
  // In production, replace this with a proper rich text editor
  const textAreaProps = {
    ...formikField,
    onChange: handleChange,
    onBlur: handleBlur,
    disabled,
    size,
    placeholder: placeholder || field.placeholder || 'Enter rich text content...',
    style: { minHeight: '120px', ...style },
    className: `rich-text-field ${className || ''}`,
    rows: field.rows || 6,
    autoSize: field.autoSize || { minRows: 6, maxRows: 12 },
  };

  // Simple toolbar for basic formatting (placeholder for rich editor)
  const renderToolbar = () => {
    if (field.showToolbar === false) return null;
    
    return (
      <div className="rich-text-toolbar" style={{ 
        marginBottom: '8px', 
        padding: '8px', 
        border: '1px solid #d9d9d9', 
        borderRadius: '6px 6px 0 0',
        background: '#fafafa',
        fontSize: '12px',
        color: '#666'
      }}>
        Rich text editor would go here (Bold, Italic, Underline, Lists, Links, etc.)
      </div>
    );
  };

  return (
    <div className="rich-text-container">
      {renderToolbar()}
      <TextArea {...textAreaProps} />
      {field.showHint !== false && (
        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
          Note: This is a simplified rich text field. In production, integrate a proper rich text editor.
        </div>
      )}
    </div>
  );
};

export default RichTextField;
