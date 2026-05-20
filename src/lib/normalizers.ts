import type { Client, Service, ClientAddress, DashboardData, DashboardMetric, NfseNote, NoteStatus, License } from '@/types'

/**
 * Normaliza a resposta de serviços do backend.
 * Backend retorna: { services: [{ id, data: { name, description, ctribNac, cnae, defaultValue } }] }
 */
export function normalizeServices(raw: unknown): Service[] {
  if (!raw || typeof raw !== 'object') return []

  const obj = raw as Record<string, unknown>
  const list: unknown[] = Array.isArray(raw) ? raw : (obj.services as unknown[] ?? obj.data as unknown[] ?? [])

  if (!Array.isArray(list)) return []

  return list.map((item: unknown) => {
    const s = item as Record<string, unknown>
    // O backend aninha dados em "data"
    const data = (s.data && typeof s.data === 'object') ? s.data as Record<string, unknown> : s

    return {
      id: String(s.id || ''),
      name: String(data.name || data.nome || ''),
      description: String(data.description || data.descricao || ''),
      cTribNac: String(data.ctribNac || data.cTribNac || data.code || ''),
      cnae: String(data.cnae || ''),
      defaultValue: Number(data.defaultValue || data.valor || 0),
    }
  })
}

/**
 * Normaliza a resposta de clientes do backend.
 * Backend retorna: { clients: [{ id, cpfCnpj, companyName, email, postalCode, address, number, complement, neighborhood, state, city, phone }] }
 */
export function normalizeClients(raw: unknown): Client[] {
  if (!raw || typeof raw !== 'object') return []

  const obj = raw as Record<string, unknown>
  const list: unknown[] = Array.isArray(raw) ? raw : (obj.clients as unknown[] ?? obj.data as unknown[] ?? [])

  if (!Array.isArray(list)) return []

  return list.map((item: unknown) => {
    const c = item as Record<string, unknown>

    const address: ClientAddress = {
      cep: String(c.postalCode || c.cep || ''),
      logradouro: String(c.address || c.logradouro || ''),
      numero: String(c.number || c.numero || ''),
      complemento: String(c.complement || c.complemento || ''),
      bairro: String(c.neighborhood || c.bairro || ''),
      estado: String(c.state || c.estado || ''),
      municipio: String(c.city || c.municipio || ''),
    }

    // Detectar tipo de documento pelo tamanho do cpfCnpj
    const cpfCnpj = String(c.cpfCnpj || c.cpf_cnpj || '')
    const digits = cpfCnpj.replace(/\D/g, '')
    const documentType = digits.length > 11 ? 'CNPJ' : 'CPF'

    return {
      id: String(c.id || ''),
      cpfCnpj,
      companyName: String(c.companyName || c.company_name || c.razaoSocial || ''),
      email: String(c.email || ''),
      phone: String(c.phone || c.telefone || ''),
      documentType: documentType as 'CPF' | 'CNPJ',
      address,
    }
  })
}

/**
 * Normaliza a resposta do dashboard.
 * Backend pode retornar: { data: {...} } ou {...} direto
 */
export function normalizeDashboard(raw: unknown): DashboardData {
  if (!raw || typeof raw !== 'object') return emptyDashboard()

  const obj = raw as Record<string, unknown>
  const data = (obj.data && typeof obj.data === 'object') ? obj.data as Record<string, unknown> : obj

  return {
    notasEmitidas: buildMetric(data, 'notasEmitidas'),
    receitaTotal: buildMetric(data, 'receitaTotal'),
    notasCanceladas: buildMetric(data, 'notasCanceladas'),
    taxaSucesso: buildMetric(data, 'taxaSucesso'),
    monthlyData: Array.isArray(data.monthlyData) ? data.monthlyData : [],
    recentNotes: Array.isArray(data.recentNotes) ? data.recentNotes : [],
  }
}

/**
 * Constrói uma métrica a partir da resposta do backend.
 * Backend pode retornar:
 *   - Objeto: { value: 10, change: 5 }
 *   - Campos planos: notasEmitidas: 10, notasEmitidasChange: 100
 */
