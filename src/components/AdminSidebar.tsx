'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AdminSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }
    const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/bookings', label: 'Bookings' },
    { href: '/admin/customers', label: 'Customers' },
    { href: '/admin/services', label: 'Services' },
    { href: '/admin/broadcast', label: 'Broadcast' },
    { href: '/admin/settings', label: 'Settings' },
  ]

  return (
    <div className="w-64 bg-[#532332] min-h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-[#EEF4FF]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#65222A] border border-[#EEF4FF]/20 flex items-center justify-center">
            <span className="text-[#EEF4FF] font-serif text-lg">N</span>
          </div>
          <div>
            <p className="text-[#EEF4FF] font-serif text-sm tracking-wider">NILLYA</p>
            <p className="text-[#A09C97] text-[10px] tracking-widest uppercase">Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-4 py-3 text-xs tracking-widest uppercase transition-all duration-200 ${
              pathname === item.href
                ? 'bg-[#65222A] text-[#EEF4FF]'
                : 'text-[#EEF4FF]/50 hover:text-[#EEF4FF] hover:bg-[#65222A]/50'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-[#EEF4FF]/10">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 text-xs tracking-widest uppercase text-[#EEF4FF]/50 hover:text-[#EEF4FF] transition-all text-left"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}