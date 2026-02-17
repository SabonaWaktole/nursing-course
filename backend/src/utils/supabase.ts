import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.DATABASE_URL?.split('@')[1].split(':')[0]
    ? `https://${process.env.DATABASE_URL.split('@')[1].split(':')[0].split('.')[0]}.supabase.co`
    : process.env.SUPABASE_URL || '';

// Fallback logic to construct URL if SUPABASE_URL isn't explicitly set, 
// using the hostname from DATABASE_URL which is known: db.fplvkzvtjxpkospghxdy.supabase.co
// The project ID is usually the subdomain.
// Actually, it's safer to ask or rely on a specific env var. 
// Looking at .env file content from Step 1975:
// DATABASE_URL="postgresql://postgres:W%40kt0lek001@db.fplvkzvtjxpkospghxdy.supabase.co:5432/postgres"
// The project ref is fplvkzvtjxpkospghxdy.
// URL would be https://fplvkzvtjxpkospghxdy.supabase.co.

const PROJECT_REF = 'fplvkzvtjxpkospghxdy';
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;
const SUPABASE_KEY = process.env.service_role_secret || '';

if (!SUPABASE_KEY) {
    console.error('Supabase Service Role Key is missing!');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
