'use client'

import { useState, useMemo, type ChangeEvent, type FC } from 'react'
import { approveUser, rejectUser, updateCaseStatus } from '@/app/dashboard/users/actions'
import type { UserProfile } from '@/types/user'
import Link from 'next/link'
import Image from 'next/image'

// সার্ভার অ্যাকশন থেকে আসা রেসপন্সের জন্য একটি টাইপ
interface ActionResult {
    success: boolean;
    message: string;
}

// Props-এর জন্য টাইপ সংজ্ঞা
interface Props {
  pendingUsers: UserProfile[];
  allClientsAndLeads: UserProfile[];
  staffUsers: UserProfile[];
}

// UserTable কম্পোনেন্টের Props-এর জন্য টাইপ
interface UserTableProps {
    data: UserProfile[];
    type: 'pending' | 'clients' | 'staff';
    onApprove?: (userId: string) => Promise<ActionResult>;
    onReject?: (userId: string) => Promise<ActionResult>;
}

interface UserAvatarProps {
    user: UserProfile;
}

interface CaseStatusChangerProps {
    currentStatus: string | null;
    userId: string;
}

// ============== Helper Components ==============

// ব্যবহারকারীর অ্যাভাটার দেখানোর জন্য
const UserAvatar: FC<UserAvatarProps> = ({ user }) => {
    const avatarSrc = user.avatar_url || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=random&color=fff`;
    return (
        <Image
            className="h-10 w-10 rounded-full object-cover"
            src={avatarSrc}
            alt={`${user.first_name || ''} ${user.last_name || ''}`}
            width={40}
            height={40}
        />
    )
}

// কেস স্ট্যাটাস পরিবর্তনের জন্য ড্রপডাউন
const CaseStatusChanger: FC<CaseStatusChangerProps> = ({ currentStatus, userId }) => {
    const [status, setStatus] = useState(currentStatus || 'not_applied');
    const [loading, setLoading] = useState(false);

    const statusOptions: { [key: string]: string } = {
        'not_applied': 'bg-gray-100 text-gray-800',
        'application_in_progress': 'bg-yellow-100 text-yellow-800',
        'active': 'bg-blue-100 text-blue-800',
        'completed': 'bg-green-100 text-green-800',
    };

    const handleStatusChange = async (e: ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        setLoading(true);
        setStatus(newStatus);
        const result = await updateCaseStatus(userId, newStatus);
        if (!result.success) {
            alert(`Error updating status: ${result.message}`);
            setStatus(currentStatus || 'not_applied'); // পুরনো স্ট্যাটাসে ফিরে যান
        }
        setLoading(false);
    }

    return (
        <select 
            value={status} 
            onChange={handleStatusChange}
            disabled={loading}
            className={`px-2 py-1 text-xs font-semibold rounded-full border-none outline-none appearance-none cursor-pointer ${statusOptions[status] || statusOptions['not_applied']}`}
        >
            <option value="not_applied">Not Applied</option>
            <option value="application_in_progress">In Progress</option>
            <option value="active">Active Client</option>
            <option value="completed">Completed</option>
        </select>
    )
}

// মূল টেবিল কম্পোনেন্ট
const UserTable: FC<UserTableProps> = ({ data, type, onApprove, onReject }) => {
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    const handleAction = async (action: 'approve' | 'reject', userId: string) => {
        const actionKey = `${action}-${userId}`;
        setLoadingAction(actionKey);
        
        let result: ActionResult | undefined;

        if (action === 'approve' && onApprove) {
            result = await onApprove(userId);
        } else if (action === 'reject' && onReject) {
            result = await onReject(userId);
        }
        
        if (result && !result.success) {
            alert(`Error: ${result.message}`);
        }

        setLoadingAction(null);
    }
    
    if (!data || data.length === 0) {
        return <p className="text-gray-500 mt-4 text-center py-10">No users found matching your criteria.</p>
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
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Newsletter</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                        <UserAvatar user={user} />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                                        <div className="text-sm text-gray-500">ID: #{user.id.substring(0, 6)}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${user.role === 'client' ? 'bg-green-100 text-green-800' : user.role === 'lead' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {(user.role === 'client' || user.role === 'lead') ? 
                                    <CaseStatusChanger currentStatus={user.status} userId={user.id} /> :
                                    <span className="text-sm text-gray-500">N/A</span>
                                }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                {user.is_newsletter_subscribed ? (
                                    <span className="text-green-600" title="Subscribed"><i className="fa-solid fa-check-circle"></i></span>
                                ) : (
                                    <span className="text-gray-400" title="Not Subscribed"><i className="fa-solid fa-times-circle"></i></span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                {type === 'pending' ? (
                                    <>
                                        <button 
                                            onClick={() => {
                                                if (confirm('Are you sure you want to approve this user?')) {
                                                    handleAction('approve', user.id)
                                                }
                                            }}
                                            disabled={!!loadingAction}
                                            className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                            {loadingAction === `approve-${user.id}` ? '...' : 'Approve'}
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if (confirm('Are you sure you want to reject and permanently delete this user?')) {
                                                    handleAction('reject', user.id)
                                                }
                                            }}
                                            disabled={!!loadingAction}
                                            className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                            {loadingAction === `reject-${user.id}` ? '...' : 'Reject'}
                                        </button>
                                    </>
                                ) : (
                                    <Link href={`/dashboard/users/${user.id}`} className="text-law-blue hover:text-blue-800 font-semibold">
                                        View Profile
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

// মূল ডিফল্ট এক্সপোর্ট কম্পোনেন্ট
export default function UserManagementTabs({ pendingUsers, allClientsAndLeads, staffUsers }: Props) {
  const [activeTab, setActiveTab] = useState('all');

  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'all',
    caseType: 'all',
    newsletter: 'all',
  });

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFilters(prev => ({ ...prev, [id]: value }));
  }

  const clearFilters = () => {
    setFilters({ searchTerm: '', status: 'all', caseType: 'all', newsletter: 'all' });
  }

  const filteredClientsAndLeads = useMemo(() => {
    return allClientsAndLeads.filter(user => {
      const { searchTerm, status, caseType, newsletter } = filters;
      
      const searchMatch = !searchTerm || (
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const statusMatch = status === 'all' || user.role === status;
      const caseTypeMatch = caseType === 'all' || user.case_type === caseType;
      const newsletterMatch = newsletter === 'all' || 
                              (newsletter === 'subscribed' && user.is_newsletter_subscribed === true) ||
                              (newsletter === 'unsubscribed' && user.is_newsletter_subscribed === false);

      return searchMatch && statusMatch && caseTypeMatch && newsletterMatch;
    });
  }, [allClientsAndLeads, filters]);

  const tabs = [
    { id: 'all', label: `Clients & Leads (${filteredClientsAndLeads.length})` },
    { id: 'pending', label: `Pending Approval (${pendingUsers.length})` },
    { id: 'staff', label: `Staff (${staffUsers.length})` },
  ];
  
  const handleApprove = async (userId: string): Promise<ActionResult> => {
      const result = await approveUser(userId);
      if (!result.success) alert(`Error: ${result.message}`);
      return result;
  }

  const handleReject = async (userId: string): Promise<ActionResult> => {
      const result = await rejectUser(userId);
      if (!result.success) alert(`Error: ${result.message}`);
      return result;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'all' && (
        <div id="clients-leads-filters" className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4">
                <div className="w-full sm:flex-1 sm:min-w-[250px]">
                    <div className="relative">
                        <input 
                            type="text" 
                            id="searchTerm" 
                            placeholder="Search by name or email..." 
                            value={filters.searchTerm}
                            onChange={handleFilterChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-law-blue"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i className="fa-solid fa-search text-gray-400"></i>
                        </div>
                    </div>
                </div>
                <select id="status" value={filters.status} onChange={handleFilterChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-law-blue">
                    <option value="all">All Types</option>
                    <option value="client">Client</option>
                    <option value="lead">Lead</option>
                </select>
                <select id="caseType" value={filters.caseType} onChange={handleFilterChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-law-blue">
                    <option value="all">All Case Types</option>
                    <option value="chapter-7">Chapter 7</option>
                    <option value="chapter-13">Chapter 13</option>
                    <option value="consultation">Consultation</option>
                </select>
                <select id="newsletter" value={filters.newsletter} onChange={handleFilterChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-law-blue">
                    <option value="all">Newsletter</option>
                    <option value="subscribed">Subscribed</option>
                    <option value="unsubscribed">Not Subscribed</option>
                </select>
                <button onClick={clearFilters} className="px-4 py-2 text-gray-600 hover:text-gray-800 focus:outline-none">
                    <i className="fa-solid fa-times mr-1"></i>
                    Clear
                </button>
            </div>
        </div>
      )}

      <div className="p-0 sm:p-6">
        <div className={activeTab === 'all' ? '' : 'hidden'}>
            <UserTable data={filteredClientsAndLeads} type="clients" />
        </div>
        <div className={activeTab === 'pending' ? '' : 'hidden'}>
            <UserTable data={pendingUsers} type="pending" onApprove={handleApprove} onReject={handleReject} />
        </div>
        <div className={activeTab === 'staff' ? '' : 'hidden'}>
            <UserTable data={staffUsers} type="staff" />
        </div>
      </div>
    </div>
  )
}