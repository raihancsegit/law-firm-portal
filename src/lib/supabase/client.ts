// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

// এই ফাংশনটি শুধুমাত্র ক্লায়েন্ট কম্পোনেন্টে ('use client') ব্যবহার হবে
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}