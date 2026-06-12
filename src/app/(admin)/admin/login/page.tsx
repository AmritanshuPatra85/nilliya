'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }
    router.push('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#65222A] flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full border-2 border-[#EEF4FF]/40 bg-[#532332] flex items-center justify-center mx-auto mb-6">
            <span className="text-[#EEF4FF] font-serif text-2xl">N</span>
          </div>
          <h1 className="text-[#EEF4FF] font-serif text-3xl font-light tracking-wide mb-1">Admin Panel</h1>
          <p className="text-[#A09C97] text-xs tracking-widest uppercase">Nillya The Makeup Studio</p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-[#A09C97] text-xs tracking-widest uppercase block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@nillya.com"
              className="w-full bg-[#532332]/30 border border-[#EEF4FF]/20 text-[#EEF4FF] px-4 py-3 focus:outline-none focus:border-[#EEF4FF]/60 placeholder:text-[#EEF4FF]/20"
            />
          </div>
          <div>
            <label className="text-[#A09C97] text-xs tracking-widest uppercase block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full bg-[#532332]/30 border border-[#EEF4FF]/20 text-[#EEF4FF] px-4 py-3 focus:outline-none focus:border-[#EEF4FF]/60 placeholder:text-[#EEF4FF]/20"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4">{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading || !email || !password}
          className="w-full bg-[#EEF4FF] text-[#532332] py-4 text-sm tracking-widest uppercase font-semibold hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </div>
  )
}