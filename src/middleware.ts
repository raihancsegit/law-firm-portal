// src/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // NextResponse.next() দিয়ে একটি response অবজেক্ট তৈরি করুন
  // যাতে আমরা পরে কুকি সেট করতে পারি।
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Middleware-এর জন্য একটি Supabase ক্লায়েন্ট তৈরি করুন।
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // যদি middleware কুকি সেট করে, তাহলে আমাদের মূল request
          // এবং response উভয়কেই আপডেট করতে হবে।
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // এটি মূল অংশ: সেশন রিফ্রেশ করে কুকি আপ-টু-ডেট রাখে।
  await supabase.auth.getUser()

  return response
}

// নিশ্চিত করুন যে middleware শুধুমাত্র প্রাসঙ্গিক পাথের জন্য কল হয়।
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to add more paths here that shouldn't run through middleware
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}