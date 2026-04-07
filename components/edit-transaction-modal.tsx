'use client'

import { useState, useEffect } from 'react'
import { ArrowDownLeft, ArrowUpRight, Trash2 } from 'lucide-react'
import { useCategories, updateTransaction, deleteTransaction } from '@/hooks/use-transactions'
import { type Transaction } from '@/lib/db'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import * as LucideIcons from 'lucide-react'
import { toast } from 'sonner'

function getIcon(iconName: string) {
  const Icon = (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[iconName]
  return Icon || LucideIcons.Circle
}

interface EditTransactionModalProps {
  transaction: Transaction | null
  open: boolean
  onClose: () => void
}

export function EditTransactionModal({ transaction, open, onClose }: EditTransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const categories = useCategories(type)

  useEffect(() => {
    if (transaction) {
      setType(transaction.type)
      setAmount(String(transaction.amount))
      setDescription(transaction.description)
      setCategoryId(transaction.categoryId)
      setShowDeleteConfirm(false)
    }
  }, [transaction])

  const handleAmountChange = (value: string) => {
    const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.')
    setAmount(cleaned)
  }

  const handleSave = async () => {
    if (!transaction?.id || !amount || !categoryId || !description.trim()) {
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
      await updateTransaction(transaction.id, {
        description: description.trim(),
        amount: numericAmount,
        type,
        categoryId,
      })
      toast.success('Lançamento atualizado!')
      onClose()
    } catch {
      toast.error('Erro ao atualizar lançamento')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!transaction?.id) return
    setIsSubmitting(true)
    try {
      await deleteTransaction(transaction.id)
      toast.success('Lançamento removido')
      onClose()
    } catch {
      toast.error('Erro ao remover lançamento')
    } finally {
      setIsSubmitting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl border-border bg-card p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-base">Editar Lançamento</DialogTitle>
          <DialogDescription>
            Altere os dados do lançamento ou exclua-o permanentemente.
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 pb-5 space-y-4">
          {/* Type selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setType('expense'); setCategoryId(null) }}
              className={cn(
                'flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all',
                type === 'expense'
                  ? 'border-expense bg-expense/10 text-expense'
                  : 'border-border bg-secondary hover:border-expense/40 text-muted-foreground'
              )}
            >
              <ArrowUpRight className="h-4 w-4" />
              Despesa
            </button>
            <button
              onClick={() => { setType('income'); setCategoryId(null) }}
              className={cn(
                'flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all',
                type === 'income'
                  ? 'border-income bg-income/10 text-income'
                  : 'border-border bg-secondary hover:border-income/40 text-muted-foreground'
              )}
            >
              <ArrowDownLeft className="h-4 w-4" />
              Receita
            </button>
          </div>

          {/* Amount */}
          <div>
            <Label className="text-xs text-muted-foreground">Valor</Label>
            <div className="flex items-center gap-2 mt-1.5 px-3 py-2 rounded-xl bg-secondary">
              <span className="text-lg font-bold text-muted-foreground">R$</span>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={amount}
                onChange={e => handleAmountChange(e.target.value)}
                className={cn(
                  'text-2xl font-bold border-0 bg-transparent p-0 h-auto focus-visible:ring-0 shadow-none',
                  type === 'income' ? 'text-income' : 'text-expense'
                )}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-xs text-muted-foreground">Descrição</Label>
            <Input
              placeholder="Descrição do lançamento"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="mt-1.5 bg-secondary border-0"
            />
          </div>

          {/* Category */}
          <div>
            <Label className="text-xs text-muted-foreground block mb-2">Categoria</Label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map(category => {
                const Icon = getIcon(category.icon)
                const isSelected = categoryId === category.id
                return (
                  <button
                    key={category.id}
                    onClick={() => setCategoryId(category.id!)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all',
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-secondary hover:border-primary/40'
                    )}
                  >
                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${category.color}20` }}>
                      <Icon className="h-4 w-4" style={{ color: category.color }} />
                    </div>
                    <span className="text-[10px] font-medium text-center line-clamp-1 leading-tight">
                      {category.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {showDeleteConfirm ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-expense hover:bg-expense/90 text-white"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Removendo...' : 'Confirmar exclusão'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 border-expense/30 text-expense hover:bg-expense/10 hover:border-expense"
                  onClick={() => setShowDeleteConfirm(true)}
                  aria-label="Excluir lançamento"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  className={cn(
                    'flex-1',
                    type === 'income' ? 'bg-income hover:bg-income/90' : 'bg-expense hover:bg-expense/90'
                  )}
                  onClick={handleSave}
                  disabled={isSubmitting || !amount || !categoryId || !description.trim()}
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
