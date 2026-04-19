import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const isSupabaseConfigured =
  !!supabaseUrl && !!supabaseAnonKey

/** 公開用クライアント（クライアント・サーバー両側で使用可） */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null

/** 管理用クライアント（サーバーサイド専用） */
export const supabaseAdmin =
  isSupabaseConfigured && supabaseServiceRoleKey
    ? createClient(supabaseUrl!, supabaseServiceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null
