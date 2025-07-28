'use client' // This component needs client-side interactivity

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navLinks = [
  { href: '/dashboard', icon: 'fa-chart-pie', label: 'Dashboard Overview' },
  { href: '/dashboard/approval', icon: 'fa-user-check', label: 'User Approval' },
  { href: '/dashboard/users', icon: 'fa-users', label: 'Clients & Leads' },
  { href: '/dashboard/settings/users', icon: 'fa-user-gear', label: 'User Management' },
  { href: '/dashboard/settings/folders', icon: 'fa-folder-tree', label: 'Folder Management' },
  { href: '/dashboard/settings/forms', icon: 'fa-file-lines', label: 'Form Management' },
];

const bottomLinks = [
    { href: '/dashboard/profile', icon: 'fa-user-tie', label: 'Admin Profile' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <aside className={`bg-white border-r border-gray-200 flex flex-col flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 h-20">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-law-blue">Cohen & Cohen P.C.</h1>
        )}
        <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
          <i className={`fa-solid ${isCollapsed ? 'fa-chevron-right' : 'fa-bars'} text-gray-600`}></i>
        </button>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href

            return (
              <li key={link.href}>
                <Link href={link.href}>
                  <div
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-law-blue text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? link.label : ''}
                  >
                    <i className={`fa-solid ${link.icon} w-5 text-center ${!isCollapsed ? 'mr-3' : ''} ${isActive ? 'text-white' : 'text-gray-400'}`}></i>
                    {!isCollapsed && <span>{link.label}</span>}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
        
        <div className="border-t border-gray-200 mt-6 pt-6">
            <ul className="space-y-2">
                {bottomLinks.map((link) => {
                    const isActive = pathname === link.href
                    return (
                        <li key={link.href}>
                             <Link href={link.href}>
                                <div
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                    isActive
                                    ? 'bg-law-blue text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                } ${isCollapsed ? 'justify-center' : ''}`}
                                title={isCollapsed ? link.label : ''}
                                >
                                <i className={`fa-solid ${link.icon} w-5 text-center ${!isCollapsed ? 'mr-3' : ''} ${isActive ? 'text-white' : 'text-gray-400'}`}></i>
                                {!isCollapsed && <span>{link.label}</span>}
                                </div>
                            </Link>
                        </li>
                    )
                })}
                 <li>
                    <button className={`w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200 ${isCollapsed ? 'justify-center' : ''}`}>
                        <i className={`fa-solid fa-sign-out-alt w-5 text-center ${!isCollapsed ? 'mr-3' : ''} text-red-500`}></i>
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </li>
            </ul>
        </div>
      </nav>
    </aside>
  )
}