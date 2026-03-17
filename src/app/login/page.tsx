'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Sparkles, Shield, TrendingUp, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

function formatCNPJ(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14)
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [cnpj, setCnpj] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpj(formatCNPJ(e.target.value))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const rawCnpj = cnpj.replace(/\D/g, '')
    if (rawCnpj.length !== 14) {
      toast.error('CNPJ inválido. Informe os 14 dígitos.')
      return
    }

    if (!password) {
      toast.error('Informe sua senha.')
      return
    }

    setIsLoading(true)
    try {
      await signIn(rawCnpj, password)
      toast.success('Login realizado com sucesso!')
      router.push('/dashboard')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login. Tente novamente.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] flex-col justify-center bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] text-white p-12 relative overflow-hidden">
        {/* Subtle background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-white/15 p-3 rounded-xl">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">ClinNota</h1>
              <p className="text-white/70 text-sm">Emissor de Notas de Serviço</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-start gap-4 bg-white/10 p-4 rounded-xl">
              <div className="bg-white/15 p-2.5 rounded-lg mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-0.5">Emissão Simplificada</h3>
                <p className="text-sm text-white/60">Emita notas fiscais em poucos cliques</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/10 p-4 rounded-xl">
              <div className="bg-white/15 p-2.5 rounded-lg mt-0.5">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-0.5">Segurança Total</h3>
                <p className="text-sm text-white/60">Certificado digital e criptografia</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/10 p-4 rounded-xl">
              <div className="bg-white/15 p-2.5 rounded-lg mt-0.5">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-0.5">Gestão Inteligente</h3>
                <p className="text-sm text-white/60">Acompanhe receitas e métricas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-gray-50">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="bg-[#7C3AED] p-2 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ClinNota</span>
          </div>

          <Card className="shadow-sm border border-gray-200 bg-white">
            <CardHeader className="space-y-1 pb-6 pt-8 px-8">
              <CardTitle className="text-2xl font-bold text-gray-900">Bem-vindo de volta!</CardTitle>
              <CardDescription className="text-gray-500">
                Faça login para acessar sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8 px-8">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="cnpj" className="text-gray-700 text-sm font-medium">CNPJ</Label>
                  <Input
                    id="cnpj"
                    placeholder="00.000.000/0000-00"
                    value={cnpj}
                    onChange={handleCnpjChange}
                    disabled={isLoading}
                    className="h-11 bg-white border-gray-300 focus:border-[#7C3AED] focus:ring-[#7C3AED]/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 text-sm font-medium">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-11 bg-white border-gray-300 focus:border-[#7C3AED] focus:ring-[#7C3AED]/20"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-[#7C3AED] hover:text-[#6D28D9] hover:underline font-medium"
                  >
                    Esqueci a senha
                  </button>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar na Plataforma'
                  )}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Não tem uma conta?{' '}
                  <button
                    onClick={() => router.push('/register')}
                    className="text-[#7C3AED] hover:text-[#6D28D9] font-semibold hover:underline"
                  >
                    Cadastre-se
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
