'use client'

import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Hash, Upload, Briefcase, Lock, Palette, ChevronRight } from 'lucide-react'

const settingsOptions = [
  {
    icon: FileText,
    title: 'Dados Fiscais',
    description: 'Configure regime de tributação e ISS',
    path: '/configuracoes/dados-fiscais',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Hash,
    title: 'Série e Numeração (NFS-e)',
    description: 'Defina a série e sequência das notas',
    path: '/configuracoes/serie-numeracao',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Upload,
    title: 'Upload de Certificado',
    description: 'Faça upload do certificado digital',
    path: '/configuracoes/certificado',
    color: 'bg-[#F3E8FF] text-[#7C3AED]',
  },
  {
    icon: Briefcase,
    title: 'Serviços',
    description: 'Gerencie seus serviços cadastrados',
    path: '/configuracoes/servicos',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: Lock,
    title: 'Alterar Senha',
    description: 'Atualize sua senha de acesso',
    path: '/configuracoes/alterar-senha',
    color: 'bg-red-50 text-red-600',
  },
  {
    icon: Palette,
    title: 'Aparência',
    description: 'Escolha entre modo claro, escuro ou seguir o sistema',
    path: '/configuracoes/aparencia',
    color: 'bg-indigo-50 text-indigo-600',
  },
]

export default function ConfiguracoesPage() {
  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground mt-2">Gerencie as configurações do sistema</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {settingsOptions.map((option) => {
              const Icon = option.icon
              return (
                <Link key={option.path} href={option.path}>
                  <Card className="border border-border shadow-sm cursor-pointer hover:shadow-md hover:border-muted-foreground/40 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${option.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">{option.title}</h3>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
