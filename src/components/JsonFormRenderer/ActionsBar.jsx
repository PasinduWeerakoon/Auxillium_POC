import React from 'react';
import { Button, Space, Card, notification } from 'antd';
import { executeApiAction } from '../../lib/api';
const ActionsBar = ({ 
  currentStep, 
  totalSteps, 
  stepActions = [], 
  formikProps, 
  onStepChange 
}) => {
  const { values, resetForm, isSubmitting, submitForm } = formikProps;
  const handleActionClick = async (action) => {
    try {
      switch (action.type) {
        case 'prev':
          if (currentStep > 0) {
            onStepChange(currentStep - 1, 'prev');
          }
          break;
        case 'next':
          if (currentStep < totalSteps - 1) {
            onStepChange(currentStep + 1, 'next');
          }
          break;
        case 'submit':
          await submitForm();
          break;
        case 'reset':
          resetForm();
          notification.info({
            message: 'Form Reset',
            description: 'Form has been reset to initial values',
          });
          break;
        case 'custom':
          if (action.action === 'apiCall' && action.api) {
            try {
              const result = await executeApiAction(action, values);
              notification.success({
                message: action.successMessage || 'Action Completed',
                description: action.successDescription || 'Action executed successfully',
              });
              if (action.onSuccess) {
                action.onSuccess(result, values);
              }
            } catch (error) {
              notification.error({
                message: action.errorMessage || 'Action Failed',
                description: action.errorDescription || error.message,
              });
            }
          } else if (action.onClick) {
            action.onClick(values, formikProps);
          }
          break;
        default:
          console.warn(`Unknown action type: ${action.type}`);
      }
    } catch (error) {
      console.error('Action error:', error);
      notification.error({
        message: 'Action Error',
        description: error.message || 'An error occurred while executing the action',
      });
    }
  };
  const getButtonType = (action) => {
    switch (action.type) {
      case 'submit':
        return 'primary';
      case 'next':
        return 'primary';
      case 'prev':
        return 'default';
      case 'reset':
        return 'default';
      case 'custom':
        return action.buttonType || 'default';
      default:
        return 'default';
    }
  };
  const getButtonProps = (action) => {
    const baseProps = {
      type: getButtonType(action),
      size: action.size || 'middle',
      loading: action.type === 'submit' ? isSubmitting : false,
      disabled: action.disabled || (action.type === 'submit' && isSubmitting),
      danger: action.danger || false,
      ghost: action.ghost || false,
      icon: action.icon,
      className: action.className,
      style: action.style,
    };
    if (action.type === 'prev') {
      baseProps.disabled = baseProps.disabled || currentStep === 0;
    } else if (action.type === 'next') {
      baseProps.disabled = baseProps.disabled || currentStep === totalSteps - 1;
    }
    return baseProps;
  };
  const visibleActions = stepActions.filter(action => {
    if (action.type === 'next' && currentStep === totalSteps - 1) {
      return !stepActions.some(a => a.type === 'submit');
    }
    if (action.type === 'prev' && currentStep === 0) {
      return false;
    }
    return true;
  });
  const sortedActions = visibleActions.sort((a, b) => {
    const priority = {
      'prev': 1,
      'reset': 2,
      'custom': 3,
      'next': 4,
      'submit': 5,
    };
    return (priority[a.type] || 3) - (priority[b.type] || 3);
  });
  if (sortedActions.length === 0) {
    return null;
  }
  return (
    <Card className="actions-bar" size="small" style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {}
        <Space>
          {sortedActions
            .filter(action => ['prev', 'reset'].includes(action.type))
            .map((action, index) => (
              <Button
                key={action.id || `${action.type}-${index}`}
                {...getButtonProps(action)}
                onClick={() => handleActionClick(action)}
              >
                {action.label || capitalizeFirst(action.type)}
              </Button>
            ))
          }
        </Space>
        {}
        {totalSteps > 1 && (
          <span className="step-info">
            Step {currentStep + 1} of {totalSteps}
          </span>
        )}
        {}
        <Space>
          {sortedActions
            .filter(action => ['custom', 'next', 'submit'].includes(action.type))
            .map((action, index) => (
              <Button
                key={action.id || `${action.type}-${index}`}
                {...getButtonProps(action)}
                onClick={() => handleActionClick(action)}
              >
                {action.label || capitalizeFirst(action.type)}
              </Button>
            ))
          }
        </Space>
      </div>
    </Card>
  );
};
const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
export default ActionsBar;
