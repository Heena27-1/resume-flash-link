import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type Profile = {
  id: string
  email: string
  full_name?: string
  created_at: string
  updated_at: string
}

export type Resume = {
  id: string
  user_id: string
  title: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  share_token: string
  is_public: boolean
  created_at: string
  updated_at: string
}