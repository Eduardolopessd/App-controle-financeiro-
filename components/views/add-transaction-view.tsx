'use client'

import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Check } from 'lucide-react'
import { useApp } from '@/contexts/app-context'
import { useCategories, addTransaction } from '@/hooks/use-transactions'
import { checkBudgetAlerts } from '@/hooks/use-budget-analysis'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import * as LucideIcons from 'lucide-react'
import { toast } from 'sonner'

function getIcon(iconName: string) {
  const Icon = (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[iconName]
  return Icon || LucideIcons.Circle
}

export function AddTransactionView() {
  const { monthFilter, setActiveTab } = useApp()
  const { dateRange, monthYear } = monthFilter

  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = useCategories(type)

  const handleAmountChange = (value: string) => {
    // Allow only numbers and decimal point
    const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.')
    setAmount(cleaned)
  }

  const handleSubmit = async () => {
    if (!amount || !categoryId || !description.trim()) {
      toast.error('Preencha todos os campos')
      return
    }

    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error('Valor inválido')
      return
    }

    setIsSubmitting(true)

    try {
      await addTransaction({
        description: description.trim(),
        amount: numericAmount,
        type,
        categoryId,
        timestamp: new Date()
      })

      // Check budget alerts for expenses
      if (type === 'expense') {
        checkBudgetAlerts(monthYear, dateRange.start, dateRange.end)
      }

      toast.success('Lançamento adicionado!')

      // Reset form
      setAmount('')
      setDescription('')
      setCategoryId(null)

      // Navigate to dashboard
      setActiveTab('dashboard')
    } catch {
      toast.error('Erro ao salvar lançamento')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="px-4 pb-24 space-y-6">
      {/* Type Selector */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            setType('expense')
            setCategoryId(null)
          }}
          className={cn(
            'flex items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all',
            type === 'expense'
              ? 'border-expense bg-expense/10 text-expense'
              : 'border-border bg-card hover:border-expense/50'
          )}
        >
          <ArrowUpRight className="h-5 w-5" />
          <span className="font-semibold">Despesa</span>
        </button>

        <button
          onClick={() => {
            setType('income')
            setCategoryId(null)
          }}
          className={cn(
            'flex items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all',
            type === 'income'
              ? 'border-income bg-income/10 text-income'
              : 'border-border bg-card hover:border-income/50'
          )}
        >
          <ArrowDownLeft className="h-5 w-5" />
          <span className="font-semibold">Receita</span>
        </button>
      </div>

      {/* Amount Input */}
      <Card>
        <CardContent className="pt-6">
          <Label htmlFor="amount" className="text-sm text-muted-foreground">
            Valor
          </Label>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-bold text-muted-foreground">R$</span>
            <Input
              id="amount"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className={cn(
                'text-3xl font-bold border-0 bg-transparent p-0 h-auto focus-visible:ring-0',
                type === 'income' ? 'text-income' : 'text-expense'
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Description Input */}
      <Card>
        <CardContent className="pt-6">
          <Label htmlFor="description" className="text-sm text-muted-foreground">
            Descrição
          </Label>
          <Input
            id="description"
            placeholder="Ex: Almoço, Salário..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 bg-secondary/50 border-0"
          />
        </CardContent>
      </Card>

      {/* Category Selector */}
      <div>
        <Label className="text-sm text-muted-foreground mb-3 block">
          Categoria
        </Label>
        <div className="grid grid-cols-4 gap-3">
          {categories.map((category) => {
            const Icon = getIcon(category.icon)
            const isSelected = categoryId === category.id

            return (
              <button
                key={category.id}
                onClick={() => setCategoryId(category.id!)}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-primary/50'
                )}
              >
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color: category.color }}
                  />
                </div>
                <span className="text-xs font-medium text-center line-clamp-1">
                  {category.name}
                </span>
                {isSelected && (
                  <div className="absolute top-1 right-1 p-0.5 rounded-full bg-primary">
                    <Check className="h-2.5 w-2.5 text-primary-foreground" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !amount || !categoryId || !description.trim()}
        className={cn(
          'w-full py-6 text-lg font-semibold',
          type === 'income'
            ? 'bg-income hover:bg-income/90'
            : 'bg-expense hover:bg-expense/90'
        )}
      >
        {isSubmitting ? 'Salvando...' : 'Salvar Lançamento'}
      </Button>
    </div>
  )
}
