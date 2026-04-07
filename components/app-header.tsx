'use client'

import { Wifi, WifiOff } from 'lucide-react'
import { useApp } from '@/contexts/app-context'
import { MonthSelector } from '@/components/month-selector'
import { cn } from '@/lib/utils'

export function AppHeader() {
  const { isOnline } = useApp()

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border safe-area-top">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">F</span>
          </div>
          <span className="font-bold text-lg">Finanças</span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs',
              isOnline
                ? 'bg-income/10 text-income'
                : 'bg-warning/10 text-warning'
            )}
          >
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3" />
                <span className="hidden sm:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                <span>Offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-3 max-w-lg mx-auto">
        <MonthSelector />
      </div>
    </header>
  )
}
