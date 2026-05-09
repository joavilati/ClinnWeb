'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Upload, FileText, X, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useApiClient } from '@/hooks/useApiClient'
import { encodePassword } from '@/lib/passwordEncoder'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'


export default function CertificadoPage() {
  const router = useRouter()
  const { apiFetch } = useApiClient()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Selecione um arquivo de certificado')
      return
    }
    if (!password) {
      toast.error('Digite a senha do certificado')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('senha', encodePassword(password))
      formData.append('name', selectedFile.name)

      const response = await apiFetch(`/api/configuracoes/certificado`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        toast.success('Certificado enviado com sucesso!')
        router.push('/configuracoes')
      } else {
        toast.error('Erro ao enviar certificado')
      }
    } catch {
      toast.error('Erro ao enviar certificado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">Upload de Certificado</h1>
              <button onClick={() => window.location.reload()} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-[#7C3AED] transition-colors" title="Recarregar" aria-label="Recarregar dados"><RefreshCw className="w-5 h-5" /></button>
            </div>
            <p className="text-muted-foreground mt-2">Faça upload do certificado digital da empresa</p>
          </div>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Certificado Digital</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Arquivo do Certificado</Label>

                {!selectedFile ? (
                  <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-purple-400 transition-colors">
                    <label htmlFor="certificate-file" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-foreground font-medium mb-2">
                        Clique para selecionar o certificado
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Formatos aceitos: .p12, .pfx, .cer, .pem
                      </p>
                      <input
                        id="certificate-file"
                        type="file"
                        accept=".p12,.pfx,.cer,.pem"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 flex items-center justify-between bg-background">
                    <div className="flex items-center gap-3">
                      <FileText className="w-10 h-10 text-[#7C3AED]" />
                      <div>
                        <p className="font-medium text-foreground">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha do Certificado</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite a senha do certificado"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Senha utilizada para proteger o certificado digital
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-900 mb-2">Importante</h4>
                <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                  <li>O certificado digital é obrigatório para emissão de NFS-e</li>
                  <li>Verifique se o certificado está dentro da validade</li>
                  <li>A senha será armazenada de forma segura e criptografada</li>
                  <li>Mantenha uma cópia de segurança do seu certificado</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Link href="/configuracoes" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    Cancelar
                  </Button>
                </Link>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || !password || loading}
                  className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                >
                  {loading ? 'Enviando...' : 'Enviar Certificado'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
