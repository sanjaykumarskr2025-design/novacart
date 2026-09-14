// Supabase Client Wrapper
let supabaseClient = null;

function initSupabase() {
    try {
        if (typeof window.supabase !== 'undefined' && SITE_CONFIG.supabaseUrl && SITE_CONFIG.supabaseUrl !== 'https://your-supabase-project.supabase.co') {
            supabaseClient = window.supabase.createClient(SITE_CONFIG.supabaseUrl, SITE_CONFIG.supabaseAnonKey);
            console.log("Supabase connected successfully.");
        } else {
            console.log("Supabase credentials not configured. Running in DEMO MODE with local sample data.");
        }
    } catch (e) {
        console.warn("Failed to initialize Supabase client. Falling back to Demo Mode.", e);
    }
}

initSupabase();
