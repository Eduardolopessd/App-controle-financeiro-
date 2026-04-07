'use client'

import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Category, type Budget } from '@/lib/db'

interface BudgetAnalysis {
  category: Category
  budget: Budget | null
  spent: number
  remaining: number
  percentUsed: number
  isOverBudget: boolean
  isNearLimit: boolean // > 80%
}

export function useBudgetAnalysis(monthYear: string, startDate: Date, endDate: Date) {
  const analysis = useLiveQuery(
    async () => {
      const [categories, budgets, transactions] = await Promise.all([
        db.categories.where('type').equals('expense').toArray(),
        db.budgets.where('monthYear').equals(monthYear).toArray(),
        db.transactions.toArray()
      ])

      const filteredTransactions = transactions.filter(t => {
        const timestamp = new Date(t.timestamp)
        return timestamp >= startDate && timestamp <= endDate && t.type === 'expense'
      })

      const results: BudgetAnalysis[] = categories.map(category => {
        const budget = budgets.find(b => b.categoryId === category.id) || null
        const spent = filteredTransactions
          .filter(t => t.categoryId === category.id)
          .reduce((sum, t) => sum + t.amount, 0)

        const limitValue = budget?.limitValue ?? 0
        const remaining = limitValue - spent
        const percentUsed = limitValue > 0 ? (spent / limitValue) * 100 : 0

        return {
          category,
          budget,
          spent,
          remaining,
          percentUsed,
          isOverBudget: spent > limitValue && limitValue > 0,
          isNearLimit: percentUsed >= 80 && percentUsed < 100
        }
      })

      return results.sort((a, b) => b.spent - a.spent)
    },
    [monthYear, startDate.getTime(), endDate.getTime()],
    []
  )

  const summary = useMemo(() => {
    if (!analysis || analysis.length === 0) {
      return {
        totalBudget: 0,
        totalSpent: 0,
        categoriesOverBudget: 0,
        categoriesNearLimit: 0
      }
    }

    return {
      totalBudget: analysis.reduce((sum, a) => sum + (a.budget?.limitValue ?? 0), 0),
      totalSpent: analysis.reduce((sum, a) => sum + a.spent, 0),
      categoriesOverBudget: analysis.filter(a => a.isOverBudget).length,
      categoriesNearLimit: analysis.filter(a => a.isNearLimit).length
    }
  }, [analysis])

  return {
    analysis: analysis ?? [],
    summary
  }
}

// Check and send budget alerts
export async function checkBudgetAlerts(monthYear: string, startDate: Date, endDate: Date) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return
  }

  const [categories, budgets, transactions] = await Promise.all([
    db.categories.where('type').equals('expense').toArray(),
    db.budgets.where('monthYear').equals(monthYear).toArray(),
    db.transactions.toArray()
  ])

  const filteredTransactions = transactions.filter(t => {
    const timestamp = new Date(t.timestamp)
    return timestamp >= startDate && timestamp <= endDate && t.type === 'expense'
  })

  for (const category of categories) {
    const budget = budgets.find(b => b.categoryId === category.id)
    if (!budget) continue

    const spent = filteredTransactions
      .filter(t => t.categoryId === category.id)
      .reduce((sum, t) => sum + t.amount, 0)

    const percentUsed = (spent / budget.limitValue) * 100

    if (percentUsed >= 80) {
      const registration = await navigator.serviceWorker.ready
      registration.active?.postMessage({
        type: 'BUDGET_ALERT',
        payload: {
          category: category.name,
          spent,
          limit: budget.limitValue
        }
      })
    }
  }
}
