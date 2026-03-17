'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pencil, Plus, X, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useApiClient } from '@/hooks/useApiClient'
import { useCachedData } from '@/hooks/useCachedData'
import { CACHE_KEYS } from '@/lib/localCache'
import type { ProfileData } from '@/types'

const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

export default function PerfilPage() {
  const router = useRouter()
  const { apiFetch } = useApiClient()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newCnae, setNewCnae] = useState('')

  const normalizeProfile = useCallback((raw: unknown): ProfileData => {
    const obj = (raw && typeof raw === 'object') ? raw as Record<string, unknown> : {}
    const data = (obj.data && typeof obj.data === 'object') ? obj.data as Record<string, unknown> : obj
    return {
      ...data,
      cnaes: Array.isArray(data.cnaes) ? data.cnaes : [],
    } as ProfileData
  }, [])

  const { data: profile, error, isLoading, reload, updateCache } = useCachedData<ProfileData>({
    cacheKey: CACHE_KEYS.PROFILE,
    apiUrl: '/api/profile',
    normalize: normalizeProfile,
  })

  const [profileData, setProfileData] = useState<ProfileData>({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    inscricaoMunicipal: '',
    regimeTributario: '',
    cnaes: [],
    email: '',
    telefone: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    estado: '',
    municipio: '',
  })

  useEffect(() => {
    if (profile) {
      setProfileData({
        ...profile,
        cnaes: Array.isArray(profile.cnaes) ? profile.cnaes : [],
      })
    }
  }, [profile])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await apiFetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Erro ao salvar perfil')
      }
      updateCache(profileData)
      toast.success('Perfil atualizado com sucesso!')
      setIsEditing(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar perfil'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setProfileData(profile)
    }
    setIsEditing(false)
  }

  const handleAddCnae = () => {
    if (newCnae.trim()) {
      setProfileData({
        ...profileData,
        cnaes: [...(profileData.cnaes || []), newCnae],
      })
      setNewCnae('')
    }
  }

  const handleRemoveCnae = (index: number) => {
    setProfileData({
      ...profileData,
      cnaes: (profileData.cnaes || []).filter((_, i) => i !== index),
    })
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED] mx-auto" />
            <p className="mt-2 text-gray-600">Carregando perfil...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Erro ao carregar perfil</p>
            <Button onClick={() => reload()} variant="outline">
              Tentar novamente
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!isEditing) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Perfil da Empresa</h1>
                <p className="text-gray-600 mt-2">Informações cadastrais da sua empresa</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={reload} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#7C3AED] transition-colors" title="Recarregar"><RefreshCw className="w-5 h-5" /></button>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Dados Gerais */}
              <Card className="border-none shadow-md">
                <CardHeader className="bg-purple-50 border-b">
                  <CardTitle>Dados Gerais</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Razão Social</p>
                      <p className="font-medium text-gray-900">{profileData.razaoSocial}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Nome Fantasia</p>
                      <p className="font-medium text-gray-900">{profileData.nomeFantasia}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">CNPJ</p>
                      <p className="font-medium text-gray-900">{profileData.cnpj}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Inscrição Municipal</p>
                      <p className="font-medium text-gray-900">{profileData.inscricaoMunicipal}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Regime Tributário</p>
                      <p className="font-medium text-gray-900">{profileData.regimeTributario}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">CNAE Principal</p>
                      {(profileData.cnaes || []).map((cnae, index) => (
                        <p key={index} className="font-medium text-gray-900">{cnae}</p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contato */}
              <Card className="border-none shadow-md">
                <CardHeader className="bg-purple-50 border-b">
                  <CardTitle>Contato</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="font-medium text-gray-900">{profileData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Telefone</p>
                      <p className="font-medium text-gray-900">{profileData.telefone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Endereço */}
              <Card className="border-none shadow-md">
                <CardHeader className="bg-purple-50 border-b">
                  <CardTitle>Endereço</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">CEP</p>
                      <p className="font-medium text-gray-900">{profileData.cep}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Logradouro</p>
                      <p className="font-medium text-gray-900">{profileData.logradouro}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Número</p>
                      <p className="font-medium text-gray-900">{profileData.numero}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Complemento</p>
                      <p className="font-medium text-gray-900">{profileData.complemento}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Bairro</p>
                      <p className="font-medium text-gray-900">{profileData.bairro}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Município</p>
                      <p className="font-medium text-gray-900">{profileData.municipio} - {profileData.estado}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Editar Perfil</h1>
            <p className="text-gray-600 mt-2">Atualize as informações da sua empresa</p>
          </div>

          <form className="space-y-6">
            {/* Dados Gerais */}
            <Card className="border-none shadow-md">
              <CardHeader className="bg-purple-50 border-b">
                <CardTitle>Dados Gerais</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Razão Social</Label>
                    <Input
                      value={profileData.razaoSocial}
                      onChange={(e) => setProfileData({ ...profileData, razaoSocial: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome Fantasia</Label>
                    <Input
                      value={profileData.nomeFantasia}
                      onChange={(e) => setProfileData({ ...profileData, nomeFantasia: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CNPJ</Label>
                    <Input
                      value={profileData.cnpj}
                      onChange={(e) => setProfileData({ ...profileData, cnpj: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Inscrição Municipal</Label>
                    <Input
                      value={profileData.inscricaoMunicipal}
                      onChange={(e) => setProfileData({ ...profileData, inscricaoMunicipal: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Regime Tributário</Label>
                    <Input
                      value={profileData.regimeTributario}
                      onChange={(e) => setProfileData({ ...profileData, regimeTributario: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>CNAE</Label>
                  <div className="space-y-2">
                    {(profileData.cnaes || []).map((cnae, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input value={cnae} readOnly className="flex-1" />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveCnae(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Adicionar novo CNAE"
                        value={newCnae}
                        onChange={(e) => setNewCnae(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddCnae}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contato */}
            <Card className="border-none shadow-md">
              <CardHeader className="bg-purple-50 border-b">
                <CardTitle>Contato</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={profileData.telefone}
                      onChange={(e) => setProfileData({ ...profileData, telefone: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card className="border-none shadow-md">
              <CardHeader className="bg-purple-50 border-b">
                <CardTitle>Endereço</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>CEP</Label>
                    <Input
                      value={profileData.cep}
                      onChange={(e) => setProfileData({ ...profileData, cep: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Logradouro</Label>
                    <Input
                      value={profileData.logradouro}
                      onChange={(e) => setProfileData({ ...profileData, logradouro: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Número</Label>
                    <Input
                      value={profileData.numero}
                      onChange={(e) => setProfileData({ ...profileData, numero: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Complemento</Label>
                    <Input
                      value={profileData.complemento}
                      onChange={(e) => setProfileData({ ...profileData, complemento: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Bairro</Label>
                    <Input
                      value={profileData.bairro}
                      onChange={(e) => setProfileData({ ...profileData, bairro: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select
                      value={profileData.estado}
                      onValueChange={(value) => setProfileData({ ...profileData, estado: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map((estado) => (
                          <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Município</Label>
                    <Input
                      value={profileData.municipio}
                      onChange={(e) => setProfileData({ ...profileData, municipio: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
