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
const JsonFormRenderer = ({ 
  config, 
  onSubmit, 
  onStepChange,
  onValuesChange,
  userRole,
  className,
  style 
}) => {
  const filteredConfig = useMemo(() => 
    userRole ? filterConfigByRole(config, userRole) : config, 
    [config, userRole]
  );
  const {
    meta = {},
    theme = {},
    layout = {},
    steps = [],
    initialValues = {},
    actions = []
  } = filteredConfig || {};
  const antdTheme = useMemo(() => createAntdTheme(theme), [theme]);
  const formConfig = useMemo(() => createFormConfig(theme), [theme]);
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
  const handleSubmit = useCallback(async (values, formikHelpers) => {
    try {
      const submitAction = actions.find(action => action.type === 'submit');
      if (submitAction && submitAction.api) {
        const result = await executeApiAction(submitAction, values);
        notification.success({
          message: 'Form Submitted',
          description: submitAction.successMessage || 'Form submitted successfully',
        });
        if (onSubmit) {
          onSubmit(values, result);
        }
      } else {
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
  const handleStepChange = useCallback((stepIndex, direction, formikProps) => {
    if (onStepChange) {
      onStepChange(stepIndex, direction, formikProps.values);
    }
  }, [onStepChange]);
  const handleValuesChange = useCallback((prevValues, currentValues, setFieldValue) => {
    const fieldsToRecalc = getFieldsToRecalculate(prevValues, currentValues, computedDependencies);
    if (fieldsToRecalc.length > 0) {
      const allFields = [];
      steps.forEach(step => {
        const collectFields = (container) => {
          if (container.fields) allFields.push(...container.fields);
          if (container.sections) container.sections.forEach(collectFields);
          if (container.tabs) container.tabs.forEach(collectFields);
        };
        collectFields(step);
      });
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
  const initialValuesWithComputed = useMemo(() => {
    const values = deepClone(initialValues);
    const allFields = [];
    steps.forEach(step => {
      const collectFields = (container) => {
        if (container.fields) allFields.push(...container.fields);
        if (container.sections) container.sections.forEach(collectFields);
        if (container.tabs) container.tabs.forEach(collectFields);
      };
      collectFields(step);
    });
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
