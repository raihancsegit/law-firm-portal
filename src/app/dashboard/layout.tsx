import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'
import type { User } from '@supabase/supabase-js'

// একটি Helper কম্পোনেন্ট যা ক্লায়েন্ট-সাইডে প্রোফাইল আনে এবং ভূমিকা চেক করে
// এটি ঐচ্ছিক, কিন্তু UX উন্নত করে
import RoleChecker from '@/components/dashboard/RoleChecker'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  // শুধুমাত্র ব্যবহারকারী লগইন করা আছে কিনা তা চেক করুন
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {/* RoleChecker কম্পোনেন্টটি ক্লায়েন্ট-সাইডে ভূমিকা চেক করবে */}
          <RoleChecker allowedRoles={['admin', 'attorney']}>
            {children}
          </RoleChecker>
        </main>
      </div>
    </div>
  )
}