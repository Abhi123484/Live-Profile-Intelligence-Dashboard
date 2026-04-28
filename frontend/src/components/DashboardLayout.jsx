import React, { useState } from 'react';
import Sidebar from './Sidebar';
import BadgeNotification from './BadgeNotification';

const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main style={{
        flex: 1,
        marginLeft: collapsed ? '70px' : '250px',
        transition: 'var(--transition)',
        padding: '30px',
        maxWidth: '100%',
        overflow: 'auto'
      }}>
        {children}
      </main>
      <BadgeNotification />
    </div>
  );
};

export default DashboardLayout;
