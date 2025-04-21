import { createClient } from '@supabase/supabase-js';

// Supabase configuration
export const supabaseUrl = 'https://nrbtqdwwcpouabezkfty.supabase.co';
export const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYnRxZHd3Y3BvdWFiZXprZnR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyMjkwNDIsImV4cCI6MjA2MDgwNTA0Mn0.5Yr82ATlHsYUg9dHRwNglWF15Jq9qCE_AcseWKuRI6E';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);