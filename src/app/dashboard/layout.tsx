import { createClient } from '@/lib/supabase/server' // সার্ভার ফাইল ইম্পোর্ট করুন
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
    return redirect('/login')
  }
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    console.error(`Profile not found for user ID: ${user.id}. DB Error: ${error?.message}`)
    // প্রোফাইল না পাওয়া গেলে লগআউট করে লগইন পেজে পাঠান
    return redirect('/login?error=profile_not_found') 
  }

  // বিভিন্ন ভূমিকার জন্য ড্যাশবোর্ড অ্যাক্সেস নিয়ন্ত্রণ
  if (profile.role !== 'admin' && profile.role !== 'attorney') {
    // এখানে আপনি ক্লায়েন্টদের জন্য আলাদা ড্যাশবোর্ডে পাঠাতে পারেন,
    // অথবা শুধুমাত্র অ্যাডমিন ও অ্যাটর্নিদের অনুমতি দিতে পারেন।
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