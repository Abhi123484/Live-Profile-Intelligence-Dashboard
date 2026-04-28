import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Layers, HelpCircle, LogOut, Shield, ArrowLeft, Users } from 'lucide-react';

const adminNavItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/admin/domains', icon: Layers, label: 'Manage Domains' },
  { path: '/admin/questions', icon: HelpCircle, label: 'Manage Questions' },
  { path: '/admin/users', icon: Users, label: 'Total Users' },
];

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: collapsed ? '70px' : '260px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        background: 'linear-gradient(180deg, rgba(15, 10, 35, 0.98) 0%, rgba(10, 15, 30, 0.98) 100%)',
        borderRight: '1px solid rgba(139, 92, 246, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'var(--transition)',
        zIndex: 100,
        backdropFilter: 'blur(20px)',
        overflow: 'hidden'
      }}>
        {/* Logo */}
        <div
          style={{
            padding: collapsed ? '20px 15px' : '20px 24px',
            borderBottom: '1px solid rgba(139, 92, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            minHeight: '70px'
          }}
          onClick={() => setCollapsed(!collapsed)}
        >
          <div style={{
            width: '38px', height: '38px',
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
          }}>
            <Shield size={20} color="white" />
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', whiteSpace: 'nowrap', background: 'linear-gradient(135deg, #c4b5fd, #f9a8d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Admin Panel</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Control Center</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {adminNavItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: collapsed ? '12px 18px' : '12px 16px',
                borderRadius: '10px',
                textDecoration: 'none',
                color: isActive ? '#c4b5fd' : 'var(--text-secondary)',
                background: isActive ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                fontWeight: isActive ? '600' : '400',
                fontSize: '0.875rem',
                transition: 'var(--transition)',
                whiteSpace: 'nowrap',
                borderLeft: isActive ? '3px solid #8b5cf6' : '3px solid transparent'
              })}
            >
              <item.icon size={20} style={{ flexShrink: 0 }} />
              {!collapsed && item.label}
            </NavLink>
          ))}

          <div style={{ borderTop: '1px solid rgba(139, 92, 246, 0.1)', margin: '12px 0' }} />

          <NavLink
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: collapsed ? '12px 18px' : '12px 16px',
              borderRadius: '10px',
              textDecoration: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              transition: 'var(--transition)',
              whiteSpace: 'nowrap'
            }}
          >
            <ArrowLeft size={18} style={{ flexShrink: 0 }} />
            {!collapsed && 'Back to App'}
          </NavLink>
        </nav>

        {/* User */}
        <div style={{ padding: collapsed ? '16px 8px' : '16px', borderTop: '1px solid rgba(139, 92, 246, 0.15)' }}>
          {!collapsed && user && (
            <div style={{
              padding: '12px',
              borderRadius: '10px',
              background: 'rgba(139, 92, 246, 0.08)',
              marginBottom: '10px',
              fontSize: '0.8rem'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '2px', color: '#c4b5fd' }}>{user.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{user.email}</div>
              <div style={{
                marginTop: '6px',
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                fontSize: '0.68rem',
                color: '#c4b5fd',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Admin
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: '10px',
              padding: '10px 14px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              borderRadius: '10px',
              color: 'var(--danger)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '500',
              transition: 'var(--transition)'
            }}
          >
            <LogOut size={18} />
            {!collapsed && 'Logout'}
          </button>
        </div>
      </aside>

      <main style={{
        flex: 1,
        marginLeft: collapsed ? '70px' : '260px',
        transition: 'var(--transition)',
        padding: '30px',
        maxWidth: '100%',
        overflow: 'auto'
      }}>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
