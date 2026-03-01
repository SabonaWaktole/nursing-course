'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
    const { register } = useAuth();
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await register(email, password, name);
            router.push('/courses');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex min-h-[80vh] items-center justify-center px-4 py-12"
        >
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                        <GraduationCap className="h-7 w-7 text-blue-900" />
                    </div>
                    <h1 className="mt-4 text-2xl font-bold text-slate-900">Create your account</h1>
                    <p className="mt-1 text-slate-500">Start your nursing assistant journey today</p>
                </div>

                <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                    {error && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
                            placeholder="Jane Doe"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                        <div className="relative">
                            <input
                                type={showPw ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
                                placeholder="Min. 6 characters"
                                required
                            />
                            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-900 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800 disabled:opacity-50"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </motion.button>

                    <p className="text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link href="/login" className="font-semibold text-blue-900 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </motion.div>
    );
}
