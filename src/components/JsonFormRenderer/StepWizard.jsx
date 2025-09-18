import React, { useState, useCallback } from 'react';
import { Steps, Card, Row, Col } from 'antd';
import Section from './Section';
import TabContainer from './TabContainer';
import ActionsBar from './ActionsBar';
import { createStepSchema } from '../../lib/validation';
import { getResponsiveColumns } from '../../lib/theming';
import { isRoleVisible } from '../../lib/roles';

const { Step } = Steps;

/**
 * Step Wizard component that manages multi-step form navigation
 */
const StepWizard = ({ 
  steps, 
  formikProps, 
  formConfig, 
  layout, 
  actions, 
  onStepChange,
  userRole 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const { values, errors, setFieldTouched, validateForm } = formikProps;

  // Filter steps based on user role
  const visibleSteps = steps.filter(step => !userRole || isRoleVisible(userRole, step));
  
  // Get current step configuration
  const currentStepConfig = visibleSteps[currentStep];

  // Handle step navigation
  const handleStepChange = useCallback(async (newStep, direction = 'next') => {
    // Validate current step before moving forward
    if (direction === 'next' && newStep > currentStep) {
      const stepSchema = createStepSchema(currentStepConfig, values);
      
      try {
        await stepSchema.validate(values, { abortEarly: false });
        setCompletedSteps(prev => new Set([...prev, currentStep]));
      } catch (validationError) {
        // Mark fields as touched to show validation errors
        const fieldNames = extractFieldNames(currentStepConfig);
        fieldNames.forEach(fieldName => {
          setFieldTouched(fieldName, true);
        });
        
        // Don't allow navigation if validation fails
        return;
      }
    }

    setCurrentStep(newStep);
    
    if (onStepChange) {
      onStepChange(newStep, direction, formikProps);
    }
  }, [currentStep, currentStepConfig, values, setFieldTouched, onStepChange, formikProps]);

  // Get column configuration
  const columnConfig = getResponsiveColumns(layout);

  // Render step content
  const renderStepContent = () => {
    if (!currentStepConfig) return null;

    const { sections, tabs, fields } = currentStepConfig;

    return (
      <div className="step-content">
        {/* Render tabs if present */}
        {tabs && tabs.length > 0 && (
          <TabContainer
            tabs={tabs}
            formikProps={formikProps}
            formConfig={formConfig}
            layout={layout}
            userRole={userRole}
          />
        )}

        {/* Render sections if present */}
        {sections && sections.length > 0 && (
          <Row gutter={columnConfig.gutter}>
            {sections.map((section, index) => (
              <Col 
                key={section.id || index}
                xs={24}
                sm={section.columns ? Math.floor(24 / section.columns) : 24}
                md={section.columns ? Math.floor(24 / section.columns) : 24}
              >
                <Section
                  section={section}
                  formikProps={formikProps}
                  formConfig={formConfig}
                  layout={layout}
                  userRole={userRole}
                />
              </Col>
            ))}
          </Row>
        )}

        {/* Render direct fields if present */}
        {fields && fields.length > 0 && (
          <Section
            section={{ fields, id: 'direct-fields' }}
            formikProps={formikProps}
            formConfig={formConfig}
            layout={layout}
            userRole={userRole}
          />
        )}
      </div>
    );
  };

  return (
    <div className="step-wizard">
        {/* Steps navigation */}
      {visibleSteps.length > 1 && (
        <Card className="steps-navigation" size="small">
          <Steps
            current={currentStep}
            onChange={(step) => handleStepChange(step, step > currentStep ? 'next' : 'prev')}
            size="small"
          >
            {visibleSteps.map((step, index) => (
              <Step
                key={step.id || index}
                title={step.title}
                description={step.description}
                status={getStepStatus(index, currentStep, completedSteps, errors)}
              />
            ))}
          </Steps>
        </Card>
      )}

      {/* Current step content */}
        <Card 
        title={currentStepConfig?.title}
        className="step-content-card"
        style={{ marginTop: visibleSteps.length > 1 ? 16 : 0 }}
      >
        {renderStepContent()}
      </Card>

      {/* Actions bar */}
      <ActionsBar
        currentStep={currentStep}
        totalSteps={visibleSteps.length}
        stepActions={currentStepConfig?.actions || actions}
        formikProps={formikProps}
        onStepChange={handleStepChange}
      />
    </div>
  );
};

/**
 * Get step status for Steps component
 */
const getStepStatus = (stepIndex, currentStep, completedSteps, errors) => {
  if (stepIndex < currentStep) {
    return completedSteps.has(stepIndex) ? 'finish' : 'error';
  }
  if (stepIndex === currentStep) {
    // Check if current step has errors
    const stepHasErrors = hasStepErrors(stepIndex, errors);
    return stepHasErrors ? 'error' : 'process';
  }
  return 'wait';
};

/**
 * Check if a step has validation errors
 */
const hasStepErrors = (stepIndex, errors) => {
  // This would need to be implemented based on field mapping
  // For now, return false
  return false;
};

/**
 * Extract field names from step configuration
 */
const extractFieldNames = (step) => {
  const fieldNames = [];
  
  const collectFields = (container) => {
    if (container.fields) {
      container.fields.forEach(field => {
        if (field.name) fieldNames.push(field.name);
        if (field.fields) collectFields(field);
      });
    }
    if (container.sections) {
      container.sections.forEach(collectFields);
    }
    if (container.tabs) {
      container.tabs.forEach(collectFields);
    }
  };
  
  collectFields(step);
  return fieldNames;
};

export default StepWizard;
