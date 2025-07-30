import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin' 
import UserManagement from '@/components/dashboard/UserManagement'
import type { UserProfile } from '@/types/user'

async function getUserEmailMap() {
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
  
  if (error) {
    console.error("Error fetching user list from auth admin API:", error.message)
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
  const userEmailMap = await getUserEmailMap();

  // profiles টেবিল থেকে সমস্ত প্রয়োজনীয় ফিল্ড আনুন
  const { data: allProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, phone_number, role, status, is_approved, is_verified, case_type, is_newsletter_subscribed, avatar_url, internal_notes')
    
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
    return (
        <div className="p-6 bg-red-100 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-semibold">Error Loading Data</h3>
            <p className="text-red-700 mt-2">Could not fetch user profiles from the database. Please check RLS policies.</p>
        </div>
    )
  }

  // প্রোফাইল ডেটার সাথে ইমেইল যুক্ত করুন এবং UserProfile টাইপের সাথে সামঞ্জস্যপূর্ণ করুন
  // ...profile ব্যবহারের পরিবর্তে প্রতিটি প্রপার্টি সুস্পষ্টভাবে ম্যাপ করুন
  const allUsers: UserProfile[] = (allProfiles || []).map(profile => ({
    id: profile.id,
    first_name: profile.first_name,
    last_name: profile.last_name,
    phone_number: profile.phone_number,
    role: profile.role,
    status: profile.status,
    is_approved: profile.is_approved,
    is_verified: profile.is_verified,
    case_type: profile.case_type,
    is_newsletter_subscribed: profile.is_newsletter_subscribed,
    avatar_url: profile.avatar_url,
    internal_notes: profile.internal_notes,
    email: userEmailMap.get(profile.id) || 'N/A',
  }));

  // আপনার UserManagement কম্পোনেন্ট এখন শুধুমাত্র একটি prop আশা করে
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <p className="text-sm text-gray-600 mt-1">Approve new users, manage existing clients, and oversee staff accounts.</p>
      </div>
      
      <UserManagement allUsers={allUsers} />
    </div>
  )
}