import React, { useState, useMemo } from 'react';
import { Table, Button, Space, Popconfirm, Input } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useField } from 'formik';
import { getFieldComponent } from '../../lib/registry';
import { deepClone, generateId } from '../../lib/utils';

/**
 * Table Renderer component for displaying and editing tabular data
 */
const TableRenderer = ({ 
  field, 
  formikProps, 
  disabled, 
  style, 
  className 
}) => {
  const [formikField, meta] = useField(field.name);
  const { setFieldValue } = formikProps;
  const [editingKeys, setEditingKeys] = useState([]);
  const [editingRecord, setEditingRecord] = useState({});

  const {
    columns = [],
    editable = true,
    addable = true,
    removable = true,
    pagination = false,
    size = 'middle',
    variant = "outlined",
    rowKey = 'id',
    dataPath,
    addButtonText = 'Add Row',
    confirmDelete = true,
  } = field;

  // Get data source
  const dataSource = useMemo(() => {
    let data = [];
    
    if (dataPath) {
      // Use data from a different path in form values
      const pathValue = getNestedValue(formikProps.values, dataPath);
      data = Array.isArray(pathValue) ? pathValue : [];
    } else {
      // Use field's own value
      data = Array.isArray(formikField.value) ? formikField.value : [];
    }
    
    // Ensure each row has a unique key
    return data.map((row, index) => ({
      ...row,
      [rowKey]: row[rowKey] || generateId(),
      _index: index,
    }));
  }, [formikField.value, formikProps.values, dataPath, rowKey]);

  // Create table columns
  const tableColumns = useMemo(() => {
    const cols = columns.map(col => ({
      title: col.title,
      dataIndex: col.key,
      key: col.key,
      width: col.width,
      render: (text, record, index) => renderCell(text, record, index, col),
    }));

    // Add action column if table is editable
    if (editable && (removable || editingKeys.length > 0)) {
      cols.push({
        title: 'Actions',
        key: 'actions',
        width: 120,
        render: (text, record) => renderActions(record),
      });
    }

    return cols;
  }, [columns, editable, removable, editingKeys]);

  // Render cell content
  const renderCell = (text, record, index, column) => {
    const isEditing = editingKeys.includes(record[rowKey]);
    
    if (!editable || !isEditing) {
      // Read-only mode
      return formatCellValue(text, column);
    }

    // Edit mode
    return renderEditableCell(text, record, column);
  };

  // Format cell value for display
  const formatCellValue = (value, column) => {
    if (value == null) return '-';
    
    switch (column.type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'datetime':
        return new Date(value).toLocaleString();
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      case 'boolean':
        return value ? 'Yes' : 'No';
      default:
        return String(value);
    }
  };

  // Render editable cell
  const renderEditableCell = (text, record, column) => {
    const FieldComponent = getFieldComponent(column.type || 'text');
    
    if (!FieldComponent) {
      return (
        <Input
          value={editingRecord[column.key] ?? text}
          onChange={(e) => handleCellChange(record[rowKey], column.key, e.target.value)}
        />
      );
    }

    const cellField = {
      ...column,
      name: column.key,
    };

    const cellFormikProps = {
      values: editingRecord,
      setFieldValue: (name, value) => handleCellChange(record[rowKey], name, value),
      setFieldTouched: () => {},
    };

    return (
      <FieldComponent
        field={cellField}
        formikProps={cellFormikProps}
        size="small"
      />
    );
  };

  // Render action buttons
  const renderActions = (record) => {
    const isEditing = editingKeys.includes(record[rowKey]);

    if (isEditing) {
      return (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<SaveOutlined />}
            onClick={() => saveRecord(record)}
          >
            Save
          </Button>
          <Button
            type="link"
            size="small"
            icon={<CloseOutlined />}
            onClick={() => cancelEdit(record)}
          >
            Cancel
          </Button>
        </Space>
      );
    }

    return (
      <Space size="small">
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => startEdit(record)}
          disabled={disabled}
        >
          Edit
        </Button>
        {removable && (
          <Popconfirm
            title="Delete this row?"
            onConfirm={() => deleteRecord(record)}
            disabled={disabled}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled={disabled}
            >
              Delete
            </Button>
          </Popconfirm>
        )}
      </Space>
    );
  };

  // Handle cell value change
  const handleCellChange = (recordKey, columnKey, value) => {
    setEditingRecord(prev => ({
      ...prev,
      [columnKey]: value,
    }));
  };

  // Start editing a record
  const startEdit = (record) => {
    setEditingKeys([...editingKeys, record[rowKey]]);
    setEditingRecord(deepClone(record));
  };

  // Cancel editing
  const cancelEdit = (record) => {
    setEditingKeys(editingKeys.filter(key => key !== record[rowKey]));
    setEditingRecord({});
  };

  // Save edited record
  const saveRecord = (record) => {
    const newData = dataSource.map(item => {
      if (item[rowKey] === record[rowKey]) {
        return { ...item, ...editingRecord };
      }
      return item;
    });

    updateData(newData);
    setEditingKeys(editingKeys.filter(key => key !== record[rowKey]));
    setEditingRecord({});
  };

  // Delete record
  const deleteRecord = (record) => {
    const newData = dataSource.filter(item => item[rowKey] !== record[rowKey]);
    updateData(newData);
  };

  // Add new record
  const addRecord = () => {
    const newRecord = {
      [rowKey]: generateId(),
      _index: dataSource.length,
    };

    // Initialize with default values from column definitions
    columns.forEach(col => {
      if (col.defaultValue !== undefined) {
        newRecord[col.key] = col.defaultValue;
      }
    });

    const newData = [...dataSource, newRecord];
    updateData(newData);
    startEdit(newRecord);
  };

  // Update data source
  const updateData = (newData) => {
    // Remove internal fields
    const cleanData = newData.map(({ _index, ...item }) => item);
    
    if (dataPath) {
      // Update data at specified path
      setNestedValue(formikProps.values, dataPath, cleanData);
      setFieldValue(dataPath, cleanData);
    } else {
      // Update field's own value
      setFieldValue(field.name, cleanData);
    }
  };

  return (
    <div className={`table-renderer ${className || ''}`} style={style}>
      {/* Add button */}
      {addable && (
        <div style={{ marginBottom: '16px' }}>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addRecord}
            disabled={disabled}
          >
            {addButtonText}
          </Button>
        </div>
      )}

      {/* Table */}
      <Table
        columns={tableColumns}
        dataSource={dataSource}
        rowKey={rowKey}
        pagination={pagination}
        size={size}
        variant={variant}
        scroll={{ x: true }}
        className="editable-table"
      />
    </div>
  );
};

// Helper functions
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

const setNestedValue = (obj, path, value) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
};

export default TableRenderer;
