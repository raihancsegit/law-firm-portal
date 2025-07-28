// src/app/setup-admin/page.tsx
'use client'
import { createClient } from '@/lib/supabase/client'

export default function SetupAdminPage() {
  const supabase = createClient()
  
  const handleSetup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: 'rafsanislamriyan@gmail.com', // আপনার অ্যাডমিন ইমেইল দিন
      password: 'Admin@1912',      // আপনার শক্তিশালী পাসওয়ার্ড দিন
      options: {
        data: {
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin', // গুরুত্বপূর্ণ: ভূমিকা সেট করুন
          status: 'active',
          is_approved: true // অ্যাডমিন অ্যাকাউন্ট আগে থেকেই অনুমোদিত থাকবে
        }
      }
    })
    if (error) {
      alert('Error creating admin: ' + error.message)
    } else {
      alert('Admin user created successfully! Please check your email to verify.')
    }
  }

  return (
    <div>
      <h1>Setup Admin User</h1>
      <button onClick={handleSetup}>Create Admin</button>
    </div>
  )
}