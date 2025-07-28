import { createClient } from '@/lib/supabase/server' // সঠিক পাথ থেকে ইম্পোর্ট করুন
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Middleware কাজ করার পর, এই কন্ডিশনটি শুধুমাত্র তখনই সত্য হবে যখন ব্যবহারকারী আসলেই লগইন করা নেই।
    return redirect('/login')
  }
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    console.error("Profile not found for user:", user.id, error)
    // আপনি এখানে একটি এরর পেজ দেখাতে পারেন অথবা লগআউট করে দিতে পারেন।
    return redirect('/login?error=profile_not_found')
  }

  if (profile.role !== 'admin') {
    return redirect('/unauthorized')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}