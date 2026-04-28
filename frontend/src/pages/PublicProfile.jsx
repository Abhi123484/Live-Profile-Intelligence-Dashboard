import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ScoreRing from '../components/ScoreRing';
import CalendarHeatmap from '../components/CalendarHeatmap';
import { MapPin, ExternalLink, Award, Zap } from 'lucide-react';

const LEVEL_COLORS = { Bronze: '#cd7f32', Silver: '#c0c0c0', Gold: '#ffd700', Platinum: '#e5e4e2' };

const PublicProfile = () => {
  const { userId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPublicData(); }, [userId]);

  const fetchPublicData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/scores/public/${userId}`);
      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="skeleton" style={{ width: '200px', height: '20px' }}></div>
    </div>
  );

  if (!data || !data.user) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
        <h2>Profile Not Found</h2>
        <p>This profile doesn't exist or has been removed.</p>
      </div>
    </div>
  );

  const { user, profile, score } = data;
  const levelColor = LEVEL_COLORS[score.level] || '#94a3b8';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', justifyContent: 'center', padding: '60px 20px',
      backgroundImage: 'radial-gradient(at 30% 20%, rgba(56, 189, 248, 0.12) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(129, 140, 248, 0.1) 0px, transparent 50%)'
    }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
          <Zap size={20} color="var(--accent-primary)" />
          <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-muted)' }}>ProfileIQ Score Card</span>
        </div>

        <div className="glass-card animate-in" style={{ padding: '48px', textAlign: 'center' }}>
          {/* Avatar */}
          <div style={{
            width: '100px', height: '100px', margin: '0 auto 20px', borderRadius: '50%',
            overflow: 'hidden', border: `3px solid ${levelColor}`,
            background: 'rgba(255,255,255,0.05)'
          }}>
            {profile.photoUrl ? (
              <img src={profile.photoUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '800', color: levelColor }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <h1 style={{ marginBottom: '4px' }}>{profile.fullName || user.name}</h1>
          {profile.location && (
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
              <MapPin size={14} /> {profile.location}
            </p>
          )}
          {profile.bio && <p style={{ maxWidth: '400px', margin: '0 auto 24px' }}>{profile.bio}</p>}

          {/* Score + Level */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '30px' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: levelColor }}>{score.level || 'Bronze'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Level</div>
            </div>
            <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{score.xp || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total XP</div>
            </div>
          </div>

          <ScoreRing score={score.totalScore || 0} label="Intelligence Score" size={160} />

          {/* Activity Heatmap */}
          <CalendarHeatmap userId={userId} isPublic={true} />

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Top Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
                {profile.skills.slice(0, 8).map(skill => (
                  <span key={skill} style={{
                    background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)',
                    padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem'
                  }}>{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {profile.links && (profile.links.github || profile.links.linkedin || profile.links.portfolio) && (
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
              {profile.links.github && <a href={profile.links.github} target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)' }}><ExternalLink size={20} /></a>}
              {profile.links.linkedin && <a href={profile.links.linkedin} target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)' }}><ExternalLink size={20} /></a>}
              {profile.links.portfolio && <a href={profile.links.portfolio} target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)' }}><ExternalLink size={20} /></a>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
