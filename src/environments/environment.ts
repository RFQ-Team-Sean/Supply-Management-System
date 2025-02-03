export const environment = {
  production: false,
  supabaseUrl: 'your-supabase-url',
  supabaseKey: 'your-supabase-key',
  supabaseOptions: {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
}; 