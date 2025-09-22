import React, { useState } from 'react';
import { Tabs } from 'antd';
import Section from './Section';
import { isRoleVisible } from '../../lib/roles';
const TabContainer = ({ tabs, formikProps, formConfig, layout, userRole }) => {
  const visibleTabs = tabs.filter(tab => !userRole || isRoleVisible(userRole, tab));
  const [activeTab, setActiveTab] = useState(visibleTabs[0]?.id || '0');
  const tabItems = visibleTabs.map((tab, index) => {
    const { destroyInactiveTabPane, ...cleanTab } = tab;
    return {
      key: cleanTab.id || String(index),
      label: cleanTab.title || `Tab ${index + 1}`,
      destroyOnHidden: false, 
      children: (
      <div className="tab-content">
        {}
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
        {}
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
