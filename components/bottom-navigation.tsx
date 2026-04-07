'use client'

import { Home, Plus, BarChart3, Settings } from 'lucide-react'
import { useApp } from '@/contexts/app-context'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'dashboard', label: 'Início', icon: Home },
  { id: 'add', label: 'Lançar', icon: Plus, highlight: true },
  { id: 'charts', label: 'Gráficos', icon: BarChart3 },
  { id: 'settings', label: 'Ajustes', icon: Settings },
] as const

export function BottomNavigation() {
  const { activeTab, setActiveTab } = useApp()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-tab-bar border-t border-tab-bar-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map(({ id, label, icon: Icon, highlight }) => {
          const isActive = activeTab === id

          if (highlight) {
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex flex-col items-center justify-center -mt-6"
                aria-label={label}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200',
                    isActive
                      ? 'bg-primary scale-110'
                      : 'bg-primary/80 hover:bg-primary hover:scale-105'
                  )}
                >
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <span
                  className={cn(
                    'text-[10px] mt-1 font-medium transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {label}
                </span>
              </button>
            )
          }

          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-lg transition-all duration-200"
              aria-label={label}
            >
              <Icon
                className={cn(
                  'w-6 h-6 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
