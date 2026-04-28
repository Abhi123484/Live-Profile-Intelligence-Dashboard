import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

const ProfileBuilder = () => {
  const [profile, setProfile] = useState({
    fullName: '', location: '', gender: '', birthdate: '', phone: '',
    bio: '', skills: [], education: [],
    links: { github: '', linkedin: '', portfolio: '' }, photoUrl: ''
  });
  const [domains, setDomains] = useState([]);
  const [skillSelection, setSkillSelection] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchProfile(); fetchDomains(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/profile');
      if (res.data.userId) {
        setProfile({
          fullName: res.data.fullName || '',
          location: res.data.location || '',
          gender: res.data.gender || '',
          birthdate: res.data.birthdate || '',
          phone: res.data.phone || '',
          bio: res.data.bio || '',
          skills: res.data.skills || [],
          education: res.data.education || [],
          links: res.data.links || { github: '', linkedin: '', portfolio: '' },
          photoUrl: res.data.photoUrl || ''
        });
      }
    } catch (err) { console.error(err); }
  };

  const fetchDomains = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/domains');
      setDomains(res.data);
    } catch (err) {
      console.error('Failed to load available skills.');
    }
  };

  const handleAddSkill = () => {
    if (!skillSelection) {
      setError('Please select a skill from the admin list.');
      return;
    }
    if (!profile.skills.includes(skillSelection)) {
      setProfile({ ...profile, skills: [...profile.skills, skillSelection] });
    }
    setSkillSelection('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skill) => {
    setProfile({ ...profile, skills: profile.skills.filter(s => s !== skill) });
  };

  const handleAddEducation = () => {
    setProfile({ ...profile, education: [...profile.education, { institution: '', degree: '', year: '' }] });
  };

  const handleRemoveEducation = (index) => {
    setProfile({ ...profile, education: profile.education.filter((_, i) => i !== index) });
  };

  const handleEduChange = (index, field, value) => {
    const newEdu = [...profile.education];
    newEdu[index][field] = value;
    setProfile({ ...profile, education: newEdu });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!profile.fullName.trim()) {
      setError('Full name is required');
      return;
    }

    setSaving(true);
    try {
      await axios.post('http://localhost:5000/api/profile', profile);
      setSuccess('Profile saved! Your score has been updated.');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Calculate completion
  let completed = 0;
  const fields = ['fullName', 'location', 'gender', 'birthdate', 'phone', 'bio', 'photoUrl'];
  fields.forEach(f => { if (profile[f]) completed++; });
  if (profile.skills.length > 0) completed++;
  if (profile.education.length > 0) completed++;
  if (profile.links.github || profile.links.linkedin || profile.links.portfolio) completed++;
  const completionPct = Math.round((completed / 10) * 100);

  return (
    <div className="animate-in" style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ marginBottom: '4px' }}>Profile Builder</h1>
          <p>Complete your profile to boost your score</p>
        </div>
        <div className="glass-card" style={{ padding: '10px 20px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completion: </span>
          <span style={{ fontWeight: '700', color: completionPct === 100 ? 'var(--success)' : 'var(--accent-primary)' }}>{completionPct}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginBottom: '24px' }}>
        <div style={{ height: '100%', width: `${completionPct}%`, background: 'var(--accent-gradient)', borderRadius: '2px', transition: 'width 0.5s ease' }}></div>
      </div>

      {error && <div className="error-banner"><AlertCircle size={16} />{error}</div>}
      {success && <div className="success-banner"><CheckCircle size={16} style={{ marginRight: '8px' }} />{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Personal Info */}
        <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '20px' }}>Personal Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div>
              <label>Full Name *</label>
              <input type="text" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} placeholder="John Doe" />
            </div>
            <div>
              <label>Location</label>
              <input type="text" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} placeholder="City, Country" />
            </div>
            <div>
              <label>Gender</label>
              <select value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label>Birthdate</label>
              <input type="date" value={profile.birthdate} onChange={(e) => setProfile({ ...profile, birthdate: e.target.value })} />
            </div>
            <div>
              <label>Phone Number</label>
              <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label>Photo URL</label>
              <input type="url" value={profile.photoUrl} onChange={(e) => setProfile({ ...profile, photoUrl: e.target.value })} placeholder="https://example.com/photo.jpg" />
            </div>
          </div>
          <label>Bio</label>
          <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Write a short bio about yourself..." style={{ height: '80px' }} />
        </div>

        {/* Skills */}
        <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '16px' }}>Skills & Technologies</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '14px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <label>Select admin-defined skill</label>
              <select
                value={skillSelection}
                onChange={(e) => setSkillSelection(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ width: '100%', marginBottom: 0, color: '#111', background: '#fff' }}
              >
                <option value="">Choose a skill</option>
                {domains.map((domain) => (
                  <option key={domain._id} value={domain.name}>{domain.name}</option>
                ))}
              </select>
            </div>
            <button type="button" onClick={handleAddSkill} className="btn-primary" style={{ padding: '0 18px', flexShrink: 0 }}><Plus size={18} /></button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {profile.skills.map((skill, index) => (
              <div key={index} style={{
                background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)',
                padding: '6px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem'
              }}>
                {skill}
                <Trash2 size={12} onClick={() => handleRemoveSkill(skill)} style={{ cursor: 'pointer', color: 'var(--danger)', opacity: 0.7 }} />
              </div>
            ))}
            {profile.skills.length === 0 && <p style={{ fontSize: '0.8rem', margin: 0 }}>No skills added yet. Use the dropdown above to choose admin-added skills.</p>}
          </div>
        </div>

        {/* Education */}
        <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Education</h3>
            <button type="button" onClick={handleAddEducation} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>+ Add</button>
          </div>
          {profile.education.length === 0 && <p style={{ fontSize: '0.85rem' }}>No education added yet</p>}
          {profile.education.map((edu, index) => (
            <div key={index} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', marginBottom: '12px', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                <Trash2 size={14} onClick={() => handleRemoveEducation(index)} style={{ cursor: 'pointer', color: 'var(--danger)', opacity: 0.7 }} />
              </div>
              <input placeholder="Institution" value={edu.institution} onChange={(e) => handleEduChange(index, 'institution', e.target.value)} />
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <input placeholder="Degree" value={edu.degree} onChange={(e) => handleEduChange(index, 'degree', e.target.value)} />
                <input placeholder="Year" value={edu.year} onChange={(e) => handleEduChange(index, 'year', e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        {/* Links */}
        <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Social Links</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div><label>GitHub</label><input type="url" value={profile.links.github} onChange={(e) => setProfile({ ...profile, links: { ...profile.links, github: e.target.value } })} placeholder="https://github.com/..." /></div>
            <div><label>LinkedIn</label><input type="url" value={profile.links.linkedin} onChange={(e) => setProfile({ ...profile, links: { ...profile.links, linkedin: e.target.value } })} placeholder="https://linkedin.com/in/..." /></div>
            <div style={{ gridColumn: 'span 2' }}><label>Portfolio</label><input type="url" value={profile.links.portfolio} onChange={(e) => setProfile({ ...profile, links: { ...profile.links, portfolio: e.target.value } })} placeholder="https://yoursite.com" /></div>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={saving} style={{ width: '100%', padding: '16px' }}>
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Profile & Update Score'}
        </button>
      </form>
    </div>
  );
};

export default ProfileBuilder;
