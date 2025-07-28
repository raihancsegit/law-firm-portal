// src/app/api/setup-first-admin/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // নিরাপত্তা: নিশ্চিত করুন যে এই রুটটি শুধুমাত্র একবার বা একটি নির্দিষ্ট কী দিয়ে চালানো যায়
  const { secret } = await request.json()
  if (secret !== process.env.ADMIN_SETUP_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Supabase অ্যাডমিন ক্লায়েন্ট তৈরি করুন (service_role কী ব্যবহার করে)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const adminData = {
    email: process.env.ADMIN_EMAIL!,
    password: process.env.ADMIN_PASSWORD!,
    user_metadata: {
        first_name: 'Super',
        last_name: 'Admin',
        role: 'admin',
        status: 'active',
        is_approved: true
    }
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: adminData.email,
    password: adminData.password,
    email_confirm: true, // ভেরিফিকেশন ছাড়াই অ্যাকাউন্ট সক্রিয় করুন
    user_metadata: adminData.user_metadata,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ message: 'Admin created successfully', user: data.user })
}