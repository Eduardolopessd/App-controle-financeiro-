'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  startOfQuarter,
  endOfQuarter,
  subQuarters,
  addQuarters,
  startOfYear,
  endOfYear,
  subYears,
  addYears,
  subMonths as sub6,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type PeriodType = 'monthly' | 'quarterly' | 'semiannual' | 'annual'

export function useMonthFilter() {
  const [selectedDate, setSelectedDate] = useState(new Date())

  const monthYear = useMemo(() => {
    return format(selectedDate, 'yyyy-MM')
  }, [selectedDate])

  const monthYearDisplay = useMemo(() => {
    return format(selectedDate, 'MMMM yyyy', { locale: ptBR })
  }, [selectedDate])

  const dateRange = useMemo(() => {
    return {
      start: startOfMonth(selectedDate),
      end: endOfMonth(selectedDate),
    }
  }, [selectedDate])

  const goToPreviousMonth = useCallback(() => {
    setSelectedDate(prev => subMonths(prev, 1))
  }, [])

  const goToNextMonth = useCallback(() => {
    setSelectedDate(prev => addMonths(prev, 1))
  }, [])

  const goToCurrentMonth = useCallback(() => {
    setSelectedDate(new Date())
  }, [])

  const isCurrentMonth = useMemo(() => {
    const now = new Date()
    return format(now, 'yyyy-MM') === monthYear
  }, [monthYear])

  /**
   * Returns a dateRange for a given period type, anchored to selectedDate.
   */
  const getDateRangeForPeriod = useCallback(
    (period: PeriodType): { start: Date; end: Date; label: string } => {
      switch (period) {
        case 'quarterly': {
          const start = startOfQuarter(selectedDate)
          const end = endOfQuarter(selectedDate)
          const q = Math.floor(selectedDate.getMonth() / 3) + 1
          return {
            start,
            end,
            label: `T${q} ${format(selectedDate, 'yyyy')}`,
          }
        }
        case 'semiannual': {
          const half = selectedDate.getMonth() < 6 ? 0 : 1
          const start = new Date(selectedDate.getFullYear(), half * 6, 1)
          const end = endOfMonth(new Date(selectedDate.getFullYear(), half * 6 + 5, 1))
          return {
            start,
            end,
            label: `${half === 0 ? '1º' : '2º'} Sem. ${format(selectedDate, 'yyyy')}`,
          }
        }
        case 'annual': {
          const start = startOfYear(selectedDate)
          const end = endOfYear(selectedDate)
          return {
            start,
            end,
            label: format(selectedDate, 'yyyy'),
          }
        }
        case 'monthly':
        default: {
          return {
            start: startOfMonth(selectedDate),
            end: endOfMonth(selectedDate),
            label: format(selectedDate, 'MMMM yyyy', { locale: ptBR }),
          }
        }
      }
    },
    [selectedDate]
  )

  const navigatePeriod = useCallback(
    (direction: 'prev' | 'next', period: PeriodType) => {
      setSelectedDate(prev => {
        switch (period) {
          case 'quarterly':
            return direction === 'prev' ? subQuarters(prev, 1) : addQuarters(prev, 1)
          case 'semiannual':
            return direction === 'prev' ? sub6(prev, 6) : addMonths(prev, 6)
          case 'annual':
            return direction === 'prev' ? subYears(prev, 1) : addYears(prev, 1)
          default:
            return direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
        }
      })
    },
    []
  )

  return {
    selectedDate,
    setSelectedDate,
    monthYear,
    monthYearDisplay,
    dateRange,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    isCurrentMonth,
    getDateRangeForPeriod,
    navigatePeriod,
  }
}
