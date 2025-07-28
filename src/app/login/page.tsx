'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient' // '@' alias src ফোল্ডারকে নির্দেশ করে
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        alert(error.message);
    } else {
        // ড্যাশবোর্ডে পাঠানোর আগে পেজ রিফ্রেশ করুন
        router.push('/dashboard');
        router.refresh(); // This ensures the layout re-renders with the new session
    }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="p-8 bg-white rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full p-2 border rounded" />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full p-2 border rounded" />
        </div>
        <button type="submit" className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700">
          Log In
        </button>
      </form>
    </div>
  )
}