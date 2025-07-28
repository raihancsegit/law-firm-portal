import { createClient } from '@/lib/supabase/server'
import UserManagementTabs from '@/components/dashboard/UserManagementTabs'
import type { UserProfile, RawUserProfile } from '@/types/user'

export default async function UserManagementPage() {
  const supabase = createClient()

  // জয়েন কোয়েরি: profiles এর সাথে auth.users টেবিল থেকে email আনা
  // Supabase স্বয়ংক্রিয়ভাবে Foreign Key Relation ব্যবহার করে এটি করে।
  const query = `
    id,
    first_name,
    last_name,
    role,
    status,
    users (
      email
    )
  `

  // ডেটা আনার জন্য একটি একক ফাংশন তৈরি করা যেতে পারে
  async function fetchUsers(queryBuilder: any) {
    const { data, error } = await queryBuilder;
    if (error) {
      console.error('Error fetching users:', error);
      throw new Error(error.message); // এরর থ্রো করলে Next.js এরর বাউন্ডারি ধরবে
    }
    return data;
  }

  try {
    const pendingUsersQuery = supabase
      .from('profiles')
      .select(query)
      .eq('is_approved', false)
      .eq('is_verified', true);

    const allClientsAndLeadsQuery = supabase
      .from('profiles')
      .select(query)
      .in('role', ['client', 'lead'])
      .eq('is_approved', true);

    const staffUsersQuery = supabase
      .from('profiles')
      .select(query)
      .in('role', ['attorney', 'admin']);

    // Promise.all ব্যবহার করে সবগুলো কোয়েরি একসাথে চালানো
    const [pendingUsers, allClientsAndLeads, staffUsers] = await Promise.all([
        fetchUsers(pendingUsersQuery),
        fetchUsers(allClientsAndLeadsQuery),
        fetchUsers(staffUsersQuery)
    ]);
    
    // Supabase থেকে আসা নেস্টেড অবজেক্টকে ফ্ল্যাট করে দেওয়া
    const formatUsers = (users: RawUserProfile[] | null): UserProfile[] => {
      if (!users) return []
      return users.map(user => ({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        status: user.status,
        email: user.users?.email ?? 'N/A', // নেস্টেড অবজেক্ট থেকে ইমেইল বের করা
      }))
    }

    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-600 mt-1">Approve new users, manage existing clients, and oversee staff accounts.</p>
        </div>
        
        <UserManagementTabs 
          pendingUsers={formatUsers(pendingUsers)}
          allClientsAndLeads={formatUsers(allClientsAndLeads)}
          staffUsers={formatUsers(staffUsers)}
        />
      </div>
    )

  } catch (error) {
    return (
        <div className="p-6 bg-red-100 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-semibold">Error Loading Data</h3>
            <p className="text-red-700 mt-2">Could not fetch user data from the database. Please check console logs for details or contact support.</p>
        </div>
    )
  }
}