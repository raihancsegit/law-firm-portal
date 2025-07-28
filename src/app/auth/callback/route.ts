// src/app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // যদি next প্যারামিটার থাকে, ভেরিফিকেশনের পর সেখানে পাঠানো হবে
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // সফলভাবে সেশন এক্সচেঞ্জ হলে, ব্যবহারকারীকে next URL-এ পাঠান
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // কোনো সমস্যা হলে, এরর বার্তা সহ একটি এরর পেজে পাঠান
  console.error('Error exchanging code for session:', 'Code not found or invalid');
  const errorUrl = new URL('/auth/auth-error', origin)
  errorUrl.searchParams.set('error_description', 'Could not verify email. The link may have expired.')
  return NextResponse.redirect(errorUrl)
}