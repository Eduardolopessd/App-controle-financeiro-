'use client'

import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Wallet, TrendingUp, TrendingDown, Pencil } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useApp } from '@/contexts/app-context'
import { useTransactions, useCategories } from '@/hooks/use-transactions'
import { useSankeyData } from '@/hooks/use-sankey-data'
import { useBudgetAnalysis } from '@/hooks/use-budget-analysis'
import { type Transaction } from '@/lib/db'
import { EditTransactionModal } from '@/components/edit-transaction-modal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import * as LucideIcons from 'lucide-react'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function getIcon(iconName: string) {
  const Icon = (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[iconName]
  return Icon || LucideIcons.Circle
}

export function DashboardView() {
  const { monthFilter } = useApp()
  const { dateRange, monthYear } = monthFilter

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const transactions = useTransactions({ startDate: dateRange.start, endDate: dateRange.end })
  const categories = useCategories()
  const { totalIncome, totalExpenses, balance } = useSankeyData(dateRange.start, dateRange.end)
  const { analysis } = useBudgetAnalysis(monthYear, dateRange.start, dateRange.end)

  const recentTransactions = transactions.slice(0, 8)
  const budgetAlerts = analysis.filter(a => a.isOverBudget || a.isNearLimit).slice(0, 3)

  return (
    <div className="px-4 pb-24 space-y-4">
      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Wallet className="h-4 w-4" />
            <span className="text-sm">Saldo do Mês</span>
          </div>
          <p className={cn('text-3xl font-bold tracking-tight', balance >= 0 ? 'text-income' : 'text-expense')}>
            {formatCurrency(balance)}
          </p>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-income/10">
                <ArrowDownLeft className="h-5 w-5 text-income" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Entradas</p>
                <p className="font-semibold text-income">{formatCurrency(totalIncome)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-expense/10">
                <ArrowUpRight className="h-5 w-5 text-expense" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Saídas</p>
                <p className="font-semibold text-expense">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-warning">
              <TrendingUp className="h-4 w-4" />
              Alertas de Orçamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {budgetAlerts.map(({ category, percentUsed, spent, budget, isOverBudget }) => {
              const Icon = getIcon(category.icon)
              return (
                <div key={category.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" style={{ color: category.color }} />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <span className={cn('text-xs font-medium', isOverBudget ? 'text-expense' : 'text-warning')}>
                      {percentUsed.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={Math.min(percentUsed, 100)} className="h-1.5" />
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(spent)} de {formatCurrency(budget?.limitValue ?? 0)}
                  </p>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
            Últimos Lançamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhum lançamento neste mês</p>
              <p className="text-xs mt-1">Toque no + para adicionar</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {recentTransactions.map(transaction => {
                const category = categories.find(c => c.id === transaction.categoryId)
                const Icon = category ? getIcon(category.icon) : LucideIcons.Circle
                const isIncome = transaction.type === 'income'

                return (
                  <button
                    key={transaction.id}
                    onClick={() => setEditingTransaction(transaction)}
                    className="w-full flex items-center justify-between py-3 hover:bg-secondary/50 -mx-1 px-1 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg shrink-0"
                        style={{ backgroundColor: `${category?.color}20` }}
                      >
                        <Icon className="h-4 w-4" style={{ color: category?.color }} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm leading-tight">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {category?.name} · {format(new Date(transaction.timestamp), 'dd MMM', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={cn('font-semibold text-sm', isIncome ? 'text-income' : 'text-expense')}>
                        {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </p>
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <EditTransactionModal
        transaction={editingTransaction}
        open={editingTransaction !== null}
        onClose={() => setEditingTransaction(null)}
      />
    </div>
  )
}
