import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

// 直接使用硬编码的值，避免环境变量问题
const supabaseUrl = 'https://hcyjdbglurjhwvbpulkg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjeWpkYmdsdXJqaHd2YnB1bGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5OTg2NDksImV4cCI6MjA3ODU3NDY0OX0.x-_QeoYdFg9oGHRUGRXawHr3ZD1RUJWM8WqLf-DFH6E'

// 验证 URL 格式
if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    throw new Error(`Invalid Supabase URL: ${supabaseUrl}`)
}

if (!supabaseAnonKey) {
    throw new Error('Missing Supabase Anon Key')
}

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key exists:', !!supabaseAnonKey)

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)