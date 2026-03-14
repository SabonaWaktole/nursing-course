import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getSettings = async (req: Request, res: Response) => {
    try {
        let settings = await prisma.adminSettings.findUnique({
            where: { id: 'singleton' }
        });

        if (!settings) {
            // Create default if it doesn't exist
            settings = await prisma.adminSettings.create({
                data: { id: 'singleton' }
            });
        }

        res.json(settings);
    } catch (error: any) {
        console.error('getSettings error:', error);
        res.status(500).json({ message: 'Error fetching settings' });
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    try {
        const data = req.body;

        const settings = await prisma.adminSettings.upsert({
            where: { id: 'singleton' },
            create: { id: 'singleton', ...data },
            update: { ...data }
        });

        res.json(settings);
    } catch (error: any) {
        console.error('updateSettings error:', error);
        res.status(500).json({ message: 'Error updating settings' });
    }
};
