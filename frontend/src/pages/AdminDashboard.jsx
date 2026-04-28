import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStats } from '../services/adminApi';
import { Users, Layers, HelpCircle, TrendingUp, Shield, Sparkles } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalDomains: 0, totalQuestions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await getAdminStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
      glow: 'rgba(59, 130, 246, 0.3)',
      bgAccent: 'rgba(59, 130, 246, 0.1)',
      onClick: () => navigate('/admin/users')
    },
    {
      label: 'Total Domains',
      value: stats.totalDomains,
      icon: Layers,
      gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
      glow: 'rgba(139, 92, 246, 0.3)',
      bgAccent: 'rgba(139, 92, 246, 0.1)'
    },
    {
      label: 'Total Questions',
      value: stats.totalQuestions,
      icon: HelpCircle,
      gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
      glow: 'rgba(236, 72, 153, 0.3)',
      bgAccent: 'rgba(236, 72, 153, 0.1)'
    }
  ];

  return (
    <div className="animate-in">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            width: '42px', height: '42px',
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 25px rgba(139, 92, 246, 0.3)'
          }}>
            <Shield size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', background: 'linear-gradient(135deg, #c4b5fd, #f9a8d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Admin Dashboard
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              System overview & management
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {statCards.map((card, i) => (
          <div
            key={i}
            className="glass-card"
            onClick={card.onClick}
            style={{
              padding: '28px',
              position: 'relative',
              overflow: 'hidden',
              borderColor: 'rgba(139, 92, 246, 0.1)',
              cursor: card.onClick ? 'pointer' : 'default'
            }}
          >
            {/* Background glow */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '100px',
              height: '100px',
              background: card.bgAccent,
              borderRadius: '50%',
              filter: 'blur(30px)'
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{
                  width: '48px', height: '48px',
                  background: card.gradient,
                  borderRadius: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 4px 15px ${card.glow}`
                }}>
                  <card.icon size={24} color="white" />
                </div>
                <TrendingUp size={18} style={{ color: 'var(--success)', opacity: 0.6 }} />
              </div>
              <div style={{
                fontSize: loading ? '1.5rem' : '2.2rem',
                fontWeight: '800',
                letterSpacing: '-0.03em',
                marginBottom: '4px',
                color: 'var(--text-primary)'
              }}>
                {loading ? '...' : card.value}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="glass-card" style={{ padding: '28px', borderColor: 'rgba(139, 92, 246, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Sparkles size={18} style={{ color: '#c4b5fd' }} />
          <h3 style={{ color: '#c4b5fd' }}>Quick Actions</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <a href="/admin/domains" style={{
            padding: '18px 20px',
            background: 'rgba(139, 92, 246, 0.08)',
            border: '1px solid rgba(139, 92, 246, 0.15)',
            borderRadius: '12px',
            color: '#c4b5fd',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'var(--transition)',
            cursor: 'pointer'
          }}>
            <Layers size={20} />
            Manage Domains
          </a>
          <a href="/admin/questions" style={{
            padding: '18px 20px',
            background: 'rgba(236, 72, 153, 0.08)',
            border: '1px solid rgba(236, 72, 153, 0.15)',
            borderRadius: '12px',
            color: '#f9a8d4',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'var(--transition)',
            cursor: 'pointer'
          }}>
            <HelpCircle size={20} />
            Manage Questions
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
