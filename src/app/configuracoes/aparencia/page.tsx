'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Sun, Moon, Check } from 'lucide-react'

const options = [
  { value: 'light', title: 'Claro', description: 'Aparência clara em qualquer horário', Icon: Sun },
  { value: 'dark', title: 'Escuro', description: 'Reduz brilho e cansaço visual', Icon: Moon },
] as const

export default function AparenciaPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const current = mounted ? (theme === 'dark' ? 'dark' : 'light') : 'light'

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/configuracoes"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Aparência</h1>
            <p className="text-muted-foreground mt-2">
              Escolha como o ClinNota deve aparecer pra você
            </p>
          </div>

          <div className="space-y-3">
            {options.map(({ value, title, description, Icon }) => {
              const selected = current === value
              return (
                <Card
                  key={value}
                  className={`border-2 cursor-pointer transition-all ${
                    selected ? 'border-[#7C3AED] bg-[#7C3AED]/5' : 'border-border hover:border-muted-foreground/40'
                  }`}
                  onClick={() => setTheme(value)}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${selected ? 'bg-[#7C3AED] text-white' : 'bg-muted text-muted-foreground'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{title}</h3>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    {selected && <Check className="w-5 h-5 text-[#7C3AED]" />}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
