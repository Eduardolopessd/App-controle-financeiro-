'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { ArrowDownLeft, ArrowUpRight, TrendingUp, PiggyBank, ChevronLeft, ChevronRight } from 'lucide-react'
import { useApp } from '@/contexts/app-context'
import { useSankeyData } from '@/hooks/use-sankey-data'
import { type PeriodType } from '@/hooks/use-month-filter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import * as LucideIcons from 'lucide-react'

const ResponsiveSankey = dynamic(
  () => import('@nivo/sankey').then(mod => mod.ResponsiveSankey),
  { ssr: false }
)

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatCompact(value: number) {
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`
  return formatCurrency(value)
}

function getIcon(iconName: string) {
  const Icon = (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[iconName]
  return Icon || LucideIcons.Circle
}

const PERIODS: { key: PeriodType; label: string }[] = [
  { key: 'monthly', label: 'Mensal' },
  { key: 'quarterly', label: 'Trimestral' },
  { key: 'semiannual', label: 'Semestral' },
  { key: 'annual', label: 'Anual' },
]

export function ChartsView() {
  const { monthFilter } = useApp()
  const { getDateRangeForPeriod, navigatePeriod } = monthFilter

  const [period, setPeriod] = useState<PeriodType>('monthly')

  const periodRange = useMemo(() => getDateRangeForPeriod(period), [getDateRangeForPeriod, period])

  const { sankeyData, totalIncome, totalExpenses, balance, incomeTotals, expenseTotals } =
    useSankeyData(periodRange.start, periodRange.end)

  const hasData = sankeyData.nodes.length > 0 && sankeyData.links.length > 0

  const nodeColors = useMemo(() => {
    const colors: Record<string, string> = { 'Conta Principal': '#10B981' }
    incomeTotals.forEach(({ category }) => { colors[category.name] = category.color })
    expenseTotals.forEach(({ category }) => { colors[category.name] = category.color })
    return colors
  }, [incomeTotals, expenseTotals])

  return (
    <div className="px-4 pb-24 space-y-4">
      {/* Period type selector */}
      <div className="flex gap-1.5 bg-secondary rounded-xl p-1">
        {PERIODS.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={cn(
              'flex-1 py-1.5 text-xs font-medium rounded-lg transition-all',
              period === p.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Period navigator */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigatePeriod('prev', period)}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Período anterior"
        >
          <ChevronLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <span className="text-sm font-semibold capitalize">{periodRange.label}</span>
        <button
          onClick={() => navigatePeriod('next', period)}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Próximo período"
        >
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-income/5 border-income/20">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-income mb-1">
              <ArrowDownLeft className="h-4 w-4" />
              <span className="text-xs">Entradas</span>
            </div>
            <p className="text-lg font-bold text-income">{formatCurrency(totalIncome)}</p>
          </CardContent>
        </Card>

        <Card className="bg-expense/5 border-expense/20">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-expense mb-1">
              <ArrowUpRight className="h-4 w-4" />
              <span className="text-xs">Saídas</span>
            </div>
            <p className="text-lg font-bold text-expense">{formatCurrency(totalExpenses)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sankey Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Fluxo de Caixa
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasData ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <PiggyBank className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm">Sem dados para exibir</p>
              <p className="text-xs mt-1">Adicione lançamentos para ver o fluxo</p>
            </div>
          ) : (
            <div className="h-[350px] -mx-2">
              <ResponsiveSankey
                data={sankeyData}
                margin={{ top: 20, right: 120, bottom: 20, left: 120 }}
                align="justify"
                colors={(node) => nodeColors[node.id] || '#6B7280'}
                nodeOpacity={1}
                nodeHoverOthersOpacity={0.35}
                nodeThickness={18}
                nodeSpacing={24}
                nodeBorderWidth={0}
                nodeBorderRadius={3}
                linkOpacity={0.5}
                linkHoverOthersOpacity={0.15}
                linkContract={0}
                linkBlendMode="normal"
                enableLinkGradient={true}
                labelPosition="outside"
                labelOrientation="horizontal"
                labelPadding={12}
                labelTextColor={{ from: 'color', modifiers: [['brighter', 0.8]] }}
                theme={{
                  text: { fontSize: 11, fill: '#A1A1AA' },
                  tooltip: {
                    container: {
                      background: '#18181B',
                      color: '#FAFAFA',
                      fontSize: 12,
                      borderRadius: 8,
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)',
                      border: '1px solid #27272A',
                    },
                  },
                }}
                nodeTooltip={({ node }) => (
                  <div className="px-3 py-2">
                    <strong>{node.id}</strong>
                    <br />
                    <span className="text-muted-foreground">{formatCurrency(node.value)}</span>
                  </div>
                )}
                linkTooltip={({ link }) => (
                  <div className="px-3 py-2">
                    <span>{link.source.id}</span>
                    <span className="mx-2">→</span>
                    <span>{link.target.id}</span>
                    <br />
                    <strong>{formatCurrency(link.value)}</strong>
                  </div>
                )}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      {expenseTotals.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {expenseTotals
              .sort((a, b) => b.total - a.total)
              .map(({ category, total }) => {
                const Icon = getIcon(category.icon)
                const percent = totalExpenses > 0 ? (total / totalExpenses) * 100 : 0
                return (
                  <div key={category.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" style={{ color: category.color }} />
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold">{formatCompact(total)}</span>
                        <span className="text-xs text-muted-foreground ml-2">{percent.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${percent}%`, backgroundColor: category.color }}
                      />
                    </div>
                  </div>
                )
              })}
          </CardContent>
        </Card>
      )}

      {/* Income Breakdown */}
      {incomeTotals.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Receitas por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {incomeTotals
              .sort((a, b) => b.total - a.total)
              .map(({ category, total }) => {
                const Icon = getIcon(category.icon)
                const percent = totalIncome > 0 ? (total / totalIncome) * 100 : 0
                return (
                  <div key={category.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" style={{ color: category.color }} />
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold">{formatCompact(total)}</span>
                        <span className="text-xs text-muted-foreground ml-2">{percent.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${percent}%`, backgroundColor: category.color }}
                      />
                    </div>
                  </div>
                )
              })}
          </CardContent>
        </Card>
      )}

      {/* Balance Summary */}
      <Card className={cn('border-2', balance >= 0 ? 'border-income/30 bg-income/5' : 'border-expense/30 bg-expense/5')}>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">
              {balance >= 0 ? 'Saldo Positivo' : 'Saldo Negativo'} · {periodRange.label}
            </p>
            <p className={cn('text-3xl font-bold', balance >= 0 ? 'text-income' : 'text-expense')}>
              {formatCurrency(Math.abs(balance))}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {balance >= 0
                ? 'Parabens! Voce esta economizando.'
                : 'Atencao! Suas despesas superam as receitas.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
