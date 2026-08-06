'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api, { invalidate } from '@/lib/api';
import { User } from '@/lib/types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    activeRole: 'ADMIN' | 'STUDENT';
    setActiveRole: (role: 'ADMIN' | 'STUDENT') => void;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
    updateUser: (newUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Resolve the initial activeRole for a user.
 * - ADMIN users: read from localStorage if valid, otherwise default to 'ADMIN'.
 * - STUDENT users: always 'STUDENT' (no switching allowed, ignores localStorage).
 */
function resolveActiveRole(userRole: string): 'ADMIN' | 'STUDENT' {
    if (userRole === 'ADMIN') {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('activeRole') : null;
        if (saved === 'ADMIN' || saved === 'STUDENT') return saved;
        return 'ADMIN';
    }
    return 'STUDENT';
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeRole, setActiveRoleState] = useState<'ADMIN' | 'STUDENT'>('STUDENT');

    // On mount: restore user + token from localStorage and derive activeRole
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (savedToken && savedUser) {
            const parsed = JSON.parse(savedUser);
            setToken(savedToken);
            setUser(parsed);
            setActiveRoleState(resolveActiveRole(parsed.role));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const res = await api.post('/auth/login', { email, password });
        const { token: newToken, user: newUser } = res.data;
        // An admin sees a different /courses list than an anonymous visitor, so
        // anything cached before this point is not theirs.
        invalidate();
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        // Reset activeRole on login — derive fresh from new user's true role
        localStorage.removeItem('activeRole');
        setToken(newToken);
        setUser(newUser);
        setActiveRoleState(resolveActiveRole(newUser.role));
    };

    const register = async (email: string, password: string, name: string) => {
        const res = await api.post('/auth/register', { email, password, name });
        const { token: newToken, user: newUser } = res.data;
        invalidate();
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.removeItem('activeRole');
        setToken(newToken);
        setUser(newUser);
        setActiveRoleState(resolveActiveRole(newUser.role));
    };

    const logout = () => {
        invalidate();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('activeRole');
        setToken(null);
        setUser(null);
        setActiveRoleState('STUDENT');
    };

    const updateUser = (newUser: User) => {
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
    };

    /**
     * Switch activeRole. Only ADMIN users (by their true backend role) can call this.
     * Persists the choice in localStorage for page-reload survival.
     */
    const setActiveRole = (role: 'ADMIN' | 'STUDENT') => {
        if (user?.role !== 'ADMIN') return; // Guard: students cannot switch
        localStorage.setItem('activeRole', role);
        setActiveRoleState(role);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, activeRole, setActiveRole, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
