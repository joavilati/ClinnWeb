'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatCnpj } from '@/lib/masks'

export default function RegisterPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [formData, setFormData] = useState({
    cnpj: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, cnpj: formatCnpj(e.target.value) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const rawCnpj = formData.cnpj.replace(/\D/g, '')
    if (rawCnpj.length !== 14) {
      toast.error('CNPJ inválido. Informe os 14 dígitos.')
      return
    }

    if (!formData.email) {
      toast.error('Informe seu e-mail.')
      return
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }

    setIsLoading(true)
    try {
      await signUp(rawCnpj, formData.email, formData.password)
      toast.success('Conta criada com sucesso!')
      router.push('/dashboard')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar conta. Tente novamente.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-[#7C3AED] p-2.5 rounded-xl">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground">ClinNota</span>
        </div>

        <Card className="shadow-sm border border-border bg-card">
          <CardHeader className="space-y-1 text-center pb-4 pt-8 px-8">
            <CardTitle className="text-2xl font-bold text-foreground">Criar Conta</CardTitle>
            <CardDescription className="text-muted-foreground">
              Cadastre-se para começar a emitir notas
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8 px-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cnpj" className="text-foreground text-sm font-medium">CNPJ</Label>
                <Input
                  id="cnpj"
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={handleCnpjChange}
                  disabled={isLoading}
                  className="h-11 bg-card border-border focus:border-[#7C3AED] focus:ring-[#7C3AED]/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground text-sm font-medium">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                  className="h-11 bg-card border-border focus:border-[#7C3AED] focus:ring-[#7C3AED]/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground text-sm font-medium">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                  className="h-11 bg-card border-border focus:border-[#7C3AED] focus:ring-[#7C3AED]/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground text-sm font-medium">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirme sua senha"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  disabled={isLoading}
                  className="h-11 bg-card border-border focus:border-[#7C3AED] focus:ring-[#7C3AED]/20"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold transition-colors mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  'Criar Conta'
                )}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <button
                  onClick={() => router.push('/login')}
                  className="text-[#7C3AED] hover:text-[#6D28D9] font-semibold hover:underline"
                >
                  Faça login
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
