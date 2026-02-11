import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseInstance = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://supabase.com/dashboard/project/tttjulocegzcwdhfbsps') {
    try {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    } catch (e) {
        console.error("Failed to initialize Supabase:", e);
    }
} else {
    console.warn("Supabase credentials are missing or default. Cloud sync is disabled.");
}

export const supabase = supabaseInstance;
