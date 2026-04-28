import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, LogIn, UserCircle, BookOpen, Zap } from 'lucide-react';

const ACTION_CONFIG = {
  login: { icon: LogIn, color: '#38bdf8', label: 'Logged In' },
  register: { icon: UserCircle, color: '#22c55e', label: 'Account Created' },
  profile_update: { icon: UserCircle, color: '#818cf8', label: 'Profile Updated' },
  default: { icon: Zap, color: '#f59e0b', label: 'Activity' }
};

const getActionConfig = (action) => {
  if (action.startsWith('assessment_complete')) {
    return { icon: BookOpen, color: '#f59e0b', label: `Completed Assessment: ${action.replace('assessment_complete_', '')}` };
  }
  return ACTION_CONFIG[action] || ACTION_CONFIG.default;
};

const ActivityPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchActivities(); }, []);

  const fetchActivities = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/activity');
      setActivities(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const d = new Date(timestamp);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  if (loading) return (
    <div>
      {[1,2,3,4,5].map(i => (
        <div key={i} className="glass-card" style={{ padding: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%' }}></div>
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: '60%', height: '14px', marginBottom: '6px' }}></div>
            <div className="skeleton" style={{ width: '30%', height: '10px' }}></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="animate-in">
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ marginBottom: '4px' }}>Activity Log</h1>
        <p>{activities.length} activities tracked — every action counts toward your score</p>
      </div>

      {activities.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <Activity size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <h3>No Activity Yet</h3>
          <p>Start using the platform to build your activity score.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {activities.map((act, idx) => {
            const config = getActionConfig(act.action);
            const Icon = config.icon;
            return (
              <div key={act._id || idx} className="glass-card" style={{
                padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px'
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: `${config.color}15`,
                  border: `1px solid ${config.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Icon size={18} color={config.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{config.label}</div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {formatTime(act.timestamp)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityPage;
