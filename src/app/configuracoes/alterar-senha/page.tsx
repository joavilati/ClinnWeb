'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useApiClient } from '@/hooks/useApiClient'
import { encodePassword } from '@/lib/passwordEncoder'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'


export default function AlterarSenhaPage() {
  const router = useRouter()
  const { apiFetch } = useApiClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Preencha todos os campos')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    if (formData.newPassword.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setLoading(true)
    try {
      const response = await apiFetch(`/api/configuracoes/alterar-senha`, {
        method: 'PUT',
        body: JSON.stringify({
          senhaAtual: encodePassword(formData.currentPassword),
          novaSenha: encodePassword(formData.newPassword),
        }),
      })

      if (response.ok) {
        toast.success('Senha alterada com sucesso!')
        router.push('/configuracoes')
      } else {
        const data = await response.json().catch(() => null)
        toast.error(data?.message || 'Erro ao alterar senha')
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      toast.error('Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link href="/configuracoes">
              <Button
                variant="ghost"
                className="mb-4 -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Alterar Senha</h1>
            <p className="text-gray-600 mt-2">Atualize sua senha de acesso</p>
          </div>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Nova Senha</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Senha Atual</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="Digite sua senha atual"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Digite sua nova senha"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  />
                  <p className="text-sm text-gray-600">
                    A senha deve ter no mínimo 6 caracteres
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirme sua nova senha"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Dicas de Segurança</h4>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Use uma combinação de letras maiúsculas e minúsculas</li>
                    <li>Inclua números e caracteres especiais</li>
                    <li>Não use informações pessoais óbvias</li>
                    <li>Evite senhas que já usou anteriormente</li>
                  </ul>
                </div>

                <div className="flex gap-3 pt-4">
                  <Link href="/configuracoes" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                    >
                      Cancelar
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                  >
                    {loading ? 'Alterando...' : 'Alterar Senha'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
