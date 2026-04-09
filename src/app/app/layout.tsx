'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ReactNode, useEffect } from 'react'
import { Home, Target, Users, BarChart3, User } from 'lucide-react'
import { registerServiceWorker } from '@/lib/sw'

const tabs = [
  { href: '/app', label: 'Feed', icon: Home },
  { href: '/app/habits', label: 'Hábitos', icon: Target },
  { href: '/app/squad', label: 'Squad', icon: Users },
  { href: '/app/recap', label: 'Progreso', icon: BarChart3 },
  { href: '/app/profile', label: 'Perfil', icon: User },
]

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isOnboarding = pathname === '/app/onboarding'

  useEffect(() => { registerServiceWorker() }, [])

  if (isOnboarding) return <>{children}</>

  return (
    <div className="min-h-screen bg-surface">
      <div className="pb-20 max-w-lg mx-auto">{children}</div>

      <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-2xl border-t border-border z-50">
        <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-2">
          {tabs.map((tab) => {
            const active = pathname === tab.href
            const Icon = tab.icon
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-lg transition-colors ${
                  active ? 'text-accent' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold">{tab.label}</span>
              </Link>
            )
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </div>
  )
}
