import { User } from '@supabase/supabase-js'
import Link from 'next/link'

type HeaderProps = {
  user: User | null;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
      <div className="flex items-center justify-between">
        {/* Page Title - This part can be made dynamic later */}
        <div id="page-title">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm text-gray-600 mt-1 hidden sm:block">Manage clients, leads, and system settings</p>
        </div>

        {/* Admin Actions */}
        <div id="admin-actions" className="flex items-center space-x-4">
          <div className="relative">
            <button className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-law-blue rounded-lg">
              <i className="fa-solid fa-bell text-lg"></i>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
          
          <Link href="/dashboard/profile">
            <div className="flex items-center space-x-3 cursor-pointer">
              <img 
                src={user?.user_metadata.avatar_url || 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg'} 
                alt="Admin Avatar" 
                className="w-9 h-9 rounded-full object-cover"
              />
              <div className="text-sm hidden md:block">
                <p className="font-medium text-gray-900">{user?.user_metadata.full_name || user?.email}</p>
                <p className="text-gray-500 capitalize">{user?.user_metadata.role || 'Admin'}</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}