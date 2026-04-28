import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { Trophy, X } from 'lucide-react';

const BADGE_ICONS = {
  'Profile Complete': '👤',
  'First Assessment': '📝',
  'Quiz Master': '🏅',
  'Bronze Achiever': '🥉',
  'Silver Achiever': '🥈',
  'Gold Achiever': '🥇',
  'Platinum Legend': '💎',
  'Active Contributor': '⚡',
  'Skill Collector': '🧩'
};

const BadgeNotification = () => {
  const [toasts, setToasts] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('badgeUnlocked', (data) => {
        const id = Date.now();
        setToasts(prev => [...prev, { ...data, id }]);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
      });
    }
  }, [socket]);

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      {toasts.map(toast => (
        <div key={toast.id} style={{
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(129, 140, 248, 0.15))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          minWidth: '320px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          animation: 'slideInRight 0.5s ease-out',
          boxShadow: '0 8px 32px rgba(56, 189, 248, 0.2)'
        }}>
          <div style={{
            width: '50px', height: '50px',
            background: 'var(--accent-gradient)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem',
            animation: 'pulse 1s ease-in-out 3'
          }}>
            {BADGE_ICONS[toast.badgeType] || '🏆'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
              Badge Unlocked!
            </div>
            <div style={{ fontWeight: '700', fontSize: '1rem' }}>{toast.badgeType}</div>
          </div>
          <button onClick={() => dismissToast(toast.id)} style={{
            background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px'
          }}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default BadgeNotification;
