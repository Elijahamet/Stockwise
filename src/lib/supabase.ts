import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

// Check if valid credentials are provided (not empty and not default placeholders)
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-anon-key-here')
);

// Fallback dummy credentials when running in purely local/offline mode without a Supabase project
const resolvedUrl = isSupabaseConfigured ? supabaseUrl! : 'https://placeholder.supabase.co';
const resolvedKey = isSupabaseConfigured ? supabaseAnonKey! : 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(resolvedUrl, resolvedKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Test connectivity to the Supabase backend.
 * Returns true if reachable, false otherwise.
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  configured: boolean;
  message: string;
}> {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      configured: false,
      message: 'Supabase credentials not set in .env. Running in 100% offline-first local mode.',
    };
  }

  try {
    const { error } = await supabase.from('products').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      return {
        connected: false,
        configured: true,
        message: `Connected to Supabase endpoint, but table query returned: ${error.message}`,
      };
    }
    return {
      connected: true,
      configured: true,
      message: 'Successfully connected to Supabase PostgreSQL database.',
    };
  } catch (err: any) {
    return {
      connected: false,
      configured: true,
      message: `Network error connecting to Supabase: ${err?.message || 'Host unreachable'}`,
    };
  }
}
