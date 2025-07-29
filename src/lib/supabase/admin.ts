// src/lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// এই ক্লায়েন্টটি শুধুমাত্র সার্ভার-সাইড অ্যাডমিন কাজের জন্য ব্যবহার হবে
// এটি service_role key ব্যবহার করবে এবং RLS পলিসি বাইপাস করবে

// নিশ্চিত করুন যে আপনার .env.local ফাইলে এই ভেরিয়েবলগুলো আছে
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)