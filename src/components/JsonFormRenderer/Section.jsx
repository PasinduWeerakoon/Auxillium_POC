import React from 'react';
import { Row, Col, Card } from 'antd';
import FieldRenderer from './FieldRenderer';
import { getResponsiveColumns } from '../../lib/theming';
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
  const columnConfig = getResponsiveColumns({ ...layout, columns });
  const getColSpan = (field) => {
    const fieldColumns = field.columns || 1;
    const sectionColumns = columns || 1;
    const span = Math.floor(24 / Math.min(sectionColumns, fieldColumns));
    return {
      xs: 24, 
      sm: Math.min(24, span * 2), 
      md: span,
      lg: span,
      xl: span,
      xxl: span,
    };
  };
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
  if (title || variant !== "borderless" || collapsible) {
    const cardProps = {
      title,
      size: formConfig.size || 'default',
      variant,
      className: 'form-section-card',
    };
    if (collapsible) {
      cardProps.extra = null; 
    }
    return (
      <Card {...cardProps}>
        {renderContent()}
      </Card>
    );
  }
  return (
    <div className={`form-section ${id ? `form-section-${id}` : ''}`}>
      {renderContent()}
    </div>
  );
};
export default Section;
