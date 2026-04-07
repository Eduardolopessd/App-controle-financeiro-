'use client'

import { useState } from 'react'
import { Tags, Target, Bell, Info, Trash2, Plus, ChevronRight } from 'lucide-react'
import { useApp } from '@/contexts/app-context'
import { useCategories, useBudgets, setBudget, addCategory, deleteCategory } from '@/hooks/use-transactions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import * as LucideIcons from 'lucide-react'
import { toast } from 'sonner'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

function getIcon(iconName: string) {
  const Icon = (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[iconName]
  return Icon || LucideIcons.Circle
}

const availableIcons = [
  'Briefcase', 'Laptop', 'TrendingUp', 'Plus', 'UtensilsCrossed',
  'Car', 'Home', 'Heart', 'GraduationCap', 'Gamepad2',
  'ShoppingBag', 'Receipt', 'Coffee', 'Plane', 'Gift',
  'Music', 'Smartphone', 'Shirt', 'Dumbbell', 'Tv'
]

const availableColors = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#64748B', '#06B6D4'
]

export function SettingsView() {
  const { monthFilter } = useApp()
  const { monthYear, monthYearDisplay } = monthFilter

  const categories = useCategories()
  const budgets = useBudgets(monthYear)
  const expenseCategories = categories.filter(c => c.type === 'expense')

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  )

  // Budget edit state
  const [editingBudget, setEditingBudget] = useState<number | null>(null)
  const [budgetValue, setBudgetValue] = useState('')

  // New category state
  const [newCategoryOpen, setNewCategoryOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryIcon, setNewCategoryIcon] = useState('Circle')
  const [newCategoryColor, setNewCategoryColor] = useState('#6B7280')
  const [newCategoryType, setNewCategoryType] = useState<'income' | 'expense'>('expense')

  const handleSaveBudget = async (categoryId: number) => {
    const value = parseFloat(budgetValue.replace(',', '.'))
    if (isNaN(value) || value < 0) {
      toast.error('Valor inválido')
      return
    }

    try {
      await setBudget(categoryId, value, monthYear)
      toast.success('Limite atualizado!')
      setEditingBudget(null)
      setBudgetValue('')
    } catch {
      toast.error('Erro ao salvar limite')
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    try {
      await addCategory({
        name: newCategoryName.trim(),
        icon: newCategoryIcon,
        color: newCategoryColor,
        type: newCategoryType
      })
      toast.success('Categoria criada!')
      setNewCategoryOpen(false)
      setNewCategoryName('')
      setNewCategoryIcon('Circle')
      setNewCategoryColor('#6B7280')
    } catch {
      toast.error('Erro ao criar categoria')
    }
  }

  const handleDeleteCategory = async (id: number) => {
    if (confirm('Tem certeza? As transações associadas não serão excluídas.')) {
      try {
        await deleteCategory(id)
        toast.success('Categoria removida!')
      } catch {
        toast.error('Erro ao remover categoria')
      }
    }
  }

  const handleToggleNotifications = async () => {
    if (!('Notification' in window)) {
      toast.error('Notificações não suportadas')
      return
    }

    if (Notification.permission === 'granted') {
      setNotificationsEnabled(false)
      toast.info('Notificações desabilitadas')
    } else if (Notification.permission === 'denied') {
      toast.error('Permissão negada. Habilite nas configurações do navegador.')
    } else {
      const permission = await Notification.requestPermission()
      setNotificationsEnabled(permission === 'granted')
      if (permission === 'granted') {
        toast.success('Notificações habilitadas!')
      }
    }
  }

  return (
    <div className="px-4 pb-24 space-y-4">
      {/* Budget Settings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Limites de Orçamento
          </CardTitle>
          <p className="text-xs text-muted-foreground capitalize">
            {monthYearDisplay}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {expenseCategories.map((category) => {
            const Icon = getIcon(category.icon)
            const budget = budgets.find(b => b.categoryId === category.id)
            const isEditing = editingBudget === category.id

            return (
              <div key={category.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: category.color }} />
                  </div>
                  <span className="text-sm font-medium">{category.name}</span>
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={budgetValue}
                      onChange={(e) => setBudgetValue(e.target.value)}
                      className="w-24 h-8 text-sm"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSaveBudget(category.id!)}
                      className="h-8"
                    >
                      OK
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingBudget(category.id!)
                      setBudgetValue(budget?.limitValue?.toString() || '')
                    }}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {budget?.limitValue ? formatCurrency(budget.limitValue) : 'Definir'}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Categories Management */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Tags className="h-4 w-4 text-primary" />
              Categorias
            </CardTitle>
            <Dialog open={newCategoryOpen} onOpenChange={setNewCategoryOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8">
                  <Plus className="h-4 w-4 mr-1" />
                  Nova
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Categoria</DialogTitle>
                  <DialogDescription>
                    Crie uma nova categoria para organizar suas transações.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Nome</Label>
                    <Input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Ex: Assinaturas"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label>Tipo</Label>
                    <Select
                      value={newCategoryType}
                      onValueChange={(v) => setNewCategoryType(v as 'income' | 'expense')}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expense">Despesa</SelectItem>
                        <SelectItem value="income">Receita</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Ícone</Label>
                    <div className="grid grid-cols-5 gap-2 mt-1.5">
                      {availableIcons.map((iconName) => {
                        const IconComponent = getIcon(iconName)
                        return (
                          <button
                            key={iconName}
                            onClick={() => setNewCategoryIcon(iconName)}
                            className={cn(
                              'p-2 rounded-lg border-2 transition-all',
                              newCategoryIcon === iconName
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            )}
                          >
                            <IconComponent className="h-5 w-5 mx-auto" />
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <Label>Cor</Label>
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      {availableColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewCategoryColor(color)}
                          className={cn(
                            'w-8 h-8 rounded-full border-2 transition-all',
                            newCategoryColor === color
                              ? 'border-white scale-110'
                              : 'border-transparent hover:scale-105'
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleAddCategory} className="w-full">
                    Criar Categoria
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories.map((category) => {
            const Icon = getIcon(category.icon)
            return (
              <div
                key={category.id}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: category.color }} />
                  </div>
                  <div>
                    <span className="text-sm font-medium">{category.name}</span>
                    <p className="text-xs text-muted-foreground">
                      {category.type === 'income' ? 'Receita' : 'Despesa'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteCategory(category.id!)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Alertas de Orçamento</p>
              <p className="text-xs text-muted-foreground">
                Receba alertas ao atingir 80% do limite
              </p>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={handleToggleNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            Sobre
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Finanças PWA</strong></p>
            <p>Versão 1.0.0</p>
            <p>
              Seus dados são armazenados localmente no dispositivo e funcionam 100% offline.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
