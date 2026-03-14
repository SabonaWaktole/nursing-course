'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';

interface AdminSettings {
    organizationName: string;
    organizationAddress: string;
    organizationPhone: string;
    directorName: string;
    directorTitle: string;
    providerId: string;
}

export default function AdminSettingsTab() {
    const [settings, setSettings] = useState<AdminSettings>({
        organizationName: '',
        organizationAddress: '',
        organizationPhone: '',
        directorName: '',
        directorTitle: '',
        providerId: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            if (res.data) setSettings(res.data);
        } catch (error) {
            console.error('Error fetching settings:', error);
            setMessage({ text: 'Failed to load settings', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            await api.put('/settings', settings);
            setMessage({ text: 'Settings saved successfully!', type: 'success' });
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage({ text: 'Failed to save settings', type: 'error' });
        } finally {
            setSaving(false);
            // Hide message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const containerVariants: any = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: 'easeOut', staggerChildren: 0.1 }
        }
    };

    const itemVariants: any = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">General Settings</h1>
                    <p className="text-slate-500 mt-1">Manage organization details for certificates and communications.</p>
                </div>
            </div>

            {message && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-xl shadow-sm text-sm font-medium border ${message.type === 'success'
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/20'
                            : 'bg-red-50 dark:bg-red-500/10 text-red-600 border-red-200 dark:border-red-500/20'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined">
                            {message.type === 'success' ? 'check_circle' : 'error'}
                        </span>
                        {message.text}
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <form onSubmit={handleSave} className="contents">
                    {/* Organization Info */}
                    <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">business</span>
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Organization Info</h2>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Organization Name</label>
                                <input
                                    type="text"
                                    name="organizationName"
                                    value={settings.organizationName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium"
                                    placeholder="e.g. Excelcommunity Living Inc"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Organization Address</label>
                                <input
                                    type="text"
                                    name="organizationAddress"
                                    value={settings.organizationAddress}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium"
                                    placeholder="e.g. 123 Health Ave, Suite 100"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                                    <input
                                        type="text"
                                        name="organizationPhone"
                                        value={settings.organizationPhone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium"
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Provider ID / Training No.</label>
                                    <input
                                        type="text"
                                        name="providerId"
                                        value={settings.providerId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium"
                                        placeholder="e.g. NY-CNA-9988"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Signatory Info */}
                    <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                <span className="material-symbols-outlined">ink_pen</span>
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Certificate Signatory</h2>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Director Name</label>
                                <input
                                    type="text"
                                    name="directorName"
                                    value={settings.directorName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium"
                                    placeholder="e.g. Jane Doe, RN, BSN"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Director Title</label>
                                <input
                                    type="text"
                                    name="directorTitle"
                                    value={settings.directorTitle}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium"
                                    placeholder="e.g. Program Director"
                                />
                                <p className="text-xs text-slate-500 mt-2">
                                    The name and title above will appear on the signature line of all newly generated completion certificates.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shadow-lg transition-all ${saving
                                        ? 'bg-slate-400 text-white cursor-not-allowed shadow-none'
                                        : 'bg-primary text-white hover:-translate-y-0.5 shadow-primary/30'
                                    }`}
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">save</span>
                                        Save Settings
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </form>
            </div>
        </motion.div>
    );
}
