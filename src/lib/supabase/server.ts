// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  // SERVICE_ROLE_KEY ব্যবহার করার জন্য একটি অ্যাডমিন ক্লায়েন্ট তৈরি করা
  // এটি RLS পলিসি বাইপাস করতে পারে, যা ডিবাগিংয়ে সাহায্য করবে
  // কিন্তু আমরা প্রথমে স্ট্যান্ডার্ড ক্লায়েন্ট দিয়েই চেষ্টা করব।
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }) } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }) } catch (error) {}
        },
      },
    }
  )
}