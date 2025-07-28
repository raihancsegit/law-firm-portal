'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link' // Forgot password লিঙ্কের জন্য

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // URL-এ প্যারামিটার আছে কিনা তা পরীক্ষা করুন
    const verifiedParam = searchParams.get('verified')
    const errorParam = searchParams.get('error')

    if (verifiedParam === 'true') {
      setSuccessMessage('Email confirmed successfully! You can now log in.')
      // URL থেকে প্যারামিটারটি সরিয়ে দিন যাতে পেজ রিফ্রেশ করলে বার্তাটি চলে যায়
      router.replace('/login', { scroll: false })
    }

    if (errorParam === 'invalid_link') {
      setError('The confirmation link is invalid or has expired. Please try signing up again.')
      router.replace('/login', { scroll: false })
    }

    if (errorParam === 'profile_not_found' || errorParam === 'profile_not_found_manual_check') {
        setError('Login successful, but your user profile was not found. Please contact support.')
        router.replace('/login', { scroll: false })
    }

  }, [searchParams, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Supabase থেকে আসা এরর বার্তাগুলোকে আরও ব্যবহারকারী-বান্ধব করা
      if (error.message === 'Invalid login credentials') {
        setError('Invalid email or password. Please try again.')
      } else if (error.message === 'Email not confirmed') {
        setError('Please verify your email address before logging in. Check your inbox for a confirmation link.')
      } else {
        setError(error.message)
      }
    } else {
      // সফল লগইনের পর ড্যাশবোর্ডে পাঠান
      router.refresh() 
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-500">Log in to your account</p>
        </div>

        {/* Error and Success Messages */}
        {error && <p className="mb-4 text-center text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
        {successMessage && <p className="mb-4 text-center text-sm text-green-600 bg-green-50 p-3 rounded-md">{successMessage}</p>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="you@example.com" 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••" 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link href="/start-application" className="font-medium text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}