import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log("--- Dashboard Layout Loading ---");
  const supabase = createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    console.log("User not found or error fetching user. Redirecting to login.");
    console.error("User fetch error:", userError);
    return redirect('/login')
  }
  
  console.log(`User found: ${user.id}. Fetching profile...`);

  // এখন profiles টেবিল থেকে ভূমিকা চেক করুন
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.error(`CRITICAL: Profile not found for user ID: ${user.id}.`);
    console.error("DB Error:", profileError);
    // ডাটাবেস থেকে ব্যবহারকারীকে লগআউট করার চেষ্টা করুন
    await supabase.auth.signOut();
    return redirect(`/login?error=profile_not_found&uid=${user.id}`) 
  }

  console.log(`Profile found for user ${user.id}. Role: ${profile.role}`);

  // যদি প্রোফাইলের ভূমিকা অ্যাডমিন না হয়
  if (profile.role !== 'admin') {
    console.log(`User ${user.id} is not an admin. Role: ${profile.role}. Redirecting to unauthorized.`);
    return redirect('/unauthorized')
  }

  console.log(`User ${user.id} is an admin. Rendering dashboard.`);

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