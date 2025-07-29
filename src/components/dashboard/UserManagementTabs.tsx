'use client'
import { useState, useMemo } from 'react'
import { approveUser, rejectUser } from '@/app/dashboard/users/actions'
import type { UserProfile } from '@/types/user'
import Link from 'next/link'

// Props এর জন্য টাইপ
type Props = {
  pendingUsers: UserProfile[];
  allClientsAndLeads: UserProfile[];
  staffUsers: UserProfile[];
}

// Case Status এর জন্য একটি Helper কম্পোনেন্ট
const CaseStatusBadge = ({ status }: { status: string | null }) => {
    const statusClasses: { [key: string]: string } = {
        'in-progress': 'bg-blue-100 text-blue-800',
        'under-review': 'bg-yellow-100 text-yellow-800',
        'completed': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800',
        'not-started': 'bg-gray-100 text-gray-800',
        'lead': 'bg-purple-100 text-purple-800',
        'active': 'bg-green-100 text-green-800',
        'not_applied': 'bg-gray-100 text-gray-800',
        'submitted': 'bg-yellow-100 text-yellow-800',
        'pending_review': 'bg-yellow-100 text-yellow-800',
        default: 'bg-gray-100 text-gray-800',
    }
    const className = statusClasses[status || 'default'] || statusClasses.default;
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${className}`}>
            {status ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}
        </span>
    )
}


export default function UserManagementTabs({ pendingUsers, allClientsAndLeads, staffUsers }: Props) {
  const [activeTab, setActiveTab] = useState('all') // ডিফল্ট ট্যাব 'all' করা হলো

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Memoized filtered list of clients and leads
  const filteredClientsAndLeads = useMemo(() => {
    return allClientsAndLeads.filter(user => {
      const searchMatch = (
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const statusMatch = statusFilter === 'all' || user.role === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [allClientsAndLeads, searchTerm, statusFilter]);

  const tabs = [
    { id: 'all', label: `Clients & Leads (${filteredClientsAndLeads.length})` },
    { id: 'pending', label: `Pending Approval (${pendingUsers.length})` },
    { id: 'staff', label: `Staff (${staffUsers.length})` },
  ]
  
  // Action handlers
  const handleApprove = async (userId: string) => {
      const result = await approveUser(userId);
      if (!result.success) alert(`Error: ${result.message}`);
  }

  const handleReject = async (userId: string) => {
      if (!confirm('Are you sure you want to reject and permanently delete this user?')) return;
      const result = await rejectUser(userId);
      if (!result.success) alert(`Error: ${result.message}`);
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
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

      {/* Filter and Search Section (only for 'all' tab) */}
      {activeTab === 'all' && (
        <div id="clients-leads-filters" className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4">
                <div className="w-full sm:flex-1 sm:min-w-64">
                    <div className="relative">
                        <input 
                            type="text" 
                            id="search-input" 
                            placeholder="Search by name or email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-law-blue"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i className="fa-solid fa-search text-gray-400"></i>
                        </div>
                    </div>
                </div>
                <select 
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-law-blue"
                >
                    <option value="all">All Types</option>
                    <option value="client">Client</option>
                    <option value="lead">Lead</option>
                </select>
                <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); }} className="px-4 py-2 text-gray-600 hover:text-gray-800 focus:outline-none">
                    <i className="fa-solid fa-times mr-1"></i>
                    Clear
                </button>
            </div>
        </div>
      )}

      {/* Content for each tab */}
      <div className="p-6">
        <div className={`${activeTab === 'all' ? '' : 'hidden'}`}>
            <UserTable data={filteredClientsAndLeads} type="clients" />
        </div>
        <div className={`${activeTab === 'pending' ? '' : 'hidden'}`}>
            <UserTable data={pendingUsers} type="pending" onApprove={handleApprove} onReject={handleReject} />
        </div>
        <div className={`${activeTab === 'staff' ? '' : 'hidden'}`}>
            <UserTable data={staffUsers} type="staff" />
        </div>
      </div>
    </div>
  )
}

// A more robust UserTable component
const UserTable = ({ data, type, onApprove, onReject }) => {
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    const handleAction = async (action, userId) => {
        const actionKey = `${action}-${userId}`;
        setLoadingAction(actionKey);
        
        if(action === 'approve') {
            await onApprove(userId);
        } else if (action === 'reject') {
            await onReject(userId);
        }
        
        setLoadingAction(null);
    }
    
    if (!data || data.length === 0) {
        return <p className="text-gray-500 mt-4 text-center py-8">No users found in this category.</p>
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                        <img className="h-10 w-10 rounded-full object-cover" src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}`} alt="" />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                                        <div className="text-sm text-gray-500">ID: #{user.id.substring(0, 6)}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'client' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <CaseStatusBadge status={user.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                {type === 'pending' ? (
                                    <>
                                        <button 
                                            onClick={() => handleAction('approve', user.id)}
                                            disabled={!!loadingAction}
                                            className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-400">
                                            {loadingAction === `approve-${user.id}` ? '...' : 'Approve'}
                                        </button>
                                        <button 
                                            onClick={() => handleAction('reject', user.id)}
                                            disabled={!!loadingAction}
                                            className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:bg-gray-400">
                                            {loadingAction === `reject-${user.id}` ? '...' : 'Reject'}
                                        </button>
                                    </>
                                ) : (
                                    <Link href={`/dashboard/users/${user.id}`}>
                                        <div className="text-law-blue hover:text-blue-800 cursor-pointer">View Profile</div>
                                    </Link>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}