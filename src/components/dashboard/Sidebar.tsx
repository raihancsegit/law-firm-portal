'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// নেভিগেশন লিঙ্কের ডেটার জন্য একটি টাইপ ইন্টারফেস তৈরি করুন
interface NavLinkProps {
  href: string;
  icon: string;
  label: string;
}

// কম্পোনেন্টের Props এর জন্য টাইপ ডিফাইন করুন
interface NavLinkComponentProps {
  href: string;
  icon: string;
  label: string;
  isCollapsed: boolean;
  pathname: string;
}

// নেভিগেশন লিঙ্কগুলোর অ্যারে
const navLinks: NavLinkProps[] = [
  { href: '/dashboard', icon: 'fa-chart-pie', label: 'Dashboard Overview' },
  { href: '/dashboard/users', icon: 'fa-users', label: 'Clients & Leads' },
  { href: '/dashboard/settings/users', icon: 'fa-user-gear', label: 'User Management' },
  { href: '/dashboard/settings/folders', icon: 'fa-folder-tree', label: 'Folder Management' },
  { href: '/dashboard/settings/forms', icon: 'fa-file-lines', label: 'Form Management' },
];

const bottomLinks: NavLinkProps[] = [
    { href: '/dashboard/profile', icon: 'fa-user-tie', label: 'Admin Profile' },
];

// পুনর্ব্যবহারযোগ্য NavLink কম্পোনেন্ট (এখন টাইপ সহ)
const NavLink = ({ href, icon, label, isCollapsed, pathname }: NavLinkComponentProps) => {
  const isActive = pathname === href;

  return (
    <li key={href}>
      <Link href={href} title={isCollapsed ? label : ''}>
        <div
          className="nav-link-item group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
          data-active={isActive}
        >
          <i 
            className={`
              fa-solid ${icon} w-5 text-center transition-colors duration-200 
              ${!isCollapsed ? 'mr-3' : ''}
            `}
          ></i>
          {!isCollapsed && <span>{label}</span>}
        </div>
      </Link>
    </li>
  );
};


export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className={`bg-white border-r border-gray-200 flex flex-col flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 h-20">
        {!isCollapsed && (
          <Link href="/dashboard">
            <h1 className="text-xl font-bold text-law-blue cursor-pointer">Cohen & Cohen P.C.</h1>
          </Link>
        )}
        <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
          <i className={`fa-solid ${isCollapsed ? 'fa-chevron-right' : 'fa-bars'} text-gray-600`}></i>
        </button>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto flex flex-col">
        <ul className="space-y-2">
            {navLinks.map(link => (
                <NavLink 
                    key={link.href}
                    href={link.href}
                    icon={link.icon}
                    label={link.label}
                    isCollapsed={isCollapsed} 
                    pathname={pathname} 
                />
            ))}
        </ul>
        
        <div className="mt-auto pt-6 border-t border-gray-200">
             <ul className="space-y-2">
                {bottomLinks.map(link => (
                    <NavLink 
                        key={link.href}
                        href={link.href}
                        icon={link.icon}
                        label={link.label}
                        isCollapsed={isCollapsed} 
                        pathname={pathname} 
                    />
                ))}
                 <li>
                    <button 
                        onClick={handleLogout}
                        title={isCollapsed ? 'Logout' : ''}
                        className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <i className={`fa-solid fa-sign-out-alt w-5 text-center text-red-500 ${!isCollapsed ? 'mr-3' : ''}`}></i>
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </li>
            </ul>
        </div>
      </nav>
    </aside>
  )
}