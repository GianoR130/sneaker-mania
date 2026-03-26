import { createClient } from '@supabase/supabase-js';

// Sostituisci le stringhe qui sotto con i tuoi codici!
const supabaseUrl = 'https://jyzqqzmogeydeuzymktq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5enFxem1vZ2V5ZGV1enlta3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMDEwMTYsImV4cCI6MjA4OTU3NzAxNn0.FJVpLEQkRK8DrpuFjxIExUehbLV86hX404UKCvbguoA';

export const supabase = createClient(supabaseUrl, supabaseKey);