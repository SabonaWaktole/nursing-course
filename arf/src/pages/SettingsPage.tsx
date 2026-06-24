import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const parts = user.name?.split(' ') || [];
    setFirstName(parts[0] || '');
    setLastName(parts.slice(1).join(' ') || '');
    setEmail(user.email || '');

    setIsLightMode(document.documentElement.getAttribute('data-theme') === 'light');
  }, [user, navigate]);

  const toggleTheme = () => {
    const next = !isLightMode;
    setIsLightMode(next);
    if (next) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileStatus(null);

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const res = await fetchApi('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: fullName, email })
      });
      if (res.user) {
        // Simple way to refresh user state in context without full reload, 
        // though we might just reload or use a specialized context method if one exists.
        // For now, let's just show success.
      }
      setProfileStatus({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err: any) {
      setProfileStatus({ type: 'error', message: err.message || 'Failed to update profile' });
    } finally {
      setSavingProfile(false);
      setTimeout(() => setProfileStatus(null), 3000);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordStatus(null);

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match' });
      setSavingPassword(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Password must be at least 6 characters' });
      setSavingPassword(false);
      return;
    }

    try {
      await fetchApi('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      setPasswordStatus({ type: 'success', message: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordStatus({ type: 'error', message: err.message || 'Failed to update password' });
    } finally {
      setSavingPassword(false);
      setTimeout(() => setPasswordStatus(null), 3000);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.')) {
      return;
    }
    try {
      await fetchApi('/auth/account', { method: 'DELETE' });
      logout();
      navigate('/');
    } catch (err: any) {
      alert(err.message || 'Failed to delete account');
    }
  };

  if (!user) return null;

  return (
    <div className="settings-page">
      <Navbar />
      
      <main className="container" style={{ padding: '120px 20px', maxWidth: '800px' }}>
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>Account Settings</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your profile, security protocols, and preferences.</p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Profile Section */}
          <section className="glass" style={{ padding: '40px', borderRadius: '24px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>Profile Information</h2>
            
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {profileStatus && (
                <div style={{ padding: '16px', borderRadius: '12px', background: profileStatus.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: profileStatus.type === 'success' ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                  {profileStatus.message}
                </div>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)' }}>First Name</label>
                  <input 
                    type="text" 
                    value={firstName} 
                    onChange={e => setFirstName(e.target.value)}
                    required
                    style={{ background: 'var(--bg-main)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Last Name</label>
                  <input 
                    type="text" 
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)}
                    style={{ background: 'var(--bg-main)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{ background: 'var(--bg-main)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="submit" disabled={savingProfile} className="btn btn-primary" style={{ padding: '16px 32px' }}>
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </section>

          {/* Preferences */}
          <section className="glass" style={{ padding: '40px', borderRadius: '24px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>App Preferences</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)', padding: '24px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>Theme Appearance</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Toggle between Light and Dark mode interface.</p>
              </div>
              <button 
                onClick={toggleTheme}
                style={{ 
                  width: '60px', height: '32px', borderRadius: '16px', 
                  background: isLightMode ? '#cbd5e1' : 'var(--accent)', 
                  position: 'relative', cursor: 'pointer', border: 'none', transition: 'background 0.3s'
                }}
              >
                <div style={{ 
                  width: '24px', height: '24px', borderRadius: '50%', background: 'white', 
                  position: 'absolute', top: '4px', left: isLightMode ? '4px' : '32px', transition: 'left 0.3s' 
                }}></div>
              </button>
            </div>
          </section>

          {/* Security Section */}
          <section className="glass" style={{ padding: '40px', borderRadius: '24px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>Security & Authentication</h2>
            
            <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {passwordStatus && (
                <div style={{ padding: '16px', borderRadius: '12px', background: passwordStatus.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: passwordStatus.type === 'success' ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                  {passwordStatus.message}
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword} 
                  onChange={e => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  style={{ background: 'var(--bg-main)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)' }}>New Password</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  placeholder="Min. 6 characters"
                  style={{ background: 'var(--bg-main)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                  style={{ background: 'var(--bg-main)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '16px' }}>
                <button type="submit" disabled={savingPassword} className="btn btn-secondary" style={{ padding: '16px 32px' }}>
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </section>

          {/* Account Session & Danger Zone */}
          <section className="glass" style={{ padding: '40px', borderRadius: '24px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>Account Management</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>End Current Session</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Securely log out of your account on this device.</p>
              </div>
              <button onClick={() => { logout(); navigate('/'); }} className="btn btn-secondary">Log Out</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '4px', color: '#ef4444' }}>Delete Account</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Permanently remove your account and all data.</p>
              </div>
              <button onClick={handleDeleteAccount} className="btn btn-primary" style={{ background: '#ef4444', color: 'white' }}>Delete Account</button>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SettingsPage;
