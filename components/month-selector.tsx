'use client'

import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { useApp } from '@/contexts/app-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function MonthSelector() {
  const { monthFilter } = useApp()
  const {
    monthYearDisplay,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    isCurrentMonth
  } = monthFilter

  return (
    <div className="flex items-center justify-between gap-2 px-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={goToPreviousMonth}
        className="h-9 w-9 text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="sr-only">Mês anterior</span>
      </Button>

      <button
        onClick={goToCurrentMonth}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
          'hover:bg-secondary/50',
          !isCurrentMonth && 'bg-secondary/30'
        )}
      >
        <Calendar className="h-4 w-4 text-primary" />
        <span className="font-semibold capitalize text-sm">
          {monthYearDisplay}
        </span>
        {!isCurrentMonth && (
          <span className="text-[10px] text-muted-foreground ml-1">
            (voltar)
          </span>
        )}
      </button>

      <Button
        variant="ghost"
        size="icon"
        onClick={goToNextMonth}
        disabled={isCurrentMonth}
        className="h-9 w-9 text-muted-foreground hover:text-foreground disabled:opacity-30"
      >
        <ChevronRight className="h-5 w-5" />
        <span className="sr-only">Próximo mês</span>
      </Button>
    </div>
  )
}
