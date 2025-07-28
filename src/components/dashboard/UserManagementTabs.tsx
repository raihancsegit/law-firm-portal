'use client'
import { useState } from 'react'
import { approveUser, rejectUser } from '@/app/dashboard/users/actions'

// প্রতিটি ব্যবহারকারীর ডেটার জন্য একটি টাইপ ডিফাইন করা ভালো
type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  status: string | null;
  user_data: { email: string }[] | null;
}

// Props এর জন্য টাইপ
type Props = {
  pendingUsers: UserProfile[];
  allClientsAndLeads: UserProfile[];
  staffUsers: UserProfile[];
}

// একটি সাধারণ UserTable কম্পোনেন্ট যা বিভিন্ন ধরনের ব্যবহারকারী দেখাতে পারে
const UserTable = ({ users, isPending = false }) => {
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    const handleApprove = async (userId: string) => {
        setLoadingAction(`approving-${userId}`);
        const result = await approveUser(userId);
        if (!result.success) alert(`Error: ${result.message}`);
        setLoadingAction(null);
    }

    const handleReject = async (userId: string) => {
        if (!confirm('Are you sure you want to reject and permanently delete this user?')) return;
        setLoadingAction(`rejecting-${userId}`);
        const result = await rejectUser(userId);
        if (!result.success) alert(`Error: ${result.message}`);
        setLoadingAction(null);
    }

    if (users.length === 0) {
        return <p className="text-gray-500 mt-4">No users found in this category.</p>
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full mt-4 bg-white rounded-lg shadow-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        {isPending && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {users.map(user => (
                        <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.user_data?.[0]?.email ?? 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.status}</td>
                            {isPending && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                    <button 
                                        onClick={() => handleApprove(user.id)}
                                        disabled={loadingAction === `approving-${user.id}`}
                                        className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-400">
                                        {loadingAction === `approving-${user.id}` ? 'Approving...' : 'Approve'}
                                    </button>
                                    <button 
                                        onClick={() => handleReject(user.id)}
                                        disabled={loadingAction === `rejecting-${user.id}`}
                                        className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:bg-gray-400">
                                        {loadingAction === `rejecting-${user.id}` ? 'Rejecting...' : 'Reject'}
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}


export default function UserManagementTabs({ pendingUsers, allClientsAndLeads, staffUsers }: Props) {
  const [activeTab, setActiveTab] = useState('pending')

  const tabs = [
    { id: 'pending', label: `Pending Approval (${pendingUsers.length})` },
    { id: 'all', label: `All Clients & Leads (${allClientsAndLeads.length})` },
    { id: 'staff', label: `Staff (${staffUsers.length})` },
  ]

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-law-blue text-law-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'pending' && <UserTable users={pendingUsers} isPending={true} />}
        {activeTab === 'all' && <UserTable users={allClientsAndLeads} />}
        {activeTab === 'staff' && <UserTable users={staffUsers} />}
      </div>
    </div>
  )
}