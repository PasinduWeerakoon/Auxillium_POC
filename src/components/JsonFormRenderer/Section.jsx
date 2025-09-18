import React from 'react';
import { Row, Col, Card } from 'antd';
import FieldRenderer from './FieldRenderer';
import { getResponsiveColumns } from '../../lib/theming';

/**
 * Section component for rendering groups of fields
 */
const Section = ({ section, formikProps, formConfig, layout, userRole }) => {
  const { 
    id, 
    title, 
    description, 
    fields = [], 
    columns = 1, 
    variant = "outlined",
    collapsible = false,
    defaultCollapsed = false 
  } = section;

  // Get responsive column configuration
  const columnConfig = getResponsiveColumns({ ...layout, columns });

  // Calculate responsive column spans
  const getColSpan = (field) => {
    const fieldColumns = field.columns || 1;
    const sectionColumns = columns || 1;
    
    // Calculate span based on field's column requirement
    const span = Math.floor(24 / Math.min(sectionColumns, fieldColumns));
    
    return {
      xs: 24, // Always full width on mobile
      sm: Math.min(24, span * 2), // Double width on small screens
      md: span,
      lg: span,
      xl: span,
      xxl: span,
    };
  };

  // Render section content
  const renderContent = () => (
    <div className="section-content">
      {description && (
        <div className="section-description">
          <p>{description}</p>
        </div>
      )}
      
      <Row gutter={columnConfig.gutter}>
        {fields.map((field, index) => (
          <Col
            key={field.name || field.id || index}
            {...getColSpan(field)}
          >
            <FieldRenderer
              field={field}
              formikProps={formikProps}
              formConfig={formConfig}
              userRole={userRole}
            />
          </Col>
        ))}
      </Row>
    </div>
  );

  // If section has title or variant, wrap in Card
  if (title || variant !== "borderless" || collapsible) {
    const cardProps = {
      title,
      size: formConfig.size || 'default',
      variant,
      className: 'form-section-card',
    };

    // Add collapsible props if needed
    if (collapsible) {
      cardProps.extra = null; // Could add collapse button here
    }

    return (
      <Card {...cardProps}>
        {renderContent()}
      </Card>
    );
  }

  // Otherwise render content directly
  return (
    <div className={`form-section ${id ? `form-section-${id}` : ''}`}>
      {renderContent()}
    </div>
  );
};

export default Section;
