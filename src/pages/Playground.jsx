import React, { useState, useCallback, useEffect } from 'react';
import { Row, Col, Card, Select, Button, message, Space, Typography, Divider } from 'antd';
import { CopyOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import JsonFormRenderer from '../components/JsonFormRenderer';
import sampleBasic from '../config/sample.basic.json';
import sampleAdvanced from '../config/sample.advanced.json';
import sampleRoles from '../config/sample.roles.json';
import { getAvailableRoles, USER_ROLES } from '../lib/roles';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Playground page for testing JSON configurations
 */
const Playground = () => {
  const [jsonConfig, setJsonConfig] = useState(JSON.stringify(sampleBasic, null, 2));
  const [parsedConfig, setParsedConfig] = useState(sampleBasic);
  const [parseError, setParseError] = useState(null);
  const [selectedSample, setSelectedSample] = useState('basic');
  const [editorReady, setEditorReady] = useState(false);
  const [userRole, setUserRole] = useState(USER_ROLES.ADMIN);

  // Sample configurations
  const samples = {
    basic: sampleBasic,
    advanced: sampleAdvanced,
    roles: sampleRoles,
  };

  // Parse JSON config
  const parseJsonConfig = useCallback((json) => {
    try {
      const parsed = JSON.parse(json);
      setParsedConfig(parsed);
      setParseError(null);
      return true;
    } catch (error) {
      setParseError(error.message);
      return false;
    }
  }, []);

  // Handle editor change
  const handleEditorChange = useCallback((value) => {
    setJsonConfig(value || '');
    parseJsonConfig(value || '');
  }, [parseJsonConfig]);

  // Load sample configuration
  const loadSample = useCallback((sampleKey) => {
    const sample = samples[sampleKey];
    if (sample) {
      const jsonString = JSON.stringify(sample, null, 2);
      setJsonConfig(jsonString);
      setSelectedSample(sampleKey);
      parseJsonConfig(jsonString);
    }
  }, [parseJsonConfig]);

  // Copy configuration to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonConfig);
      message.success('Configuration copied to clipboard');
    } catch (error) {
      message.error('Failed to copy to clipboard');
    }
  };

  // Download configuration as file
  const downloadConfig = () => {
    const blob = new Blob([jsonConfig], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-config-${selectedSample}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('Configuration downloaded');
  };

  // Reset to current sample
  const resetConfig = () => {
    loadSample(selectedSample);
    message.info('Configuration reset to sample');
  };

  // Handle form submission in preview
  const handleFormSubmit = (values, result) => {
    console.log('Form submitted:', { values, result });
    message.success('Form submitted successfully! Check console for details.');
  };

  // Handle step change in preview
  const handleStepChange = (stepIndex, direction, values) => {
    console.log('Step changed:', { stepIndex, direction, values });
  };

  // Handle values change in preview
  const handleValuesChange = (currentValues, prevValues) => {
    console.log('Values changed:', { currentValues, prevValues });
  };

  // Initialize with basic sample
  useEffect(() => {
    parseJsonConfig(jsonConfig);
  }, []);

  return (
    <div className="playground-page" style={{ padding: '24px', minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Controls */}
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Row gutter={16} align="middle">
            <Col>
              <Text strong>Sample: </Text>
              <Select
                value={selectedSample}
                onChange={loadSample}
                style={{ width: 220 }}
              >
                <Option value="basic">Basic Contact Form</Option>
                <Option value="advanced">Advanced KYC Form</Option>
                <Option value="roles">Role-Based Access Demo</Option>
              </Select>
            </Col>
            <Col>
              <Text strong>User Role: </Text>
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
            </Col>
            <Col>
              <Space>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={resetConfig}
                  size="small"
                >
                  Reset
                </Button>
                <Button 
                  icon={<CopyOutlined />} 
                  onClick={copyToClipboard}
                  size="small"
                >
                  Copy
                </Button>
                <Button 
                  icon={<DownloadOutlined />} 
                  onClick={downloadConfig}
                  size="small"
                >
                  Download
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <Row gutter={16} style={{ minHeight: 'calc(100vh - 200px)' }}>
          {/* Left Panel - JSON Editor */}
          <Col xs={24} lg={12}>
            <Card 
              title="JSON Configuration" 
              size="small"
              style={{ height: '100%' }}
              styles={{ body: { padding: 0, height: 'calc(100% - 57px)' } }}
            >
              <div style={{ height: '100%', position: 'relative' }}>
                <Editor
                  height="100%"
                  language="json"
                  value={jsonConfig}
                  onChange={handleEditorChange}
                  onMount={() => setEditorReady(true)}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    wordWrap: 'on',
                    formatOnPaste: true,
                    formatOnType: true,
                    automaticLayout: true,
                  }}
                  theme="vs-light"
                />
                
                {/* Error overlay */}
                {parseError && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    left: 0,
                    background: '#fff2f0',
                    border: '1px solid #ffccc7',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    margin: '8px',
                    fontSize: '12px',
                    color: '#cf1322',
                    zIndex: 10,
                  }}>
                    <strong>JSON Parse Error:</strong> {parseError}
                  </div>
                )}
              </div>
            </Card>
          </Col>

          {/* Right Panel - Live Preview */}
          <Col xs={24} lg={12}>
            <Card 
              title="Live Preview" 
              size="small"
              style={{ height: '100%' }}
              styles={{ 
                body: {
                  padding: '16px', 
                  height: 'calc(100% - 57px)', 
                  overflow: 'auto' 
                }
              }}
            >
              {parseError ? (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  flexDirection: 'column',
                  color: '#999'
                }}>
                  <Text type="secondary">Fix JSON errors to see preview</Text>
                </div>
              ) : (
                <JsonFormRenderer
                  config={parsedConfig}
                  onSubmit={handleFormSubmit}
                  onStepChange={handleStepChange}
                  onValuesChange={handleValuesChange}
                  userRole={userRole}
                />
              )}
            </Card>
          </Col>
        </Row>

      </div>
    </div>
  );
};

export default Playground;
