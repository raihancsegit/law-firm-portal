'use client'

import { useState, type FC, type Dispatch, type SetStateAction, useTransition } from 'react'
import type { UserProfile } from '@/types/user'
import { updateUserProfileByAdmin } from '@/app/dashboard/users/actions'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Props-এর জন্য টাইপ সংজ্ঞা
interface ClientPageProps {
    initialProfile: UserProfile & { email?: string };
}

interface ProfileDetailsTabProps {
    profile: UserProfile & { email?: string };
    setProfile: Dispatch<SetStateAction<UserProfile & { email?: string }>>;
    isEditing: boolean;
}

// ============== Helper Components (Tabs) ==============

// এটি Profile Details ট্যাবের জন্য একটি আলাদা কম্পোনেন্ট
const ProfileDetailsTab: FC<ProfileDetailsTabProps> = ({ profile, setProfile, isEditing }) => {
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setProfile(prev => ({ ...prev, [id]: value }));
    }
    
    return (
        <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                {/* Personal Information */}
                <div className="space-y-6">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input id="full_name" type="text" value={`${profile.first_name || ''} ${profile.last_name || ''}`} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" readOnly />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input id="email" type="email" value={profile.email || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" readOnly />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input id="phone_number" type="tel" value={profile.phone_number || ''} onChange={handleInputChange} disabled={!isEditing} className={`w-full px-3 py-2 border border-gray-300 rounded-lg transition-colors duration-200 ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`} />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Internal Notes Section */}
                <div className="space-y-6">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Internal Notes</h4>
                        <textarea id="internal_notes" rows={5} value={profile.internal_notes || ''} onChange={handleInputChange} disabled={!isEditing} className={`w-full px-3 py-2 border border-gray-300 rounded-lg transition-colors duration-200 ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`} placeholder="Add internal notes about this client/lead..."></textarea>
                    </div>
                </div>
                {/* Admin Editable Fields */}
                <div className="lg:col-span-2 space-y-6">
                     <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Admin Settings</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
                                <select id="role" value={profile.role || ''} onChange={handleInputChange} disabled={!isEditing} className={`w-full px-3 py-2 border border-gray-300 rounded-lg transition-colors duration-200 ${!isEditing ? 'bg-gray-100 appearance-none cursor-not-allowed' : 'bg-white'}`}>
                                    <option value="lead">Lead</option>
                                    <option value="client">Client</option>
                                    <option value="attorney">Attorney</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Case Status</label>
                                <select id="status" value={profile.status || ''} onChange={handleInputChange} disabled={!isEditing} className={`w-full px-3 py-2 border border-gray-300 rounded-lg transition-colors duration-200 ${!isEditing ? 'bg-gray-100 appearance-none cursor-not-allowed' : 'bg-white'}`}>
                                    <option value="not_applied">Not Applied</option>
                                    <option value="application_in_progress">In Progress</option>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Case Type</label>
                                <select id="case_type" value={profile.case_type || ''} onChange={handleInputChange} disabled={!isEditing} className={`w-full px-3 py-2 border border-gray-300 rounded-lg transition-colors duration-200 ${!isEditing ? 'bg-gray-100 appearance-none cursor-not-allowed' : 'bg-white'}`}>
                                    <option value="">Not Set</option>
                                    <option value="chapter-7">Chapter 7</option>
                                    <option value="chapter-13">Chapter 13</option>
                                    <option value="consultation">Consultation</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const DocumentsTab: FC<{ userId: string }> = ({ userId }) => {
    return <div className="p-6">Content for user documents will go here. User ID: {userId}</div>
}

const ApplicationDataTab: FC<{ userId: string }> = ({ userId }) => {
    return <div className="p-6">Content for application data will go here. User ID: {userId}</div>
}

const FinancialQuestionnaireTab: FC<{ userId:string }> = ({ userId }) => {
    return <div className="p-6">Content for financial questionnaire will go here. User ID: {userId}</div>
}


// ============== মূল ডিফল্ট এক্সপোর্ট কম্পোনেন্ট ==============
export default function UserProfileClientPage({ initialProfile }: ClientPageProps) {
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState(initialProfile);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    const avatarSrc = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random&color=fff`;

    const handleSave = () => {
        setMessage(null);
        startTransition(async () => {
            const updates: Partial<UserProfile> = {
                role: profile.role,
                status: profile.status,
                case_type: profile.case_type,
                phone_number: profile.phone_number,
                internal_notes: profile.internal_notes,
            };

            const result = await updateUserProfileByAdmin(profile.id, updates);
            
            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                setIsEditing(false);
                router.refresh();
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        });
    }
    
    const handleCancel = () => {
        setIsEditing(false);
        setProfile(initialProfile);
        setMessage(null);
    }
    
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header Section */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center">
                    <Link href="/dashboard/users" className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                        <i className="fa-solid fa-arrow-left"></i>
                    </Link>
                    <div className="flex items-center">
                        <Image src={avatarSrc} alt={fullName} width={48} height={48} className="w-12 h-12 rounded-full mr-4 object-cover" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{fullName}</h3>
                            <p className="text-sm text-gray-500">User ID: #{profile.id.substring(0, 8)}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {isEditing ? (
                        <>
                            <button onClick={handleCancel} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={isPending} className="px-4 py-2 bg-law-blue text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50">
                                {isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-law-blue text-white rounded-lg hover:bg-blue-700 text-sm">
                            <i className="fa-solid fa-edit mr-2"></i>
                            Edit User
                        </button>
                    )}
                </div>
            </div>
            
            {message && (
                <div className={`m-4 p-4 text-sm rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}
            
            {/* Tabs Navigation */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                    <button onClick={() => setActiveTab('profile')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'profile' ? 'border-law-blue text-law-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        <i className="fa-solid fa-user mr-2"></i>
                        Profile Details
                    </button>
                    <button onClick={() => setActiveTab('documents')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'documents' ? 'border-law-blue text-law-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        <i className="fa-solid fa-folder mr-2"></i>
                        Documents
                    </button>
                    <button onClick={() => setActiveTab('application')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'application' ? 'border-law-blue text-law-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        <i className="fa-solid fa-file-alt mr-2"></i>
                        Application Data
                    </button>
                    <button onClick={() => setActiveTab('financial')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'financial' ? 'border-law-blue text-law-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        <i className="fa-solid fa-calculator mr-2"></i>
                        Financial Questionnaire
                    </button>
                </nav>
            </div>
            
            {/* Conditional Tab Content */}
            <div>
                {activeTab === 'profile' && <ProfileDetailsTab profile={profile} setProfile={setProfile} isEditing={isEditing} />}
                {activeTab === 'documents' && <DocumentsTab userId={initialProfile.id} />}
                {activeTab === 'application' && <ApplicationDataTab userId={initialProfile.id} />}
                {activeTab === 'financial' && <FinancialQuestionnaireTab userId={initialProfile.id} />}
            </div>
        </div>
    )
}