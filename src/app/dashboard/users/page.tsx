import { createClient } from '@/lib/supabase/server'
// নতুন অ্যাডমিন ক্লায়েন্ট ইম্পোর্ট করুন
import { supabaseAdmin } from '@/lib/supabase/admin' 
import UserManagementTabs from '@/components/dashboard/UserManagementTabs'
import type { UserProfile } from '@/types/user'

// Helper ফাংশনটি এখন supabaseAdmin ব্যবহার করবে
async function getUserEmailMap() {
  // createClient() এর পরিবর্তে সরাসরি supabaseAdmin ব্যবহার করুন
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
  
  if (error) {
    // এররটি এখন আরও তথ্যবহুল হবে
    console.error("Error fetching user list from auth admin API:", error.message)
    // একটি খালি ম্যাপ রিটার্ন করুন যাতে অ্যাপ ক্র্যাশ না করে
    return new Map<string, string>()
  }

  const emailMap = new Map<string, string>()
  users.forEach(user => {
    emailMap.set(user.id, user.email || 'No Email')
  })
  return emailMap
}


export default async function UserManagementPage() {
  const supabase = createClient() // এই ক্লায়েন্টটি RLS পলিসি মেনে চলবে

  const userEmailMap = await getUserEmailMap();

  // profiles টেবিল থেকে ডেটা আনার সময় সাধারণ ক্লায়েন্ট ব্যবহার করুন
  // কারণ এটি অ্যাডমিনের RLS পলিসি দ্বারা সুরক্ষিত
  const { data: allProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, role, status, is_approved, is_verified')
    
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
    return (
        <div className="p-6 bg-red-100 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-semibold">Error Loading Data</h3>
            <p className="text-red-700 mt-2">Could not fetch user profiles from the database. Please check RLS policies.</p>
        </div>
    )
  }

  // প্রোফাইল ডেটার সাথে ইমেইল যুক্ত করুন
  const allUsersWithEmail: UserProfile[] = (allProfiles || []).map(profile => ({
    ...profile,
    email: userEmailMap.get(profile.id) || 'N/A',
  }));

  // ব্যবহারকারীদের তাদের গ্রুপ অনুযায়ী ফিল্টার করুন
  const pendingUsers = allUsersWithEmail.filter(user => !user.is_approved && user.is_verified)
  const allClientsAndLeads = allUsersWithEmail.filter(user => (user.role === 'client' || user.role === 'lead') && user.is_approved)
  const staffUsers = allUsersWithEmail.filter(user => user.role === 'attorney' || user.role === 'admin')

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <p className="text-sm text-gray-600 mt-1">Approve new users, manage existing clients, and oversee staff accounts.</p>
      </div>
      
      <UserManagementTabs 
        pendingUsers={pendingUsers}
        allClientsAndLeads={allClientsAndLeads}
        staffUsers={staffUsers}
      />
    </div>
  )
}