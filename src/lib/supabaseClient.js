// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vknnevahemmfexdfxrcj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrbm5ldmFoZW1tZmV4ZGZ4cmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NzkxODQsImV4cCI6MjA2NDA1NTE4NH0.rzqchpIxnrTFT1aNeYU74oL0y5uJRTPKu5iOrPbShKc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);