function buildMetric(data: Record<string, unknown>, key: string): DashboardMetric {
  const val = data[key]

  // Formato objeto: { value, change }
  if (val && typeof val === 'object') {
    const m = val as Record<string, unknown>
    return {
      value: (m.value as number | string) ?? 0,
      change: Number(m.change ?? 0),
    }
  }

  // Formato plano: key = valor, keyChange = variação
  return {
    value: (val as number | string) ?? 0,
    change: Number(data[`${key}Change`] ?? 0),
  }
}

function emptyDashboard(): DashboardData {
  const zero: DashboardMetric = { value: 0, change: 0 }
  return { notasEmitidas: zero, receitaTotal: zero, notasCanceladas: zero, taxaSucesso: zero, monthlyData: [], recentNotes: [] }
}

/**
 * Normaliza a resposta de notas.
 * Backend pode retornar: { notes: [...] }, { data: [...] } ou [...]
 */
export function normalizeNotes(raw: unknown): NfseNote[] {
  if (!raw || typeof raw !== 'object') return []

  if (Array.isArray(raw)) return raw as NfseNote[]

  const obj = raw as Record<string, unknown>
  const list = obj.notes ?? obj.data ?? []

  if (!Array.isArray(list)) return []

  return list.map((item: unknown) => {
    const n = item as Record<string, unknown>
    return {
      id: String(n.id || ''),
      chaveAcesso: n.chaveAcesso ? String(n.chaveAcesso) : undefined,
      codigoAutorizacao: n.codigoAutorizacao ? String(n.codigoAutorizacao) : undefined,
      numeroNota: String(n.numeroNota || ''),
      valorServico: Number(n.valorServico || 0),
      valorLiquido: Number(n.valorLiquido || 0),
      clientName: String(n.clientName || ''),
      clientDocument: String(n.clientCpfCnpj || n.clientDocument || ''),
      serviceId: String(n.serviceId || ''),
      serviceDescription: String(n.serviceDescription || ''),
      status: mapNoteStatus(n.status),
      createdAt: toISOString(n.createdAt),
      updatedAt: n.updatedAt ? toISOString(n.updatedAt) : undefined,
      canceladoAt: n.canceladoAt ? toISOString(n.canceladoAt) : undefined,
    }
  })
}

/**
 * Converte timestamp numérico ou string para ISO string.
 */
function toISOString(val: unknown): string {
  if (typeof val === 'number') return new Date(val).toISOString()
  if (typeof val === 'string' && /^\d+$/.test(val)) return new Date(parseInt(val, 10)).toISOString()
  return String(val || '')
}

/**
 * Mapeia status do backend para status da UI.
 * Backend: AUTORIZADA, CANCELADA, FALHA_EMISSAO
 * UI: emitida, cancelada, pendente
 */
function mapNoteStatus(raw: unknown): NoteStatus {
  const s = String(raw || '').toUpperCase()
  switch (s) {
    case 'AUTORIZADA': return 'emitida'
    case 'CANCELADA': return 'cancelada'
    case 'FALHA_EMISSAO': return 'pendente'
    default: return 'pendente'
  }
}

/**
 * Normaliza a resposta de licença.
 * Backend pode retornar: { data: {...} } ou {...} direto
 */
export function normalizeLicense(raw: unknown): License {
  if (!raw || typeof raw !== 'object') return { type: 'trial', status: 'unknown' }
  const obj = raw as Record<string, unknown>
  const data = (obj.data && typeof obj.data === 'object') ? obj.data as Record<string, unknown> : obj
  return {
    id: data.id ? String(data.id) : undefined,
    type: String(data.type || 'trial'),
    status: String(data.status || 'unknown'),
    startDate: data.startDate ? Number(data.startDate) : undefined,
    endDate: data.endDate ? Number(data.endDate) : undefined,
    features: Array.isArray(data.features) ? data.features : undefined,
    createdAt: data.createdAt ? Number(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? Number(data.updatedAt) : undefined,
    freeNotesQuota: Number(data.freeNotesQuota) || undefined,
    notesUsedThisMonth: Number(data.notesUsedThisMonth) || 0,
    quotaPeriodEnd: Number(data.quotaPeriodEnd) || undefined,
  }
}
