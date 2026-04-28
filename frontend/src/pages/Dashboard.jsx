import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ScoreRing from '../components/ScoreRing';
import CalendarHeatmap from '../components/CalendarHeatmap';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import { User, Award, Activity, Share2, TrendingUp, ChevronRight, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const LEVEL_COLORS = { Bronze: '#cd7f32', Silver: '#c0c0c0', Gold: '#ffd700', Platinum: '#e5e4e2' };
const LEVEL_THRESHOLDS = [
  { name: 'Bronze', min: 0 },
  { name: 'Silver', min: 250 },
  { name: 'Gold', min: 500 },
  { name: 'Platinum', min: 750 }
];

const SkeletonCard = ({ height = '200px' }) => (
  <div className="glass-card" style={{ padding: '30px' }}>
    <div className="skeleton" style={{ height, width: '100%' }}></div>
  </div>
);

const PillarBar = ({ label, score, maxScore, color, icon: Icon }) => {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon size={16} color={color} />
          <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{label}</span>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{score}/{maxScore}</span>
      </div>
      <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color,
          borderRadius: '4px', transition: 'width 0.8s ease-out'
        }}></div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [scoreData, setScoreData] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const socket = useSocket();

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (socket) {
      socket.on('scoreUpdate', (data) => {
        setScoreData(prev => ({ ...prev, ...data }));
      });
    }
  }, [socket]);

  const fetchData = async () => {
    try {
      const [scoreRes, badgeRes] = await Promise.all([
        axios.get('http://localhost:5000/api/scores/my-score'),
        axios.get('http://localhost:5000/api/badges')
      ]);
      if (scoreRes.data.totalScore !== undefined) setScoreData(scoreRes.data);
      else setScoreData({ totalScore: 0, profileScore: 0, assessmentScore: 0, activityScore: 0, level: 'Bronze', xp: 0 });
      setBadges(badgeRes.data);
    } catch (err) {
      console.error(err);
      setScoreData({ totalScore: 0, profileScore: 0, assessmentScore: 0, activityScore: 0, level: 'Bronze', xp: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (user?.id) {
      navigator.clipboard.writeText(`${window.location.origin}/public/${user.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
      <SkeletonCard height="300px" />
      <div style={{ display: 'grid', gap: '24px' }}>
        <SkeletonCard height="136px" />
        <SkeletonCard height="136px" />
      </div>
    </div>
  );

  const s = scoreData;
  const currentLevelIdx = LEVEL_THRESHOLDS.findIndex(l => l.name === s.level);
  const nextLevel = LEVEL_THRESHOLDS[currentLevelIdx + 1];
  const currentMin = LEVEL_THRESHOLDS[currentLevelIdx]?.min || 0;
  const nextMin = nextLevel ? nextLevel.min : 1000;
  const levelProgress = ((s.totalScore - currentMin) / (nextMin - currentMin)) * 100;

  return (
    <div className="animate-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ marginBottom: '4px' }}>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Here's your real-time intelligence snapshot</p>
        </div>
        <div className="glass-card" style={{
          padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${LEVEL_COLORS[s.level]}, ${LEVEL_COLORS[s.level]}88)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Award size={20} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: LEVEL_COLORS[s.level] }}>{s.level}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.xp} XP</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '24px', marginBottom: '24px' }}>
        {/* Score Ring Card */}
        <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ScoreRing score={s.totalScore} label="Total Score" size={180} />

          {/* XP Progress Bar */}
          <div style={{ width: '100%', marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
              <span style={{ color: LEVEL_COLORS[s.level] }}>{s.level}</span>
              <span style={{ color: 'var(--text-muted)' }}>{nextLevel ? nextLevel.name : 'Max'}</span>
            </div>
            <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
              <div style={{
                height: '100%', width: `${Math.min(levelProgress, 100)}%`,
                background: `linear-gradient(90deg, ${LEVEL_COLORS[s.level]}, var(--accent-primary))`,
                borderRadius: '5px', transition: 'width 1s ease-out'
              }}></div>
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              {nextLevel ? `${nextMin - s.totalScore} XP to ${nextLevel.name}` : 'Maximum level reached!'}
            </div>
          </div>
        </div>

        {/* Pillar Breakdown + Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Score Breakdown Panel */}
          <div className="glass-card" style={{ padding: '28px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Score Breakdown</h3>
              <TrendingUp size={18} color="var(--accent-primary)" />
            </div>
            <PillarBar label="Profile Completeness (30%)" score={s.profileScore} maxScore={300} color="#38bdf8" icon={User} />
            <PillarBar label="Assessment Performance (40%)" score={s.assessmentScore} maxScore={400} color="#f59e0b" icon={Award} />
            <PillarBar label="Platform Activity (30%)" score={s.activityScore} maxScore={300} color="#22c55e" icon={Activity} />
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <Link to="/profile" className="glass-card" style={{
              padding: '20px', textAlign: 'center', textDecoration: 'none', color: 'inherit',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
            }}>
              <User size={28} color="#38bdf8" />
              <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>Edit Profile</span>
              <ChevronRight size={14} color="var(--text-muted)" />
            </Link>
            <Link to="/assessments" className="glass-card" style={{
              padding: '20px', textAlign: 'center', textDecoration: 'none', color: 'inherit',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
            }}>
              <Award size={28} color="#f59e0b" />
              <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>Take Quiz</span>
              <ChevronRight size={14} color="var(--text-muted)" />
            </Link>
            <Link to="/badges" className="glass-card" style={{
              padding: '20px', textAlign: 'center', textDecoration: 'none', color: 'inherit',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
            }}>
              <Award size={28} color="#818cf8" />
              <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>Badges ({badges.length})</span>
              <ChevronRight size={14} color="var(--text-muted)" />
            </Link>
          </div>
        </div>
      </div>

      {/* Consistency Heatmap */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <CalendarHeatmap />
      </div>

      {/* Share Card */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ marginBottom: '4px' }}>Share Your Achievement</h3>
          <p>Generate a public link to showcase to recruiters and networks.</p>
        </div>
        <button onClick={handleCopyLink} className="btn-primary" style={{ gap: '8px' }}>
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied ? 'Copied!' : 'Copy Share Link'}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
