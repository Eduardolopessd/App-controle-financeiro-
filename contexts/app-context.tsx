'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useMonthFilter } from '@/hooks/use-month-filter'
import { seedCategories } from '@/lib/db'

type TabType = 'dashboard' | 'add' | 'charts' | 'settings'

interface AppContextType {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  monthFilter: ReturnType<typeof useMonthFilter>
  isOnline: boolean
  isInstalled: boolean
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [isOnline, setIsOnline] = useState(true)
  const [isInstalled, setIsInstalled] = useState(false)
  const monthFilter = useMonthFilter()

  useEffect(() => {
    // Seed categories on first load
    seedCategories()

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    }

    // Check online status
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check if installed as PWA
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    setIsInstalled(mediaQuery.matches)
    const handleChange = (e: MediaQueryListEvent) => setIsInstalled(e.matches)
    mediaQuery.addEventListener('change', handleChange)

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      mediaQuery.removeEventListener('change', handleChange)
    }
}, [])

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        monthFilter,
        isOnline,
        isInstalled
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
