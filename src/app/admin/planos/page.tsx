"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CreditCard,
  Check,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Star,
  Zap,
  Crown,
  Edit,
} from "lucide-react"
import { adminApi } from "@/lib/adminApi"
import type { AdminDashboard } from "@/types/admin"

const plansStatic = [
  {
    name: "Trial",
    price: "R$ 0",
    period: "7 dias",
    description: "Teste gratuito para conhecer a plataforma",
    color: "blue",
    icon: Zap,
    popular: false,
    features: ["NFS-e basica", "Assinatura digital"],
  },
  {
    name: "Mensal",
    price: "R$ 99,90",
    period: "mês",
    description: "Ideal para clinicas em crescimento",
    color: "purple",
    icon: Star,
    popular: true,
    features: [
      "NFS-e ilimitadas",
      "Assinatura digital",
      "Acesso API",
      "Suporte email",
    ],
  },
  {
    name: "Anual",
    price: "R$ 999,90",
    period: "ano",
    description: "Melhor custo-beneficio com 2 meses grátis",
    color: "emerald",
    icon: Crown,
    popular: false,
    features: [
      "Tudo do mensal",
      "Suporte prioritario",
      "2 meses grátis",
      "Relatórios avancados",
    ],
  },
]

const colorMap: Record<string, { bg: string; text: string; gradient: string; light: string; bar: string }> = {
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    gradient: "from-blue-500 to-blue-600",
    light: "bg-blue-50",
    bar: "bg-blue-500",
  },
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    gradient: "from-purple-500 to-purple-600",
    light: "bg-purple-50",
    bar: "bg-purple-500",
  },
  emerald: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    gradient: "from-emerald-500 to-emerald-600",
    light: "bg-emerald-50",
    bar: "bg-emerald-500",
  },
}

export default function PlanosPage() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi
      .get<AdminDashboard>("dashboard")
      .then(setDashboard)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  // Build plans with real subscription counts from planDistribution
  const plans = plansStatic.map((plan) => {
    const dist = dashboard?.planDistribution.find(
      (d) => d.name.toLowerCase() === plan.name.toLowerCase()
    )
    return { ...plan, subscriptions: dist?.value ?? 0 }
  })

  const totalSubscriptions = plans.reduce((sum, p) => sum + p.subscriptions, 0)
  const totalAssinaturas = dashboard
    ? dashboard.licencasAtivas + dashboard.licencasTrial
    : totalSubscriptions
  const receitaFormatted = dashboard
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(dashboard.receitaMensal)
    : "R$ 0"
  const taxaConversao = dashboard ? `${dashboard.taxaConversao}%` : "0%"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Planos</h1>
            <p className="text-sm text-gray-500">
              Gerencie os planos e assinaturas da plataforma
            </p>
          </div>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
          <Plus className="h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 opacity-50" />
          <CardContent className="relative pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total de Planos</p>
                <p className="text-3xl font-bold text-gray-900">3</p>
                <p className="text-xs text-gray-500">Trial, Mensal, Anual</p>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-50" />
          <CardContent className="relative pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Assinaturas</p>
                <p className="text-3xl font-bold text-gray-900">{totalAssinaturas}</p>
                <p className="text-xs text-gray-500">empresas cadastradas</p>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-50 opacity-50" />
          <CardContent className="relative pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Receita Estimada</p>
                <p className="text-3xl font-bold text-green-600">{receitaFormatted}</p>
                <p className="text-xs text-green-600 font-medium">receita mensal</p>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-50" />
          <CardContent className="relative pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Taxa de Conversao</p>
                <p className="text-3xl font-bold text-blue-600">{taxaConversao}</p>
                <p className="text-xs text-gray-500">trial para pago</p>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Cards */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {plans.map((plan) => {
          const colors = colorMap[plan.color]
          const Icon = plan.icon

          return (
            <Card
              key={plan.name}
              className={`border-0 shadow-xl hover:shadow-2xl transition-shadow relative ${
                plan.popular ? "ring-2 ring-purple-500" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0 px-3 py-1 text-xs font-semibold shadow-md">
                    Mais Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2 pt-6">
                <div
                  className={`mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${colors.gradient} shadow-lg mb-3`}
                >
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {plan.name}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Price */}
                <div className="text-center">
                  <span className="text-3xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-500 ml-1">/{plan.period}</span>
                  {plan.name === "Anual" && (
                    <p className="text-sm text-emerald-600 font-medium mt-1">
                      R$ 83,33/mes
                    </p>
                  )}
                </div>

                {/* Subscriptions */}
                <div
                  className={`${colors.light} rounded-lg p-3 text-center`}
                >
                  <p className={`text-2xl font-bold ${colors.text}`}>
                    {plan.subscriptions}
                  </p>
                  <p className="text-sm text-gray-500">assinaturas ativas</p>
                </div>

                {/* Features */}
                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check
                        className={`h-4 w-4 ${colors.text} flex-shrink-0`}
                      />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Edit Button */}
                <Button
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Editar Plano
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Subscription Summary */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Distribuicao de Assinaturas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {plans.map((plan) => {
            const colors = colorMap[plan.color]
            const percentage =
              totalSubscriptions > 0
                ? Math.round((plan.subscriptions / totalSubscriptions) * 100)
                : 0

            return (
              <div key={plan.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    {plan.name}
                  </span>
                  <span className="text-gray-500">
                    {plan.subscriptions} assinaturas ({percentage}%)
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-gray-100">
                  <div
                    className={`h-3 rounded-full ${colors.bar} transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
