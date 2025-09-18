import React, { useMemo, useCallback, useEffect } from 'react';
import { Formik } from 'formik';
import { ConfigProvider, notification, Form } from 'antd';
import StepWizard from './StepWizard';
import { createAntdTheme, createFormConfig } from '../../lib/theming';
import { createStepSchema } from '../../lib/validation';
import { executeApiAction } from '../../lib/api';
import { get, set, deepClone } from '../../lib/utils';
import { evaluateComputed, getComputedDependencies, getFieldsToRecalculate } from '../../lib/conditions';
import { filterConfigByRole } from '../../lib/roles';

/**
 * Main JSON Form Renderer component
 * Orchestrates the rendering of multi-step forms from JSON configuration
 */
const JsonFormRenderer = ({ 
  config, 
  onSubmit, 
  onStepChange,
  onValuesChange,
  userRole,
  className,
  style 
}) => {
  // Filter configuration based on user role
  const filteredConfig = useMemo(() => 
    userRole ? filterConfigByRole(config, userRole) : config, 
    [config, userRole]
  );

  // Extract configuration
  const {
    meta = {},
    theme = {},
    layout = {},
    steps = [],
    initialValues = {},
    actions = []
  } = filteredConfig || {};

  // Create theme configuration
  const antdTheme = useMemo(() => createAntdTheme(theme), [theme]);
  const formConfig = useMemo(() => createFormConfig(theme), [theme]);

  // Get computed field dependencies
  const computedDependencies = useMemo(() => {
    const allFields = [];
    steps.forEach(step => {
      const collectFields = (container) => {
        if (container.fields) allFields.push(...container.fields);
        if (container.sections) container.sections.forEach(collectFields);
        if (container.tabs) container.tabs.forEach(collectFields);
      };
      collectFields(step);
    });
    return getComputedDependencies(allFields);
  }, [steps]);

  // Handle form submission
  const handleSubmit = useCallback(async (values, formikHelpers) => {
    try {
      // Find submit action
      const submitAction = actions.find(action => action.type === 'submit');
      
      if (submitAction && submitAction.api) {
        // Execute API submission
        const result = await executeApiAction(submitAction, values);
        notification.success({
          message: 'Form Submitted',
          description: submitAction.successMessage || 'Form submitted successfully',
        });
        
        if (onSubmit) {
          onSubmit(values, result);
        }
      } else {
        // Default submission
        console.log('Form submitted:', values);
        notification.success({
          message: 'Form Submitted',
          description: 'Form data logged to console',
        });
        
        if (onSubmit) {
          onSubmit(values);
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      notification.error({
        message: 'Submission Failed',
        description: error.message || 'An error occurred while submitting the form',
      });
    } finally {
      formikHelpers.setSubmitting(false);
    }
  }, [actions, onSubmit]);

  // Handle step change
  const handleStepChange = useCallback((stepIndex, direction, formikProps) => {
    if (onStepChange) {
      onStepChange(stepIndex, direction, formikProps.values);
    }
  }, [onStepChange]);

  // Handle computed field updates
  const handleValuesChange = useCallback((prevValues, currentValues, setFieldValue) => {
    // Check which computed fields need recalculation
    const fieldsToRecalc = getFieldsToRecalculate(prevValues, currentValues, computedDependencies);
    
    if (fieldsToRecalc.length > 0) {
      // Find all computed fields
      const allFields = [];
      steps.forEach(step => {
        const collectFields = (container) => {
          if (container.fields) allFields.push(...container.fields);
          if (container.sections) container.sections.forEach(collectFields);
          if (container.tabs) container.tabs.forEach(collectFields);
        };
        collectFields(step);
      });

      // Recalculate computed fields
      fieldsToRecalc.forEach(fieldName => {
        const field = allFields.find(f => f.name === fieldName);
        if (field && field.computed) {
          const computedValue = evaluateComputed(field.computed, currentValues);
          if (computedValue !== undefined) {
            setFieldValue(fieldName, computedValue);
          }
        }
      });
    }

    if (onValuesChange) {
      onValuesChange(currentValues, prevValues);
    }
  }, [steps, computedDependencies, onValuesChange]);

  // Initialize computed fields
  const initialValuesWithComputed = useMemo(() => {
    const values = deepClone(initialValues);
    
    // Collect all fields
    const allFields = [];
    steps.forEach(step => {
      const collectFields = (container) => {
        if (container.fields) allFields.push(...container.fields);
        if (container.sections) container.sections.forEach(collectFields);
        if (container.tabs) container.tabs.forEach(collectFields);
      };
      collectFields(step);
    });

    // Set initial computed values
    allFields.forEach(field => {
      if (field.computed && field.name) {
        const computedValue = evaluateComputed(field.computed, values);
        if (computedValue !== undefined) {
          set(values, field.name, computedValue);
        }
      }
    });

    return values;
  }, [initialValues, steps]);

  if (!config || !steps || steps.length === 0) {
    return (
      <div className="json-form-renderer-error">
        <p>Invalid configuration: No steps defined</p>
      </div>
    );
  }

  return (
    <ConfigProvider theme={antdTheme}>
      <div className={`json-form-renderer ${className || ''}`} style={style}>
        <Formik
          initialValues={initialValuesWithComputed}
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {(formikProps) => (
            <FormWrapper
              formikProps={formikProps}
              config={filteredConfig}
              formConfig={formConfig}
              onStepChange={handleStepChange}
              onValuesChange={handleValuesChange}
              userRole={userRole}
            />
          )}
        </Formik>
      </div>
    </ConfigProvider>
  );
};

/**
 * Form wrapper component to handle Formik context
 */
const FormWrapper = ({ 
  formikProps, 
  config, 
  formConfig, 
  onStepChange, 
  onValuesChange,
  userRole 
}) => {
  const { values, setFieldValue } = formikProps;
  const prevValuesRef = React.useRef(values);

  // Watch for value changes
  useEffect(() => {
    const prevValues = prevValuesRef.current;
    if (prevValues !== values) {
      onValuesChange(prevValues, values, setFieldValue);
      prevValuesRef.current = values;
    }
  }, [values, setFieldValue, onValuesChange]);

  return (
    <Form {...formConfig}>
      <StepWizard
        steps={config.steps}
        formikProps={formikProps}
        formConfig={formConfig}
        layout={config.layout}
        actions={config.actions}
        onStepChange={onStepChange}
        userRole={userRole}
      />
    </Form>
  );
};

export default JsonFormRenderer;
