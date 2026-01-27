import { createClient } from '@supabase/supabase-js';

// These should be set in extension settings or config
const DEFAULT_SUPABASE_URL = 'https://your-project.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'your-anon-key';

let supabaseClient: ReturnType<typeof createClient> | null = null;

export function initSupabase(url?: string, key?: string) {
  const supabaseUrl = url || DEFAULT_SUPABASE_URL;
  const supabaseKey = key || DEFAULT_SUPABASE_ANON_KEY;
  
  supabaseClient = createClient(supabaseUrl, supabaseKey);
  return supabaseClient;
}

export function getSupabase() {
  if (!supabaseClient) {
    supabaseClient = initSupabase();
  }
  return supabaseClient;
}

export async function syncProfileToCloud(profile: any, userId: string) {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      user_id: userId,
      ...profile,
      updated_at: new Date().toISOString()
    });
  
  if (error) throw error;
  return data;
}

export async function loadProfileFromCloud(userId: string) {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function saveApplicationToCloud(application: any, userId: string) {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('applications')
    .insert({
      user_id: userId,
      ...application,
      created_at: new Date().toISOString()
    });
  
  if (error) throw error;
  return data;
}

export async function getApplicationsFromCloud(userId: string) {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}
