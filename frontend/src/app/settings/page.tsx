'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import RoleGuard from '@/components/RoleGuard';
import { User, Lock, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="min-h-screen bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300"
            >
                <div className="max-w-4xl mx-auto">
                    <header className="mb-8">
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
                                transition: { staggerChildren: 0.1 }
                            }
                        }}
                        className="space-y-6"
                    >
                        {/* Profile Section */}
                        <motion.section
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                show: { opacity: 1, y: 0 }
                            }}
                            className="bg-white dark:bg-surface rounded-xl border border-slate-200 dark:border-border-muted overflow-hidden shadow-xl dark:shadow-2xl transition-colors"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-border-muted flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Profile Information</h3>
                                <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded">
                                    {user?.role} Profile
                                </span>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="p-8">
                                <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-full border-2 border-primary p-1">
                                            <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-4xl text-primary">person</span>
                                            </div>
                                        </div>
                                        <button type="button" className="absolute bottom-0 right-0 bg-primary text-white dark:text-background-dark p-1.5 rounded-full shadow-lg hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-sm font-bold leading-none block">edit</span>
                                        </button>
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{user?.name}</h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{user?.role} • Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            type="button"
                                            className="bg-primary hover:bg-primary/90 text-white dark:text-background-dark text-sm font-bold py-2 px-4 rounded transition-colors shadow-lg shadow-primary/20"
                                        >
                                            Upload New Avatar
                                        </motion.button>
                                    </div>
                                </div>

                                {profileStatus && (
                                    <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 text-sm font-medium ${profileStatus.type === 'success'
                                        ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20'
                                        : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                                        }`}>
                                        <span className="material-symbols-outlined text-xl">
                                            {profileStatus.type === 'success' ? 'check_circle' : 'error'}
                                        </span>
                                        <p>{profileStatus.message}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">First Name</label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                            className="bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-muted text-slate-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-3 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Last Name</label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-muted text-slate-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-3 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Email Address</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-muted text-slate-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-3 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Role</label>
                                        <input
                                            type="text"
                                            value={user?.role || ''}
                                            readOnly
                                            className="bg-slate-100 dark:bg-background-dark/50 border border-slate-200 dark:border-border-muted text-slate-400 dark:text-slate-500 text-sm rounded-lg block w-full p-3 outline-none cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-8 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={savingProfile}
                                        className="bg-primary hover:bg-primary/90 text-white dark:text-background-dark text-sm font-bold py-3 px-8 rounded shadow-lg shadow-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                                    </button>
                                </motion.div>
                            </form>
                        </motion.section>

                        {/* Security Section */}
                        <motion.section
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                show: { opacity: 1, y: 0 }
                            }}
                            className="bg-white dark:bg-surface rounded-xl border border-slate-200 dark:border-border-muted overflow-hidden shadow-xl dark:shadow-2xl transition-colors"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-border-muted flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Security & Authentication</h3>
                                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">lock</span>
                            </div>

                            <form onSubmit={handleUpdatePassword} className="p-8">
                                <div className="flex flex-col gap-6 max-w-lg">
                                    {passwordStatus && (
                                        <div className={`p-4 rounded-lg flex items-start gap-3 text-sm font-medium ${passwordStatus.type === 'success'
                                            ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20'
                                            : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                                            }`}>
                                            <span className="material-symbols-outlined text-xl">
                                                {passwordStatus.type === 'success' ? 'check_circle' : 'error'}
                                            </span>
                                            <p>{passwordStatus.message}</p>
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Current Password</label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            required
                                            className="bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-muted text-slate-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-3 outline-none"
                                            placeholder="••••••••••••"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">New Password</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            className="bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-muted text-slate-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-3 outline-none"
                                            placeholder="Min. 6 characters"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-muted text-slate-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-3 outline-none"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-4">
                                        <button
                                            type="submit"
                                            disabled={savingPassword}
                                            className="bg-slate-800 dark:bg-slate-800 hover:bg-slate-700 text-white dark:text-primary text-sm font-bold py-3 px-8 rounded border border-slate-700 dark:border-primary/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {savingPassword ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </motion.div>
                                </div>

                                <hr className="my-10 border-slate-100 dark:border-border-muted" />

                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-background-dark rounded-lg border border-slate-200 dark:border-border-muted transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary">phonelink_lock</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Two-Factor Authentication</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Add an extra layer of security to your account. (Coming Soon)</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-not-allowed opacity-50">
                                        <input type="checkbox" className="sr-only peer" disabled />
                                        <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                    </label>
                                </div>
                            </form>
                        </motion.section>

                        {/* Danger Zone */}
                        <motion.section
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                show: { opacity: 1, y: 0 }
                            }}
                            className="bg-white dark:bg-surface rounded-xl border border-red-200 dark:border-red-900/30 overflow-hidden shadow-xl transition-colors"
                        >
                            <div className="p-6 bg-red-50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/30 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-red-600 dark:text-red-400">Danger Zone</h3>
                                <span className="material-symbols-outlined text-red-500">warning</span>
                            </div>
                            <div className="p-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Delete Account</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Permanently remove your account and all associated data.</p>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="button"
                                        className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold py-2 px-6 rounded border border-red-200 dark:border-red-500/30 transition-all disabled:opacity-50"
                                        onClick={() => alert('Account deletion is not available in the demo.')}
                                    >
                                        Delete Account
                                    </motion.button>
                                </div>
                            </div>
                        </motion.section>
                    </motion.div>
                </div>
            </motion.div>
        </RoleGuard>
    );
}
