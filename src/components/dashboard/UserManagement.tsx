'use client'

import { useState, useMemo, type ChangeEvent, type FC, useEffect } from 'react'
import { approveUser, rejectUser, updateCaseStatus } from '@/app/dashboard/users/actions'
import type { UserProfile } from '@/types/user'
import Link from 'next/link'
import Image from 'next/image'

// Props-এর জন্য টাইপ সংজ্ঞা
interface Props {
  allUsers: UserProfile[]; // এখন একটি মাত্র prop আসবে
}

// ============== Helper Components ==============

const UserAvatar: FC<{ user: UserProfile }> = ({ user }) => {
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

const CaseStatusChanger: FC<{ currentStatus: string | null; userId: string }> = ({ currentStatus, userId }) => {
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
            setStatus(currentStatus || 'not_applied');
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

// ============== মূল কম্পোনেন্ট ==============

export default function UserManagement({ allUsers }: Props) {
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'all',      // Role filter
    caseType: 'all',
    newsletter: 'all',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCurrentPage(1);
    const { id, value } = e.target;
    setFilters(prev => ({ ...prev, [id]: value }));
  }

  const clearFilters = () => {
    setFilters({ searchTerm: '', status: 'all', caseType: 'all', newsletter: 'all' });
    setCurrentPage(1);
  }

  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      const { searchTerm, status, caseType, newsletter } = filters;
      
      const searchMatch = !searchTerm || (
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const statusMatch = status === 'all' || user.role === status;
      const caseTypeMatch = caseType === 'all' || user.case_type === caseType;
      const newsletterMatch = newsletter === 'all' || 
                              (newsletter === 'subscribed' && user.is_newsletter_subscribed) ||
                              (newsletter === 'unsubscribed' && !user.is_newsletter_subscribed);

      return searchMatch && statusMatch && caseTypeMatch && newsletterMatch;
    });
  }, [allUsers, filters]);

  // Pagination Logic
  const totalEntries = filteredUsers.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredUsers.slice(indexOfFirstEntry, indexOfLastEntry);
  
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber);
    }
  }

  const handleAction = async (action: 'approve' | 'reject', userId: string) => {
    setLoadingAction(`${action}-${userId}`);
    if (action === 'approve') await approveUser(userId);
    if (action === 'reject') {
        if (confirm('Are you sure? This will permanently delete the user and their data.')) {
            await rejectUser(userId);
        }
    }
    setLoadingAction(null);
  }

  // পেজিনেশন বাটন রেন্ডার করার জন্য Helper
  const PaginationControls = () => (
    <div className="px-6 py-3 border-y border-gray-200 bg-gray-50 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                <label htmlFor="entries-per-page" className="text-sm text-gray-700">Show:</label>
                <select 
                    id="entries-per-page" 
                    value={entriesPerPage}
                    onChange={(e) => {
                        setEntriesPerPage(Number(e.target.value));
                        setCurrentPage(1);
                    }}
                    className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-law-blue"
                >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
                <span className="text-sm text-gray-700">entries</span>
            </div>
            <div id="entries-info" className="text-sm text-gray-700">
                Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, totalEntries)} of {totalEntries} entries
            </div>
        </div>
        <div id="pagination-controls" className="flex items-center space-x-2">
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50">
                Previous
            </button>
            <span className="text-sm">Page {currentPage} of {totalPages}</span>
            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50">
                Next
            </button>
        </div>
    </div>
  )

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Filters Section */}
      <div id="clients-leads-filters" className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4">
          <div className="w-full sm:flex-1 sm:min-w-[250px]">
            <div className="relative">
              <input 
                type="text" 
                id="searchTerm" 
                placeholder="Search by name, email, or phone..." 
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
            <option value="all">All Roles</option>
            <option value="lead">Lead</option>
            <option value="client">Client</option>
            <option value="attorney">Attorney</option>
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
      
      {/* Top Pagination */}
      <PaginationControls />

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case Status</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Newsletter</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {currentEntries.length > 0 ? (
                    currentEntries.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
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
                           
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{user.email}</div>
                                <div className="text-sm text-gray-500">{user.phone_number || 'N/A'}</div>
                            </td>
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
                            <td className="px-6 py-4 whitespace-nowrap">
                                {user.is_approved ? 
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Approved</span> :
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                                }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                {!user.is_approved && user.is_verified && (
                                    <>
                                        <button onClick={() => handleAction('approve', user.id)} disabled={!!loadingAction} className="...">Approve</button>
                                        <button onClick={() => handleAction('reject', user.id)} disabled={!!loadingAction} className="...">Reject</button>
                                    </>
                                )}
                                <Link href={`/dashboard/users/${user.id}`} className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-law-blue rounded-full hover:bg-blue-700 transition-colors duration-200">View Profile</Link>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                            No users found matching your criteria.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {/* Bottom Pagination */}
      <PaginationControls />
    </div>
  )
}