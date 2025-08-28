'use client';

import React from 'react';
import Link from 'next/link';

type SidebarProps = {
  className?: string;
};

export default function Sidebar({ className = '' }: SidebarProps) {
  const menuItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/deals', label: 'Deals' },
    { href: '/notifications', label: 'Notifications' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/profile', label: 'Profile' }
  ];

  return (
    <aside className={`w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 ${className}`}>
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}