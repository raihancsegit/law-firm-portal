// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // .env.local ফাইল থেকে এনভায়রনমেন্ট ভেরিয়েবলগুলো এখানে ব্যবহার হবে
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}