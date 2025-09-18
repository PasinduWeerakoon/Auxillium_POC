import React from 'react';
import { Button, Space, Card, notification } from 'antd';
import { executeApiAction } from '../../lib/api';

/**
 * Actions Bar component for step navigation and form actions
 */
const ActionsBar = ({ 
  currentStep, 
  totalSteps, 
  stepActions = [], 
  formikProps, 
  onStepChange 
}) => {
  const { values, resetForm, isSubmitting, submitForm } = formikProps;

  // Handle action click
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
              
              // If action has a callback, execute it
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

  // Get button type based on action type
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

  // Get button props
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

    // Special handling for navigation buttons
    if (action.type === 'prev') {
      baseProps.disabled = baseProps.disabled || currentStep === 0;
    } else if (action.type === 'next') {
      baseProps.disabled = baseProps.disabled || currentStep === totalSteps - 1;
    }

    return baseProps;
  };

  // Filter and sort actions
  const visibleActions = stepActions.filter(action => {
    // Hide next button on last step if submit button is present
    if (action.type === 'next' && currentStep === totalSteps - 1) {
      return !stepActions.some(a => a.type === 'submit');
    }
    
    // Hide prev button on first step
    if (action.type === 'prev' && currentStep === 0) {
      return false;
    }
    
    return true;
  });

  // Sort actions by type priority
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
        {/* Left side actions (prev, reset) */}
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

        {/* Center information */}
        {totalSteps > 1 && (
          <span className="step-info">
            Step {currentStep + 1} of {totalSteps}
          </span>
        )}

        {/* Right side actions (custom, next, submit) */}
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

/**
 * Capitalize first letter of a string
 */
const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export default ActionsBar;
