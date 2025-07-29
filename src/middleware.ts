import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // একটি response অবজেক্ট তৈরি করুন যা আমরা পরে পরিবর্তন করতে পারব
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Middleware-এর জন্য একটি Supabase ক্লায়েন্ট তৈরি করুন
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        // মূল পরিবর্তন এখানে
        set(name: string, value: string, options: CookieOptions) {
          // Middleware কুকি পড়ার জন্য request অবজেক্ট ব্যবহার করে
          request.cookies.set({ name, value, ...options })
          // Middleware কুকি পাঠানোর জন্য response অবজেক্ট ব্যবহার করে
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        // মূল পরিবর্তন এখানে
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

  // এই getUser() কলটি সেশন রিফ্রেশ করে এবং উপরের set/remove ফাংশনগুলোকে ট্রিগার করে
  await supabase.auth.getUser()

  // ব্রাউজারে আপডেটেড কুকি সহ response অবজেক্টটি ফেরত পাঠান
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
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}