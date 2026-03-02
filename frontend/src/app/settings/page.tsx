'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import RoleGuard from '@/components/RoleGuard';
import { motion, AnimatePresence } from 'framer-motion';
import StudentSidebar from '@/components/StudentSidebar';
import AdminSidebar from '@/components/AdminSidebar';

export default function SettingsPage() {
    const { user, updateUser } = useAuth();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [savingProfile, setSavingProfile] = useState(false);

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [savingPassword, setSavingPassword] = useState(false);

    // Sidebar State
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (user && user.name) {
            const parts = user.name.split(' ');
            setFirstName(parts[0] || '');
            setLastName(parts.slice(1).join(' ') || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);
        setProfileStatus(null);

        try {
            const fullName = `${firstName}${lastName ? ' ' + lastName : ''}`.trim();
            const res = await api.put('/auth/profile', { name: fullName, email });
            if (res.data.user) {
                updateUser(res.data.user);
            }
            setProfileStatus({ type: 'success', message: 'Profile updated successfully!' });
        } catch (error: any) {
            setProfileStatus({
                type: 'error',
                message: error.response?.data?.message || 'Failed to update profile'
            });
        } finally {
            setSavingProfile(false);
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
            await api.put('/auth/password', { currentPassword, newPassword });
            setPasswordStatus({ type: 'success', message: 'Password updated successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setPasswordStatus({
                type: 'error',
                message: error.response?.data?.message || 'Failed to update password'
            });
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <RoleGuard allowedRoles={['STUDENT', 'ADMIN']}>
            <div className={`flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-sans antialiased transition-colors duration-200 relative`}>
                {user?.role === 'ADMIN' ? (
                    <AdminSidebar
                        tab="settings"
                        isSidebarCollapsed={isSidebarCollapsed}
                        setIsSidebarCollapsed={setIsSidebarCollapsed}
                        isMobileMenuOpen={isMobileMenuOpen}
                        setIsMobileMenuOpen={setIsMobileMenuOpen}
                    />
                ) : (
                    <StudentSidebar />
                )}

                <main className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="max-w-4xl mx-auto"
                    >
                        <header className="mb-10">
                            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Account Settings</h2>
                            <p className="text-slate-500 dark:text-slate-400">Manage your profile, security protocols, and administrative preferences.</p>
                        </header>

                        <motion.div
                            initial="hidden"
                            animate="show"
                            variants={{
                                hidden: { opacity: 0 },
                                show: {
                                    opacity: 1,
                                    transition: { staggerChildren: 0.15 }
                                }
                            }}
                            className="space-y-8"
                        >
                            {/* Profile Section */}
                            <motion.section
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    show: { opacity: 1, y: 0 }
                                }}
                                className="bg-white dark:bg-surface rounded-2xl border border-slate-200 dark:border-border-muted overflow-hidden shadow-xl"
                            >
                                <div className="p-6 border-b border-slate-100 dark:border-border-muted flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Profile Information</h3>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded">Public Profile</span>
                                </div>
                                <div className="p-8">
                                    <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
                                        <div className="relative group">
                                            <div className="w-24 h-24 rounded-full border-2 border-primary p-1">
                                                <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                                    <span className="material-symbols-outlined text-4xl text-primary">person</span>
                                                </div>
                                            </div>
                                            <button className="absolute bottom-0 right-0 bg-primary text-white dark:text-background-dark p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                                                <span className="material-symbols-outlined text-sm font-bold">edit</span>
                                            </button>
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{user?.name || 'User Name'}</h4>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 capitalize">{user?.role?.toLowerCase()} • Member starting from {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="bg-primary hover:bg-primary/90 text-white dark:text-background-dark text-sm font-bold py-2.5 px-6 rounded-lg transition-colors shadow-lg shadow-primary/20"
                                            >
                                                Upload New Avatar
                                            </motion.button>
                                        </div>
                                    </div>

                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        {profileStatus && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${profileStatus.type === 'success'
                                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                                                    : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                                                    }`}
                                            >
                                                <span className="material-symbols-outlined text-xl">
                                                    {profileStatus.type === 'success' ? 'check_circle' : 'error'}
                                                </span>
                                                <p>{profileStatus.message}</p>
                                            </motion.div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">First Name</label>
                                                <input
                                                    className="bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-muted text-slate-900 dark:text-white text-sm rounded-xl focus:ring-primary focus:border-primary block w-full p-3.5 transition-all outline-none"
                                                    type="text"
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Last Name</label>
                                                <input
                                                    className="bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-muted text-slate-900 dark:text-white text-sm rounded-xl focus:ring-primary focus:border-primary block w-full p-3.5 transition-all outline-none"
                                                    type="text"
                                                    value={lastName}
                                                    onChange={(e) => setLastName(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Email Address</label>
                                                <input
                                                    className="bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-muted text-slate-900 dark:text-white text-sm rounded-xl focus:ring-primary focus:border-primary block w-full p-3.5 transition-all outline-none"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Job Title / Role</label>
                                                <input
                                                    className="bg-slate-100 dark:bg-background-dark/50 border border-slate-200 dark:border-border-muted text-slate-400 dark:text-slate-500 text-sm rounded-xl block w-full p-3.5 outline-none cursor-not-allowed"
                                                    type="text"
                                                    value={user?.role === 'STUDENT' ? 'Student' : user?.role || 'User'}
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end pt-4">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                disabled={savingProfile}
                                                className="bg-primary hover:bg-primary/90 text-white dark:text-background-dark text-sm font-bold py-3.5 px-10 rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-70"
                                            >
                                                {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                                            </motion.button>
                                        </div>
                                    </form>
                                </div>
                            </motion.section>

                            {/* Security Section */}
                            <motion.section
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    show: { opacity: 1, y: 0 }
                                }}
                                className="bg-white dark:bg-surface rounded-2xl border border-slate-200 dark:border-border-muted overflow-hidden shadow-xl"
                            >
                                <div className="p-6 border-b border-slate-100 dark:border-border-muted flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Security & Authentication</h3>
                                    <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">lock</span>
                                </div>
                                <div className="p-8">
                                    <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-lg">
                                        {passwordStatus && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${passwordStatus.type === 'success'
                                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                                                    : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                                                    }`}
                                            >
                                                <span className="material-symbols-outlined text-xl">
                                                    {passwordStatus.type === 'success' ? 'check_circle' : 'error'}
                                                </span>
                                                <p>{passwordStatus.message}</p>
                                            </motion.div>
                                        )}

                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Current Password</label>
                                            <input
                                                className="bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-muted text-slate-900 dark:text-white text-sm rounded-xl focus:ring-primary focus:border-primary block w-full p-3.5 outline-none"
                                                placeholder="••••••••••••"
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">New Password</label>
                                            <input
                                                className="bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-muted text-slate-900 dark:text-white text-sm rounded-xl focus:ring-primary focus:border-primary block w-full p-3.5 outline-none"
                                                placeholder="Min. 6 characters"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Confirm New Password</label>
                                            <input
                                                className="bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-muted text-slate-900 dark:text-white text-sm rounded-xl focus:ring-primary focus:border-primary block w-full p-3.5 outline-none"
                                                placeholder="Confirm new password"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="pt-2">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                disabled={savingPassword}
                                                className="bg-slate-800 dark:bg-slate-800 hover:bg-slate-700 text-white dark:text-primary text-sm font-bold py-3.5 px-10 rounded-xl border border-slate-700 dark:border-primary/30 transition-all disabled:opacity-70"
                                            >
                                                {savingPassword ? 'Updating...' : 'Update Password'}
                                            </motion.button>
                                        </div>
                                    </form>

                                    <hr className="my-10 border-slate-100 dark:border-border-muted" />

                                    <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-background-dark rounded-2xl border border-slate-100 dark:border-border-muted transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary">phonelink_lock</span>
                                            </div>
                                            <div>
                                                <p className="text-base font-bold text-slate-900 dark:text-white">Two-Factor Authentication</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Add an extra layer of security to your account.</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-not-allowed opacity-50">
                                            <input disabled checked={false} className="sr-only peer" type="checkbox" />
                                            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                        </label>
                                    </div>
                                </div>
                            </motion.section>

                            {/* Danger Zone */}
                            <motion.section
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    show: { opacity: 1, y: 0 }
                                }}
                                className="bg-white dark:bg-surface rounded-2xl border border-rose-100 dark:border-red-900/20 overflow-hidden shadow-xl"
                            >
                                <div className="p-6 bg-rose-50/50 dark:bg-red-900/10 border-b border-rose-100 dark:border-red-900/20 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-rose-600 dark:text-red-400">Danger Zone</h3>
                                    <span className="material-symbols-outlined text-rose-500">warning</span>
                                </div>
                                <div className="p-8">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div>
                                            <p className="text-base font-bold text-slate-900 dark:text-white">Delete Account</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Permanently remove your account and all associated data from the enterprise server.</p>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => alert('Feature disabled for demo purposes.')}
                                            className="bg-rose-50 dark:bg-red-900/20 hover:bg-rose-100 dark:hover:bg-red-900/40 text-rose-600 dark:text-red-400 text-xs font-bold py-2.5 px-8 rounded-lg border border-rose-200 dark:border-red-500/30 transition-all"
                                        >
                                            Delete Account
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.section>
                        </motion.div>
                    </motion.div>
                </main>
            </div>
        </RoleGuard>
    );
}
