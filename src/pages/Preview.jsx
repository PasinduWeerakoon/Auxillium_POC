import React, { useState } from 'react';
import { Card, Select, Typography, Space, Button, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import JsonFormRenderer from '../components/JsonFormRenderer';
import sampleBasic from '../config/sample.basic.json';
import sampleAdvanced from '../config/sample.advanced.json';
import sampleRoles from '../config/sample.roles.json';
import { getAvailableRoles, USER_ROLES } from '../lib/roles';
const { Title, Text } = Typography;
const { Option } = Select;
const Preview = () => {
  const [selectedSample, setSelectedSample] = useState('roles');
  const [key, setKey] = useState(0);
  const [userRole, setUserRole] = useState(USER_ROLES.ADMIN); 
  const samples = {
    basic: {
      config: sampleBasic,
      title: 'Basic Contact Form',
      description: 'A simple contact form with basic fields and conditional logic.'
    },
    advanced: {
      config: sampleAdvanced,
      title: 'Advanced KYC Application',
      description: 'Multi-step form with tabs, arrays, tables, and computed fields.'
    },
    roles: {
      config: sampleRoles,
      title: 'Role-Based Access Demo',
      description: 'Demonstrates role-based field, tab, and step restrictions.'
    }
  };
  const currentSample = samples[selectedSample];
  const handleFormSubmit = (values, result) => {
    console.log('Form submitted:', { values, result });
    message.success('Form submitted successfully! Check console for details.');
  };
  const handleStepChange = (stepIndex, direction, values) => {
    console.log('Step changed:', { stepIndex, direction, values });
  };
  const handleValuesChange = (currentValues, prevValues) => {
    console.log('Values changed:', { currentValues, prevValues });
  };
  const resetForm = () => {
    setKey(prev => prev + 1);
    message.info('Form reset');
  };
  return (
    <div className="preview-page" style={{ padding: '24px', minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {}
        <div style={{ marginBottom: '24px' }}>
          <Title level={2}>Form Preview</Title>
          <Text type="secondary">
            Preview and interact with sample form configurations.
          </Text>
        </div>
        {}
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Space align="center">
            <Text strong>Sample: </Text>
            <Select
              value={selectedSample}
              onChange={setSelectedSample}
              style={{ width: 280 }}
            >
              <Option value="basic">Basic Contact Form</Option>
              <Option value="advanced">Advanced KYC Form</Option>
              <Option value="roles">Role-Based Access Demo</Option>
            </Select>
            <Text strong style={{ marginLeft: '16px' }}>User Role: </Text>
            <Select
              value={userRole}
              onChange={setUserRole}
              style={{ width: 180 }}
            >
              {getAvailableRoles().map(role => (
                <Option key={role.value} value={role.value}>
                  {role.label}
                </Option>
              ))}
            </Select>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={resetForm}
              size="small"
            >
              Reset Form
            </Button>
          </Space>
        </Card>
        {}
        <Card 
          title={currentSample.title}
          size="small" 
          style={{ marginBottom: '16px' }}
        >
          <Text>{currentSample.description}</Text>
        </Card>
        {}
        <Card 
          title="Form"
          size="small"
          styles={{ body: { padding: '24px' } }}
        >
          <JsonFormRenderer
            key={key}
            config={currentSample.config}
            onSubmit={handleFormSubmit}
            onStepChange={handleStepChange}
            onValuesChange={handleValuesChange}
            userRole={userRole}
          />
        </Card>
      </div>
    </div>
  );
};
export default Preview;
