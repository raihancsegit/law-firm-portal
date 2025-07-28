import { createClient } from '@/lib/supabase/server'
import UserManagementTabs from '@/components/dashboard/UserManagementTabs'
import type { UserProfile } from '@/types/user'

// Supabase-এর auth.users থেকে ইমেইলগুলোকে তাদের ID অনুযায়ী একটি ম্যাপে সাজানোর জন্য Helper ফাংশন
async function getUserEmailMap() {
  const supabaseAdmin = createClient() // এটি service_role কী ব্যবহার করবে
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
  
  if (error) {
    console.error("Error fetching user list from auth:", error)
    return new Map<string, string>()
  }

  const emailMap = new Map<string, string>()
  users.forEach(user => {
    emailMap.set(user.id, user.email || 'No Email')
  })
  return emailMap
}


export default async function UserManagementPage() {
  const supabase = createClient()

  // ধাপ ১: প্রথমে সকল ব্যবহারকারীর ইমেইল এবং আইডির একটি ম্যাপ তৈরি করুন
  const userEmailMap = await getUserEmailMap();

  // ধাপ ২: এখন profiles টেবিল থেকে ডেটা আনুন, JOIN ছাড়া
  const { data: allProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, role, status')
    
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
    return (
        <div className="p-6 bg-red-100 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-semibold">Error Loading Data</h3>
            <p className="text-red-700 mt-2">Could not fetch user profiles from the database. Please check RLS policies.</p>
        </div>
    )
  }

  // ধাপ ৩: প্রোফাইল ডেটার সাথে ইমেইল যুক্ত করুন
  const allUsersWithEmail: UserProfile[] = (allProfiles || []).map(profile => ({
    ...profile,
    email: userEmailMap.get(profile.id) || 'N/A',
  }));

  // ধাপ ৪: ব্যবহারকারীদের তাদের গ্রুপ অনুযায়ী ফিল্টার করুন
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