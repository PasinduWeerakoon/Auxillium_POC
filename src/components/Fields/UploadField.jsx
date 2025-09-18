import React, { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import { useField } from 'formik';

const { Dragger } = Upload;

/**
 * Upload Field component
 */
const UploadField = ({ 
  field, 
  formikProps, 
  disabled, 
  size, 
  style, 
  className 
}) => {
  const [formikField, meta] = useField(field.name);
  const { setFieldValue, setFieldTouched } = formikProps;
  const [fileList, setFileList] = useState(formikField.value || []);

  const handleChange = ({ fileList: newFileList, file }) => {
    setFileList(newFileList);
    
    // Update form value based on multiple setting
    if (field.multiple) {
      setFieldValue(field.name, newFileList);
    } else {
      setFieldValue(field.name, newFileList.length > 0 ? newFileList[0] : null);
    }
  };

  const handleRemove = (file) => {
    const newFileList = fileList.filter(item => item.uid !== file.uid);
    setFileList(newFileList);
    
    if (field.multiple) {
      setFieldValue(field.name, newFileList);
    } else {
      setFieldValue(field.name, null);
    }
  };

  const beforeUpload = (file) => {
    // Validate file type
    if (field.accept) {
      const acceptTypes = field.accept.split(',').map(type => type.trim());
      const fileType = file.type;
      const fileName = file.name;
      
      const isValidType = acceptTypes.some(type => {
        if (type.startsWith('.')) {
          return fileName.toLowerCase().endsWith(type.toLowerCase());
        } else {
          return fileType.startsWith(type.replace('*', ''));
        }
      });
      
      if (!isValidType) {
        message.error(`File type not allowed. Accepted types: ${field.accept}`);
        return Upload.LIST_IGNORE;
      }
    }
    
    // Validate file size
    if (field.maxSize) {
      const maxSizeInBytes = field.maxSize * 1024 * 1024; // Convert MB to bytes
      if (file.size > maxSizeInBytes) {
        message.error(`File size must be less than ${field.maxSize}MB`);
        return Upload.LIST_IGNORE;
      }
    }
    
    // Prevent auto upload if no action URL
    if (!field.action) {
      return false;
    }
    
    return true;
  };

  const uploadProps = {
    fileList,
    onChange: handleChange,
    onRemove: handleRemove,
    beforeUpload,
    disabled,
    className,
    style,
    multiple: field.multiple || false,
    accept: field.accept,
    action: field.action,
    headers: field.headers,
    data: field.data,
    name: field.uploadName || 'file',
    listType: field.listType || 'text',
    showUploadList: field.showUploadList !== false,
    maxCount: field.maxCount,
    directory: field.directory || false,
  };

  const handleBlur = () => {
    setFieldTouched(field.name, true);
  };

  // Render different upload styles based on variant
  const { variant = 'button' } = field;

  if (variant === 'dragger') {
    return (
      <Dragger {...uploadProps} onBlur={handleBlur}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          {field.dragText || 'Click or drag file to this area to upload'}
        </p>
        <p className="ant-upload-hint">
          {field.dragHint || 'Support for a single or bulk upload.'}
        </p>
      </Dragger>
    );
  }

  // Default button upload
  return (
    <Upload {...uploadProps} onBlur={handleBlur}>
      <Button 
        icon={<UploadOutlined />} 
        disabled={disabled}
        size={size}
      >
        {field.buttonText || 'Upload'}
      </Button>
    </Upload>
  );
};

export default UploadField;
