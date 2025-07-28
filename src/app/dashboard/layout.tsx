// src/app/dashboard/layout.tsx
import { createClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar' // (পরবর্তী ধাপে তৈরি করা হবে)
import Header from '@/components/dashboard/Header' // (পরবর্তী ধাপে তৈরি করা হবে)

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
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
     // একটি "Unauthorized" পেজ দেখানো যেতে পারে
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