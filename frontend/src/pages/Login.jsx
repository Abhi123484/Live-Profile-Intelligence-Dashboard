import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Zap } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      // Role-based redirect
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px',
      background: 'var(--bg-primary)',
      backgroundImage: 'radial-gradient(at 30% 20%, rgba(56, 189, 248, 0.15) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(129, 140, 248, 0.1) 0px, transparent 50%)'
    }}>
      <div className="glass-card animate-in" style={{ padding: '48px', width: '100%', maxWidth: '420px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '42px', height: '42px', background: 'var(--accent-gradient)',
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Zap size={22} color="white" />
          </div>
          <span style={{ fontWeight: '800', fontSize: '1.3rem' }}>ProfileIQ</span>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Welcome Back</h2>
        <p style={{ textAlign: 'center', marginBottom: '30px' }}>Sign in to your intelligence dashboard</p>

        {error && (
          <div className="error-banner">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label>Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              style={{ paddingLeft: '40px' }}
            />
          </div>

          <label>Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ paddingLeft: '40px' }}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}
            style={{ width: '100%', padding: '14px', marginTop: '8px' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: '600' }}>
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
