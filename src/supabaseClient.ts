import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bteqwvovhgbvxzhkpqcb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZXF3dm92aGdidnh6aGtwcWNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzU0MDIzNywiZXhwIjoyMTA5MTE2MjM3fQ.MIZ1QfIuNKt8st0orJO2M66rF4_IhnGcpY8Jf_nwWqg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);