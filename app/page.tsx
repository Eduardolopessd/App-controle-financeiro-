'use client'

import { AppProvider, useApp } from '@/contexts/app-context'
import { AppHeader } from '@/components/app-header'
import { BottomNavigation } from '@/components/bottom-navigation'
import { DashboardView } from '@/components/views/dashboard-view'
import { AddTransactionView } from '@/components/views/add-transaction-view'
import { ChartsView } from '@/components/views/charts-view'
import { SettingsView } from '@/components/views/settings-view'
import { Toaster } from 'sonner'

function AppContent() {
  const { activeTab } = useApp()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      <main className="flex-1 max-w-lg mx-auto w-full pt-4">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'add' && <AddTransactionView />}
        {activeTab === 'charts' && <ChartsView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      <BottomNavigation />

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </div>
  )
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
