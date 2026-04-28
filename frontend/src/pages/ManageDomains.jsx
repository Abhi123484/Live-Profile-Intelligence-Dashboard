import React, { useState, useEffect } from 'react';
import { getDomains, addDomain, deleteDomain } from '../services/adminApi';
import { Layers, Plus, Trash2, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const ManageDomains = () => {
  const [domains, setDomains] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const res = await getDomains();
      setDomains(res.data);
    } catch (err) {
      setError('Failed to load domains.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Domain name is required.');
      return;
    }
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await addDomain({ name: name.trim(), description: description.trim() });
      setName('');
      setDescription('');
      setSuccess('Domain added successfully!');
      fetchDomains();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add domain.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, domainName) => {
    if (!window.confirm(`Delete "${domainName}" and all its questions?`)) return;
    setError('');
    try {
      await deleteDomain(id);
      setSuccess('Domain deleted.');
      fetchDomains();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete domain.');
    }
  };

  return (
    <div className="animate-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <div style={{
          width: '42px', height: '42px',
          background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
        }}>
          <Layers size={22} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.6rem', background: 'linear-gradient(135deg, #c4b5fd, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Manage Domains
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {domains.length} domain{domains.length !== 1 ? 's' : ''} registered
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="error-banner" style={{ marginBottom: '16px' }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      {success && (
        <div className="success-banner" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      {/* Add Form */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '24px', borderColor: 'rgba(139, 92, 246, 0.1)' }}>
        <h3 style={{ marginBottom: '20px', color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add New Domain
        </h3>
        <form onSubmit={handleAdd}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label>Domain Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. JavaScript, React, Python"
                style={{ marginBottom: '0' }}
              />
            </div>
            <div>
              <label>Description (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this domain"
                style={{ marginBottom: '0' }}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: '16px',
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'var(--transition)',
              opacity: submitting ? 0.6 : 1
            }}
          >
            {submitting ? <Loader size={16} className="spin" /> : <Plus size={16} />}
            {submitting ? 'Adding...' : 'Add Domain'}
          </button>
        </form>
      </div>

      {/* Domain List */}
      <div className="glass-card" style={{ padding: '28px', borderColor: 'rgba(139, 92, 246, 0.1)' }}>
        <h3 style={{ marginBottom: '20px', color: '#c4b5fd' }}>All Domains</h3>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '58px', borderRadius: '10px' }} />)}
          </div>
        ) : domains.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No domains yet. Create your first domain above.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {domains.map((domain, index) => (
              <div
                key={domain._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(139, 92, 246, 0.08)',
                  borderRadius: '12px',
                  transition: 'var(--transition)',
                  animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '36px', height: '36px',
                    background: 'rgba(139, 92, 246, 0.12)',
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#a78bfa',
                    fontWeight: '700',
                    fontSize: '0.85rem'
                  }}>
                    {domain.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{domain.name}</div>
                    {domain.description && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {domain.description}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(domain._id, domain.name)}
                  style={{
                    padding: '8px 14px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    borderRadius: '8px',
                    color: 'var(--danger)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    transition: 'var(--transition)'
                  }}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageDomains;
