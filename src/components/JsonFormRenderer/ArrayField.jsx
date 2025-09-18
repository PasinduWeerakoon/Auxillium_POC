import React from 'react';
import { Card, Button, Space, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { FieldArray, useField } from 'formik';
import FieldRenderer from './FieldRenderer';
import { deepClone } from '../../lib/utils';

/**
 * Array Field component for dynamic lists
 */
const ArrayField = ({ 
  field, 
  formikProps, 
  disabled, 
  userRole,
  style, 
  className 
}) => {
  const [formikField, meta] = useField(field.name);
  const { values } = formikProps;

  const {
    itemLabel = 'Item',
    itemSchema,
    minItems = 0,
    maxItems,
    addButtonText = 'Add Item',
    removeButtonText = 'Remove',
    copyButtonText = 'Copy',
    showCopy = true,
    showRemove = true,
    variant = "outlined",
    collapsible = false,
  } = field;

  // Create default item based on schema
  const createDefaultItem = () => {
    const defaultItem = {};
    
    if (itemSchema && itemSchema.fields) {
      itemSchema.fields.forEach(fieldDef => {
        if (fieldDef.name && fieldDef.defaultValue !== undefined) {
          defaultItem[fieldDef.name] = fieldDef.defaultValue;
        }
      });
    }
    
    return defaultItem;
  };

  return (
    <FieldArray name={field.name}>
      {({ push, remove, form }) => {
        const fieldValues = formikField.value || [];
        
        return (
          <div className={`array-field ${className || ''}`} style={style}>
            {/* Array items */}
            {fieldValues.map((item, index) => (
              <ArrayItem
                key={index}
                index={index}
                item={item}
                itemLabel={itemLabel}
                itemSchema={itemSchema}
                formikProps={formikProps}
                fieldName={field.name}
                showRemove={showRemove && fieldValues.length > minItems}
                showCopy={showCopy}
                userRole={userRole}
            removeButtonText={removeButtonText}
            copyButtonText={copyButtonText}
            variant={variant}
            collapsible={collapsible}
                disabled={disabled}
                onRemove={() => remove(index)}
                onCopy={() => push(deepClone(item))}
              />
            ))}

            {/* Add button */}
            {(!maxItems || fieldValues.length < maxItems) && (
              <Card size="small" className="array-add-item">
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => push(createDefaultItem())}
                  disabled={disabled}
                  block
                >
                  {addButtonText}
                </Button>
              </Card>
            )}

            {/* Info text */}
            {(minItems > 0 || maxItems) && (
              <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                {minItems > 0 && `Minimum: ${minItems} items`}
                {minItems > 0 && maxItems && ' • '}
                {maxItems && `Maximum: ${maxItems} items`}
              </div>
            )}
          </div>
        );
      }}
    </FieldArray>
  );
};

/**
 * Individual array item component
 */
const ArrayItem = ({
  index,
  item,
  itemLabel,
  itemSchema,
  formikProps,
  fieldName,
  showRemove,
  showCopy,
  userRole,
  removeButtonText,
  copyButtonText,
  variant,
  collapsible,
  disabled,
  onRemove,
  onCopy,
}) => {
  const [collapsed, setCollapsed] = React.useState(false);

  const title = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{itemLabel} {index + 1}</span>
      <Space size="small">
        {collapsible && (
          <Button
            type="text"
            size="small"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? 'Expand' : 'Collapse'}
          </Button>
        )}
        {showCopy && (
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            onClick={onCopy}
            disabled={disabled}
            title={copyButtonText}
          />
        )}
        {showRemove && (
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={onRemove}
            disabled={disabled}
            title={removeButtonText}
          />
        )}
      </Space>
    </div>
  );

  const content = (
    <div className="array-item-content">
      {itemSchema && itemSchema.fields && itemSchema.fields.map((fieldDef, fieldIndex) => {
        // Create field with array index in name
        const fieldWithPath = {
          ...fieldDef,
          name: `${fieldName}.${index}.${fieldDef.name}`,
        };

        return (
          <FieldRenderer
            key={fieldDef.name || fieldIndex}
            field={fieldWithPath}
            formikProps={formikProps}
            formConfig={{ size: 'small' }}
            userRole={userRole}
          />
        );
      })}
    </div>
  );

  if (variant !== "borderless") {
    return (
      <Card
        size="small"
        title={title}
        variant={variant}
        className="array-item-card"
        style={{ marginBottom: '16px' }}
      >
        {(!collapsible || !collapsed) && content}
      </Card>
    );
  }

  return (
    <div className="array-item" style={{ marginBottom: '16px' }}>
      <div className="array-item-header">
        {title}
      </div>
      {(!collapsible || !collapsed) && (
        <>
          <Divider style={{ margin: '8px 0' }} />
          {content}
        </>
      )}
    </div>
  );
};

export default ArrayField;
