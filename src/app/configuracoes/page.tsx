'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Hash, Upload, Briefcase, Lock, ChevronRight } from 'lucide-react'

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
]

export default function ConfiguracoesPage() {
  const router = useRouter()

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600 mt-2">Gerencie as configurações do sistema</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {settingsOptions.map((option) => {
              const Icon = option.icon
              return (
                <Link key={option.path} href={option.path}>
                  <Card className="border-none shadow-md cursor-pointer hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${option.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{option.title}</h3>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 mt-1" />
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
