import React, { useState, useMemo } from 'react';
import { Table, Button, Space, Popconfirm, Input } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useField } from 'formik';
import { getFieldComponent } from '../../lib/registry';
import { deepClone, generateId } from '../../lib/utils';
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
  const dataSource = useMemo(() => {
    let data = [];
    if (dataPath) {
      const pathValue = getNestedValue(formikProps.values, dataPath);
      data = Array.isArray(pathValue) ? pathValue : [];
    } else {
      data = Array.isArray(formikField.value) ? formikField.value : [];
    }
    return data.map((row, index) => ({
      ...row,
      [rowKey]: row[rowKey] || generateId(),
      _index: index,
    }));
  }, [formikField.value, formikProps.values, dataPath, rowKey]);
  const tableColumns = useMemo(() => {
    const cols = columns.map(col => ({
      title: col.title,
      dataIndex: col.key,
      key: col.key,
      width: col.width,
      render: (text, record, index) => renderCell(text, record, index, col),
    }));
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
  const renderCell = (text, record, index, column) => {
    const isEditing = editingKeys.includes(record[rowKey]);
    if (!editable || !isEditing) {
      return formatCellValue(text, column);
    }
    return renderEditableCell(text, record, column);
  };
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
  const handleCellChange = (recordKey, columnKey, value) => {
    setEditingRecord(prev => ({
      ...prev,
      [columnKey]: value,
    }));
  };
  const startEdit = (record) => {
    setEditingKeys([...editingKeys, record[rowKey]]);
    setEditingRecord(deepClone(record));
  };
  const cancelEdit = (record) => {
    setEditingKeys(editingKeys.filter(key => key !== record[rowKey]));
    setEditingRecord({});
  };
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
  const deleteRecord = (record) => {
    const newData = dataSource.filter(item => item[rowKey] !== record[rowKey]);
    updateData(newData);
  };
  const addRecord = () => {
    const newRecord = {
      [rowKey]: generateId(),
      _index: dataSource.length,
    };
    columns.forEach(col => {
      if (col.defaultValue !== undefined) {
        newRecord[col.key] = col.defaultValue;
      }
    });
    const newData = [...dataSource, newRecord];
    updateData(newData);
    startEdit(newRecord);
  };
  const updateData = (newData) => {
    const cleanData = newData.map(({ _index, ...item }) => item);
    if (dataPath) {
      setNestedValue(formikProps.values, dataPath, cleanData);
      setFieldValue(dataPath, cleanData);
    } else {
      setFieldValue(field.name, cleanData);
    }
  };
  return (
    <div className={`table-renderer ${className || ''}`} style={style}>
      {}
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
      {}
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
