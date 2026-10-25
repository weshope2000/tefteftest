'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { label: 'Overview', href: '/employer' },
  { label: 'Active', href: '/employer/active' },
  { label: 'My Jobs', href: '/employer/jobs' },
  { label: 'Proposals', href: '/employer/proposals' },
  { label: 'Find Freelancers', href: '/employer/freelancers' },
  { label: 'Contracts', href: '/employer/contracts' },
  { label: 'Messages', href: '/employer/messages' },
  { label: 'Payments', href: '/employer/payments' },
  { label: 'Reviews', href: '/employer/reviews' },
  { label: 'Reports', href: '/employer/reports' },
  { label: 'Settings', href: '/employer/settings' },
];

export function EmployerSidebar() {
  const pathname = usePathname();
  const { displayName, logout } = useAuth();

  return (
    <aside className='w-64 min-h-screen bg-gray-900 text-white flex flex-col'>
      <div className='p-6 border-b border-gray-700'>
        <h2 className='text-xl font-bold'>WORKSPACE</h2>
        <p className='text-xs text-gray-400 mt-1'>Employer Workspace</p>
        <p className='text-sm text-gray-200 mt-3 truncate' title={displayName}>{displayName}</p>
      </div>

      <nav className='flex-1 overflow-y-auto py-4'>
        <ul className='space-y-1 px-3'>
          <li>
            <Link href='/' className='block px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800'>← Back to site</Link>
          </li>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/employer' && pathname?.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link href={item.href} className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${isActive ? "bg-[#26734D] text-white" : "text-gray-300 hover:bg-gray-800"}`}>{item.label}</Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className='p-4 border-t border-gray-700'>
        <button onClick={logout} className='w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition text-left'>Log out</button>
      </div>
    </aside>
  );
}
