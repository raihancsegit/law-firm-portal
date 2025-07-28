// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server Components থেকে কুকি সেট করার চেষ্টা করলে এই ত্রুটি হতে পারে।
            // middleware session রিফ্রেশ করলে এটি উপেক্ষা করা যেতে পারে।
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server Components থেকে কুকি ডিলিট করার চেষ্টা করলে এই ত্রুটি হতে পারে।
          }
        },
      },
    }
  )
}