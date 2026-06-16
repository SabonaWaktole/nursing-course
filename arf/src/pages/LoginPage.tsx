import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      login(data);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar />
      <main className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
        <div className="auth-card glass" style={{ maxWidth: '400px', width: '100%', padding: '40px', borderRadius: '20px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Welcome Back</h2>
          {error && <div style={{ color: '#ef4444', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '8px' }}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-main)' }}
              />
            </div>
            <div>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '8px' }}>Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-main)' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ width: '100%', marginTop: '8px', padding: '12px', justifyContent: 'center' }}>
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
          <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--accent)' }}>Register</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
