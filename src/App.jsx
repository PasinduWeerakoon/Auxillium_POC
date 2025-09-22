import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Layout, Menu, Typography, Space } from 'antd';
import { PlayCircleOutlined, EyeOutlined, CodeOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import './styles/index.css';
const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
function App() {
  const location = useLocation();
  const menuItems = [
    {
      key: '/playground',
      icon: <CodeOutlined />,
      label: <Link to="/playground">Playground</Link>,
    },
    {
      key: '/preview',
      icon: <EyeOutlined />,
      label: <Link to="/preview">Preview</Link>,
    },
  ];
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {}
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 24px',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <PlayCircleOutlined style={{ fontSize: '24px', color: '#1677ff', marginRight: '12px' }} />
          <Title level={3} style={{ margin: 0, color: '#1677ff' }}>
            Axillium POC
          </Title>
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ 
            border: 'none', 
            backgroundColor: 'transparent',
            minWidth: '200px'
          }}
        />
      </Header>
      {}
      <Content style={{ flex: 1 }}>
        <Outlet />
      </Content>
      {}
      <Footer style={{ 
        textAlign: 'center', 
        background: '#fafafa',
        borderTop: '1px solid #f0f0f0'
      }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          developed by PasinduWeerakoon@2024
        </Text>
      </Footer>
    </Layout>
  );
}
export default App;
