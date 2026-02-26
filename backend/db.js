require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env');
    // We typically don't exit process in dev immediately to let server start, 
    // but for production this should probably crash.
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;
