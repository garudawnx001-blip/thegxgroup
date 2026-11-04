import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_KEY } from './supabase'
let client: SupabaseClient | null = null
export const sb = () => (client ??= createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: typeof window !== 'undefined' } }))
