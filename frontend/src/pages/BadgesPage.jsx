import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Lock } from 'lucide-react';

const BADGE_INFO = {
  'Profile Complete': { icon: '👤', description: 'Fill out 100% of your profile', color: '#38bdf8' },
  'First Assessment': { icon: '📝', description: 'Complete your first skill quiz', color: '#22c55e' },
  'Quiz Master': { icon: '🏅', description: 'Score 80%+ average across 5 assessments', color: '#f59e0b' },
  'Bronze Achiever': { icon: '🥉', description: 'Reach Bronze level', color: '#cd7f32' },
  'Silver Achiever': { icon: '🥈', description: 'Reach Silver level (250+ XP)', color: '#c0c0c0' },
  'Gold Achiever': { icon: '🥇', description: 'Reach Gold level (500+ XP)', color: '#ffd700' },
  'Platinum Legend': { icon: '💎', description: 'Reach Platinum level (750+ XP)', color: '#e5e4e2' },
  'Active Contributor': { icon: '⚡', description: 'Perform 10+ platform activities', color: '#818cf8' },
  'Skill Collector': { icon: '🧩', description: 'Add 5+ skills to your profile', color: '#ec4899' }
};

const BadgesPage = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBadges(); }, []);

  const fetchBadges = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/badges/types');
      setBadges(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const unlocked = badges.filter(b => b.unlocked).length;

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className="glass-card" style={{ padding: '30px' }}>
          <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 16px' }}></div>
          <div className="skeleton" style={{ width: '80%', height: '16px', margin: '0 auto 8px' }}></div>
          <div className="skeleton" style={{ width: '60%', height: '12px', margin: '0 auto' }}></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="animate-in">
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ marginBottom: '4px' }}>Badge Collection</h1>
        <p>{unlocked} of {badges.length} badges unlocked</p>
      </div>

      {/* Progress */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
          <span>Collection Progress</span>
          <span style={{ color: 'var(--accent-primary)' }}>{Math.round((unlocked / badges.length) * 100)}%</span>
        </div>
        <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${(unlocked / badges.length) * 100}%`,
            background: 'var(--accent-gradient)', borderRadius: '4px', transition: 'width 0.8s ease'
          }}></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {badges.map(badge => {
          const info = BADGE_INFO[badge.badgeType] || { icon: '🏆', description: '', color: '#94a3b8' };
          return (
            <div key={badge.badgeType} className="glass-card" style={{
              padding: '28px', textAlign: 'center',
              opacity: badge.unlocked ? 1 : 0.4,
              position: 'relative'
            }}>
              {!badge.unlocked && (
                <Lock size={16} style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--text-muted)' }} />
              )}
              <div style={{
                width: '64px', height: '64px', margin: '0 auto 16px',
                borderRadius: '50%',
                background: badge.unlocked ? `${info.color}22` : 'rgba(255,255,255,0.03)',
                border: `2px solid ${badge.unlocked ? info.color : 'var(--glass-border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.8rem'
              }}>
                {info.icon}
              </div>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '6px' }}>{badge.badgeType}</h3>
              <p style={{ fontSize: '0.8rem', margin: 0 }}>{info.description}</p>
              {badge.unlocked && badge.unlockedAt && (
                <div style={{ marginTop: '12px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgesPage;
