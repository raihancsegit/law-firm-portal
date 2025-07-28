'use client'
import { useState } from 'react'
// ক্লায়েন্ট কম্পোনেন্টের জন্য src/lib/supabase/client.ts থেকে ক্লায়েন্ট ইম্পোর্ট করুন
import { createClient } from '@/lib/supabase/client' 
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  
  // ক্লায়েন্ট-সাইড Supabase ইনস্ট্যান্স তৈরি করুন
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null) // আগের error রিসেট করুন

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      // এটি সার্ভার কম্পোনেন্ট এবং লেআউটকে নতুন সেশন সম্পর্কে অবহিত করে
      router.refresh()
      // ব্যবহারকারীকে ড্যাশবোর্ডে পাঠান
      router.push('/dashboard')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="p-8 bg-white rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        {error && <p className="mb-4 text-center text-red-500">{error}</p>}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Email" 
            required 
            className="w-full p-2 border rounded" 
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Password" 
            required 
            className="w-full p-2 border rounded" 
          />
        </div>
        <button type="submit" className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700">
          Log In
        </button>
      </form>
    </div>
  )
}