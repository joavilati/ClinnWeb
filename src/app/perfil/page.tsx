'use client'

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pencil, Loader2, RefreshCw, Building2, Phone, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { formatPhone, extractPhoneDigits, formatCnpj, extractCnpjDigits, formatCep, extractCepDigits } from '@/lib/masks'
import { useApiClient } from '@/hooks/useApiClient'
import { useCachedData } from '@/hooks/useCachedData'
import { CACHE_KEYS } from '@/lib/localCache'
import { ESTADOS, toUF } from '@/lib/constants'
import type { ProfileData } from '@/types'
import { MunicipioAutocomplete } from '@/components/MunicipioAutocomplete'

export default function PerfilPage() {
  const { apiFetch } = useApiClient()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [reloading, setReloading] = useState(false)

  const normalizeProfile = useCallback((raw: unknown): ProfileData => {
    const obj = (raw && typeof raw === 'object') ? raw as Record<string, unknown> : {}
    const data = (obj.data && typeof obj.data === 'object') ? obj.data as Record<string, unknown> : obj
    return {
      razaoSocial: String(data.razaoSocial || ''),
      nomeFantasia: String(data.nomeFantasia || ''),
      cnpj: String(data.cnpj || ''),
      inscricaoMunicipal: String(data.inscricaoMunicipal || ''),
      cnaes: Array.isArray(data.cnaes) ? data.cnaes : [],
      email: String(data.email || ''),
      telefone: String(data.telefone || ''),
      cep: String(data.cep || ''),
      logradouro: String(data.logradouro || ''),
      numero: String(data.numero || ''),
      bairro: String(data.bairro || ''),
      estado: toUF(String(data.uf || data.estado || '')),
      municipio: String(data.cidade || data.municipio || ''),
      codigoMunicipio: String(data.codigoMunicipio || data.cityCode || ''),
    }
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
    cnaes: [],
    email: '',
    telefone: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    estado: '',
    municipio: '',
    codigoMunicipio: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const REQUIRED_FIELDS: { key: keyof ProfileData; label: string }[] = [
    { key: 'razaoSocial', label: 'Razão Social' },
    { key: 'nomeFantasia', label: 'Nome Fantasia' },
    { key: 'cnpj', label: 'CNPJ' },
    { key: 'telefone', label: 'Telefone' },
    { key: 'cep', label: 'CEP' },
    { key: 'logradouro', label: 'Logradouro' },
    { key: 'numero', label: 'Número' },
    { key: 'bairro', label: 'Bairro' },
    { key: 'estado', label: 'Estado' },
    { key: 'municipio', label: 'Município' },
  ]

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {}
    for (const f of REQUIRED_FIELDS) {
      const v = profileData[f.key]
      if (typeof v === 'string' && v.trim() === '') {
        errs[f.key] = `${f.label} é obrigatório`
      }
    }
    return errs
  }

  useEffect(() => {
    setErrors(prev => {
      if (Object.keys(prev).length === 0) return prev
      const next = { ...prev }
      let changed = false
      for (const k of Object.keys(prev)) {
        const v = profileData[k as keyof ProfileData]
        if (typeof v === 'string' && v.trim() !== '') {
          delete next[k]
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [profileData])

  useEffect(() => {
    if (profile) {
      setProfileData({
        ...profile,
        cnaes: Array.isArray(profile.cnaes) ? profile.cnaes : [],
      })
    }
  }, [profile])

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      toast.error('Preencha os campos obrigatórios')
      return
    }
    setErrors({})
    setIsSaving(true)
    try {
      const payload = {
        razaoSocial: profileData.razaoSocial,
        nomeFantasia: profileData.nomeFantasia,
        cnpj: profileData.cnpj,
        inscricaoMunicipal: profileData.inscricaoMunicipal,
        email: profileData.email,
        telefone: profileData.telefone,
        cep: profileData.cep,
        logradouro: profileData.logradouro,
        numero: profileData.numero,
        bairro: profileData.bairro,
        codigoMunicipio: profileData.codigoMunicipio,
        uf: profileData.estado,
        cidade: profileData.municipio,
      }
      const res = await apiFetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const message = err.message || err.error || 'Erro ao salvar perfil'
        const m = String(message).match(/^(\w+) é obrigatório$/)
        if (m) {
          const field = m[1] === 'cidade' ? 'municipio' : m[1] === 'uf' ? 'estado' : m[1]
          setErrors({ [field]: String(message) })
        }
        throw new Error(String(message))
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED] mx-auto" />
            <p className="mt-2 text-muted-foreground">Carregando perfil...</p>
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
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8 relative">
              <div className="hidden dark:block absolute inset-0 bg-[#7C3AED]/10 rounded-3xl -z-10"></div>
              <div className="py-6 px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Perfil da Empresa</h1>
                      <button onClick={async () => { setReloading(true); await reload(); setReloading(false); toast.success('Dados atualizados') }} disabled={reloading} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-[#7C3AED] transition-colors disabled:opacity-50" title="Recarregar" aria-label="Recarregar dados"><RefreshCw className={`w-5 h-5 ${reloading ? 'animate-spin' : ''}`} /></button>
                    </div>
                    <p className="text-muted-foreground">Informações cadastrais da sua empresa</p>
                  </div>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </div>
            </div>

            {/* Company Name Banner */}
            <Card className="border-none shadow-lg mb-6 overflow-hidden">
              <div className="bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] p-5">
                <p className="text-white/80 text-sm">Razão Social</p>
                <p className="text-white text-xl font-bold">{profileData.razaoSocial || '-'}</p>
                {profileData.nomeFantasia && (
                  <p className="text-white/70 text-sm mt-1">{profileData.nomeFantasia}</p>
                )}
              </div>
            </Card>

            <div className="space-y-6">
              {/* Dados Gerais */}
              <Card className="border-none shadow-lg overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-[#7C3AED] to-[#9F67FF]"></div>
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-[#7C3AED]" />
                    </div>
                    Dados Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="p-4 rounded-xl bg-muted/40 border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">CNPJ</p>
                      <p className="font-semibold text-foreground">{profileData.cnpj ? formatCnpj(profileData.cnpj) : '-'}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/40 border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Inscrição Municipal</p>
                      <p className="font-semibold text-foreground">{profileData.inscricaoMunicipal || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contato */}
              <Card className="border-none shadow-lg overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-400"></div>
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-blue-500" />
                    </div>
                    Contato
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="p-4 rounded-xl bg-muted/40 border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Email</p>
                      <p className="font-semibold text-foreground">{profileData.email || '-'}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/40 border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Telefone</p>
                      <p className="font-semibold text-foreground">{profileData.telefone ? formatPhone(profileData.telefone) : '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Endereço */}
              <Card className="border-none shadow-lg overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-400"></div>
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-green-500" />
                    </div>
                    Endereço
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="p-4 rounded-xl bg-muted/40 border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">CEP</p>
                      <p className="font-semibold text-foreground">{profileData.cep ? formatCep(profileData.cep) : '-'}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/40 border border-border md:col-span-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Logradouro</p>
                      <p className="font-semibold text-foreground">{profileData.logradouro || '-'}{profileData.numero ? `, ${profileData.numero}` : ''}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/40 border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Bairro</p>
                      <p className="font-semibold text-foreground">{profileData.bairro || '-'}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/40 border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Município / UF</p>
                      <p className="font-semibold text-foreground">{profileData.municipio || '-'}{profileData.estado ? ` - ${profileData.estado}` : ''}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/40 border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Código IBGE</p>
                      <p className="font-semibold text-foreground">{profileData.codigoMunicipio || '-'}</p>
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
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Editar Perfil</h1>
            <p className="text-muted-foreground mt-2">Atualize as informações da sua empresa</p>
          </div>

          <form className="space-y-6">
            {/* Dados Gerais */}
            <Card className="border-none shadow-md">
              <CardHeader className="bg-purple-50 dark:bg-purple-950/30 border-b">
                <CardTitle>Dados Gerais</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Razão Social</Label>
                    <Input
                      value={profileData.razaoSocial}
                      onChange={(e) => setProfileData({ ...profileData, razaoSocial: e.target.value })}
                      aria-invalid={!!errors.razaoSocial}
                    />
                    {errors.razaoSocial && <p className="text-sm text-red-500">{errors.razaoSocial}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Nome Fantasia</Label>
                    <Input
                      value={profileData.nomeFantasia}
                      onChange={(e) => setProfileData({ ...profileData, nomeFantasia: e.target.value })}
                      aria-invalid={!!errors.nomeFantasia}
                    />
                    {errors.nomeFantasia && <p className="text-sm text-red-500">{errors.nomeFantasia}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>CNPJ</Label>
                    <Input
                      value={formatCnpj(profileData.cnpj)}
                      onChange={(e) => setProfileData({ ...profileData, cnpj: extractCnpjDigits(e.target.value) })}
                      placeholder="00.000.000/0000-00"
                      aria-invalid={!!errors.cnpj}
                    />
                    {errors.cnpj && <p className="text-sm text-red-500">{errors.cnpj}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Inscrição Municipal</Label>
                    <Input
                      value={profileData.inscricaoMunicipal}
                      onChange={(e) => setProfileData({ ...profileData, inscricaoMunicipal: e.target.value })}
                    />
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Contato */}
            <Card className="border-none shadow-md">
              <CardHeader className="bg-purple-50 dark:bg-purple-950/30 border-b">
                <CardTitle>Contato</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      value={formatPhone(profileData.telefone)}
                      onChange={(e) => setProfileData({ ...profileData, telefone: extractPhoneDigits(e.target.value) })}
                      placeholder="(00) 00000-0000"
                      aria-invalid={!!errors.telefone}
                    />
                    {errors.telefone && <p className="text-sm text-red-500">{errors.telefone}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card className="border-none shadow-md">
              <CardHeader className="bg-purple-50 dark:bg-purple-950/30 border-b">
                <CardTitle>Endereço</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>CEP</Label>
                    <Input
                      value={formatCep(profileData.cep)}
                      onChange={(e) => setProfileData({ ...profileData, cep: extractCepDigits(e.target.value) })}
                      placeholder="00000-000"
                      aria-invalid={!!errors.cep}
                    />
                    {errors.cep && <p className="text-sm text-red-500">{errors.cep}</p>}
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Logradouro</Label>
                    <Input
                      value={profileData.logradouro}
                      onChange={(e) => setProfileData({ ...profileData, logradouro: e.target.value })}
                      aria-invalid={!!errors.logradouro}
                    />
                    {errors.logradouro && <p className="text-sm text-red-500">{errors.logradouro}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Número</Label>
                    <Input
                      value={profileData.numero}
                      onChange={(e) => setProfileData({ ...profileData, numero: e.target.value })}
                      aria-invalid={!!errors.numero}
                    />
                    {errors.numero && <p className="text-sm text-red-500">{errors.numero}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Bairro</Label>
                    <Input
                      value={profileData.bairro}
                      onChange={(e) => setProfileData({ ...profileData, bairro: e.target.value })}
                      aria-invalid={!!errors.bairro}
                    />
                    {errors.bairro && <p className="text-sm text-red-500">{errors.bairro}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select
                      value={profileData.estado}
                      onValueChange={(value) => setProfileData({ ...profileData, estado: value })}
                    >
                      <SelectTrigger aria-invalid={!!errors.estado}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS.map((estado) => (
                          <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.estado && <p className="text-sm text-red-500">{errors.estado}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Município</Label>
                    <MunicipioAutocomplete
                      value={profileData.municipio}
                      estado={profileData.estado}
                      onChange={(name, code) => setProfileData({ ...profileData, municipio: name, codigoMunicipio: code })}
                      invalid={!!errors.municipio}
                    />
                    {errors.municipio && <p className="text-sm text-red-500">{errors.municipio}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Código do Município (IBGE)</Label>
                    <Input
                      value={profileData.codigoMunicipio}
                      readOnly
                      className="bg-background text-muted-foreground"
                      placeholder="Selecione o município acima"
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
