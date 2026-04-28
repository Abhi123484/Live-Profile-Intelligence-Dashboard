import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, UserCircle, BookOpen, Trophy, Activity, Share2, LogOut, Zap } from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/profile', icon: UserCircle, label: 'Profile Builder' },
  { path: '/assessments', icon: BookOpen, label: 'Assessments' },
  { path: '/badges', icon: Trophy, label: 'Badges' },
  { path: '/activity', icon: Activity, label: 'Activity Log' },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={{
      width: collapsed ? '70px' : '250px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--glass-border)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'var(--transition)',
      zIndex: 100,
      backdropFilter: 'blur(20px)',
      overflow: 'hidden'
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 15px' : '20px 24px',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        minHeight: '70px'
      }} onClick={onToggle}>
        <div style={{
          width: '36px', height: '36px',
          background: 'var(--accent-gradient)',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          <Zap size={20} color="white" />
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>ProfileIQ</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Intelligence Dashboard</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: collapsed ? '12px 18px' : '12px 16px',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
              background: isActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
              fontWeight: isActive ? '600' : '400',
              fontSize: '0.875rem',
              transition: 'var(--transition)',
              whiteSpace: 'nowrap'
            })}
          >
            <item.icon size={20} style={{ flexShrink: 0 }} />
            {!collapsed && item.label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div style={{
        padding: collapsed ? '16px 8px' : '16px',
        borderTop: '1px solid var(--glass-border)',
      }}>
        {!collapsed && user && (
          <div style={{
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255,255,255,0.03)',
            marginBottom: '10px',
            fontSize: '0.8rem'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '2px' }}>{user.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{user.email}</div>
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
            borderRadius: 'var(--radius-sm)',
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
  );
};

export default Sidebar;
