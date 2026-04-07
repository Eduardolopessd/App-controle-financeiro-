'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Transaction, type Category } from '@/lib/db'

interface UseTransactionsOptions {
  startDate?: Date
  endDate?: Date
  type?: 'income' | 'expense'
  categoryId?: number
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const { startDate, endDate, type, categoryId } = options

  const transactions = useLiveQuery(
    async () => {
      let query = db.transactions.orderBy('timestamp')

      const all = await query.reverse().toArray()

      return all.filter(t => {
        const timestamp = new Date(t.timestamp)
        if (startDate && timestamp < startDate) return false
        if (endDate && timestamp > endDate) return false
        if (type && t.type !== type) return false
        if (categoryId && t.categoryId !== categoryId) return false
        return true
      })
    },
    [startDate?.getTime(), endDate?.getTime(), type, categoryId],
    []
  )

  return transactions
}

export function useCategories(type?: 'income' | 'expense') {
  const categories = useLiveQuery(
    async () => {
      if (type) {
        return db.categories.where('type').equals(type).toArray()
      }
      return db.categories.toArray()
    },
    [type],
    []
  )

  return categories
}

export function useBudgets(monthYear: string) {
  const budgets = useLiveQuery(
    async () => {
      return db.budgets.where('monthYear').equals(monthYear).toArray()
    },
    [monthYear],
    []
  )

  return budgets
}

export async function addTransaction(transaction: Omit<Transaction, 'id'>) {
  return db.transactions.add(transaction)
}

export async function updateTransaction(id: number, changes: Partial<Transaction>) {
  return db.transactions.update(id, changes)
}

export async function deleteTransaction(id: number) {
  return db.transactions.delete(id)
}

export async function addCategory(category: Omit<Category, 'id'>) {
  return db.categories.add(category)
}

export async function updateCategory(id: number, changes: Partial<Category>) {
  return db.categories.update(id, changes)
}

export async function deleteCategory(id: number) {
  return db.categories.delete(id)
}

export async function setBudget(categoryId: number, limitValue: number, monthYear: string) {
  const existing = await db.budgets
    .where(['categoryId', 'monthYear'])
    .equals([categoryId, monthYear])
    .first()

  if (existing) {
    return db.budgets.update(existing.id!, { limitValue })
  }

  return db.budgets.add({ categoryId, limitValue, monthYear })
}

export async function deleteBudget(id: number) {
  return db.budgets.delete(id)
}
