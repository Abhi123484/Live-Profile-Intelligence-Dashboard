import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Mail, CalendarDays, Loader, Trash2 } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
    } catch (err) {
      setError('Failed to delete user.');
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/users');
        setUsers(res.data);
      } catch (err) {
        setError('Failed to load users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ marginBottom: '4px' }}>Total Users</h1>
          <p>View all registered users with name and email.</p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Loader size={20} className="spin" /> Loading users...
          </div>
        ) : error ? (
          <div style={{ color: 'var(--danger)' }}>{error}</div>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div style={{ display: 'grid', gap: '14px' }}>
            {users.map((user) => (
              <div key={user._id} style={{ padding: '18px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139,92,246,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(139,92,246,0.12)', display: 'grid', placeItems: 'center' }}>
                    <Users size={18} color="#8b5cf6" />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '1rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={14} /> {user.email}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CalendarDays size={14} /> {new Date(user.createdAt).toLocaleDateString()}</div>
                  <button onClick={() => deleteUser(user._id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '4px 8px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
