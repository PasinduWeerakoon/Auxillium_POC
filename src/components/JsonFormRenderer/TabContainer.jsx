import React, { useState } from 'react';
import { Tabs } from 'antd';
import Section from './Section';
import { isRoleVisible } from '../../lib/roles';

/**
 * Tab Container component for rendering tabbed sections
 */
const TabContainer = ({ tabs, formikProps, formConfig, layout, userRole }) => {
  // Filter tabs based on user role and create tab items
  const visibleTabs = tabs.filter(tab => !userRole || isRoleVisible(userRole, tab));
  const [activeTab, setActiveTab] = useState(visibleTabs[0]?.id || '0');
  const tabItems = visibleTabs.map((tab, index) => {
    // Create clean tab item without any deprecated props
    const { destroyInactiveTabPane, ...cleanTab } = tab;
    
    return {
      key: cleanTab.id || String(index),
      label: cleanTab.title || `Tab ${index + 1}`,
      destroyOnHidden: false, // Use the new prop explicitly
      children: (
      <div className="tab-content">
        {/* Render sections within tab */}
        {tab.sections && tab.sections.length > 0 && (
          <div className="tab-sections">
            {tab.sections.map((section, sectionIndex) => (
              <Section
                key={section.id || sectionIndex}
                section={section}
                formikProps={formikProps}
                formConfig={formConfig}
                layout={layout}
                userRole={userRole}
              />
            ))}
          </div>
        )}

        {/* Render direct fields within tab */}
        {tab.fields && tab.fields.length > 0 && (
          <Section
            section={{ 
              fields: tab.fields, 
              id: `tab-${tab.id || index}-fields`,
              columns: tab.columns 
            }}
            formikProps={formikProps}
            formConfig={formConfig}
            layout={layout}
            userRole={userRole}
          />
        )}
      </div>
      )
    };
  });

  return (
    <div className="tab-container">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size={formConfig.size}
        tabPosition="top"
        destroyOnHidden={false}
      />
    </div>
  );
};

export default TabContainer;
