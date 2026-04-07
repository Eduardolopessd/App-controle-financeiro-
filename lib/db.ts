import Dexie, { type EntityTable } from 'dexie'

export interface Category {
  id?: number
  name: string
  icon: string
  color: string
  type: 'income' | 'expense'
}

export interface Transaction {
  id?: number
  description: string
  amount: number
  type: 'income' | 'expense'
  categoryId: number
  timestamp: Date
}

export interface Budget {
  id?: number
  categoryId: number
  limitValue: number
  monthYear: string // Format: "YYYY-MM"
}

const db = new Dexie('FinanceDB') as Dexie & {
  categories: EntityTable<Category, 'id'>
  transactions: EntityTable<Transaction, 'id'>
  budgets: EntityTable<Budget, 'id'>
}

db.version(1).stores({
  categories: '++id, name, type',
  transactions: '++id, description, amount, type, categoryId, timestamp',
  budgets: '++id, categoryId, monthYear'
})

// Seed default categories
export async function seedCategories() {
  const count = await db.categories.count()
  if (count === 0) {
    await db.categories.bulkAdd([
      // Income categories
      { name: 'Salário', icon: 'Briefcase', color: '#10B981', type: 'income' },
      { name: 'Freelance', icon: 'Laptop', color: '#06B6D4', type: 'income' },
      { name: 'Investimentos', icon: 'TrendingUp', color: '#8B5CF6', type: 'income' },
      { name: 'Outros', icon: 'Plus', color: '#6B7280', type: 'income' },
      // Expense categories
      { name: 'Alimentação', icon: 'UtensilsCrossed', color: '#EF4444', type: 'expense' },
      { name: 'Transporte', icon: 'Car', color: '#F59E0B', type: 'expense' },
      { name: 'Moradia', icon: 'Home', color: '#3B82F6', type: 'expense' },
      { name: 'Saúde', icon: 'Heart', color: '#EC4899', type: 'expense' },
      { name: 'Educação', icon: 'GraduationCap', color: '#8B5CF6', type: 'expense' },
      { name: 'Lazer', icon: 'Gamepad2', color: '#14B8A6', type: 'expense' },
      { name: 'Compras', icon: 'ShoppingBag', color: '#F97316', type: 'expense' },
      { name: 'Contas', icon: 'Receipt', color: '#64748B', type: 'expense' },
    ])
  }
}

export { db }
