'use client'

import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Category } from '@/lib/db'

interface SankeyNode {
  id: string
  nodeColor?: string
}

interface SankeyLink {
  source: string
  target: string
  value: number
}

interface SankeyData {
  nodes: SankeyNode[]
  links: SankeyLink[]
}

interface CategoryTotal {
  category: Category
  total: number
}

export function useSankeyData(startDate: Date, endDate: Date) {
  const rawData = useLiveQuery(
    async () => {
      const [transactions, categories] = await Promise.all([
        db.transactions.toArray(),
        db.categories.toArray()
      ])

      const filteredTransactions = transactions.filter(t => {
        const timestamp = new Date(t.timestamp)
        return timestamp >= startDate && timestamp <= endDate
      })

      // Calculate totals by category
      const incomeTotals: CategoryTotal[] = []
      const expenseTotals: CategoryTotal[] = []

      categories.forEach(category => {
        const total = filteredTransactions
          .filter(t => t.categoryId === category.id && t.type === category.type)
          .reduce((sum, t) => sum + t.amount, 0)

        if (total > 0) {
          if (category.type === 'income') {
            incomeTotals.push({ category, total })
          } else {
            expenseTotals.push({ category, total })
          }
        }
      })

      const totalIncome = incomeTotals.reduce((sum, item) => sum + item.total, 0)
      const totalExpenses = expenseTotals.reduce((sum, item) => sum + item.total, 0)

      return {
        incomeTotals,
        expenseTotals,
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses
      }
    },
    [startDate.getTime(), endDate.getTime()],
    { incomeTotals: [], expenseTotals: [], totalIncome: 0, totalExpenses: 0, balance: 0 }
  )

  const sankeyData: SankeyData = useMemo(() => {
    if (!rawData || (rawData.totalIncome === 0 && rawData.totalExpenses === 0)) {
      return { nodes: [], links: [] }
    }

    const nodes: SankeyNode[] = []
    const links: SankeyLink[] = []

    // Add income source nodes
    rawData.incomeTotals.forEach(({ category }) => {
      nodes.push({
        id: category.name,
        nodeColor: category.color
      })
    })

    // Add central node (Account/Month)
    nodes.push({
      id: 'Conta Principal',
      nodeColor: '#10B981'
    })

    // Add expense target nodes
    rawData.expenseTotals.forEach(({ category }) => {
      nodes.push({
        id: category.name,
        nodeColor: category.color
      })
    })

    // Add savings node if there's remaining balance
    if (rawData.balance > 0) {
      nodes.push({
        id: 'Poupança',
        nodeColor: '#8B5CF6'
      })
    }

    // Create links from income categories to central account
    rawData.incomeTotals.forEach(({ category, total }) => {
      links.push({
        source: category.name,
        target: 'Conta Principal',
        value: total
      })
    })

    // Create links from central account to expense categories
    rawData.expenseTotals.forEach(({ category, total }) => {
      links.push({
        source: 'Conta Principal',
        target: category.name,
        value: total
      })
    })

    // Add savings link if balance is positive
    if (rawData.balance > 0) {
      links.push({
        source: 'Conta Principal',
        target: 'Poupança',
        value: rawData.balance
      })
    }

    return { nodes, links }
  }, [rawData])

  return {
    sankeyData,
    totalIncome: rawData?.totalIncome ?? 0,
    totalExpenses: rawData?.totalExpenses ?? 0,
    balance: rawData?.balance ?? 0,
    incomeTotals: rawData?.incomeTotals ?? [],
    expenseTotals: rawData?.expenseTotals ?? []
  }
}
