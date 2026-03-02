import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateToken } from '../utils/jwt';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || email.split('@')[0],
                role: 'STUDENT',
            },
        });

        const token = generateToken(user.id, user.role);

        res.status(201).json({
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
        });
    } catch (error: any) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user.id, user.role);

        res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, role: true, createdAt: true },
        });
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ user });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { name, email } = req.body;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        // Optional: Ensure email is not already taken by someone else
        if (email) {
            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing && existing.id !== userId) {
                return res.status(400).json({ message: 'Email is already in use' });
            }
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { name, email },
            select: { id: true, email: true, name: true, role: true, createdAt: true },
        });

        res.json({ user });
    } catch (error: any) {
        console.error('updateProfile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updatePassword = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { currentPassword, newPassword } = req.body;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password are required' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await comparePassword(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        const hashedPassword = await hashPassword(newPassword);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error: any) {
        console.error('updatePassword error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteAccount = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        // Manually delete related records
        await prisma.$transaction([
            prisma.result.deleteMany({ where: { userId } }),
            prisma.enrollment.deleteMany({ where: { userId } }),
            prisma.certificate.deleteMany({ where: { userId } }),
            prisma.user.delete({ where: { id: userId } }),
        ]);

        res.json({ message: 'Account deleted successfully' });
    } catch (error: any) {
        console.error('deleteAccount error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
