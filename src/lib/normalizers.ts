import type { Client, Service, ClientAddress, DashboardData, DashboardMetric, NfseNote, NoteStatus } from '@/types'

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
    notasEmitidas: normalizeMetric(data.notasEmitidas),
    receitaTotal: normalizeMetric(data.receitaTotal),
    notasCanceladas: normalizeMetric(data.notasCanceladas),
    taxaSucesso: normalizeMetric(data.taxaSucesso),
    monthlyData: Array.isArray(data.monthlyData) ? data.monthlyData : [],
    recentNotes: Array.isArray(data.recentNotes) ? data.recentNotes : [],
  }
}

function normalizeMetric(val: unknown): DashboardMetric {
  if (!val || typeof val !== 'object') return { value: 0, change: 0 }
  const m = val as Record<string, unknown>
  return {
    value: (m.value as number | string) ?? 0,
    change: Number(m.change ?? 0),
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
      clientDocument: String(n.clientDocument || ''),
      serviceId: String(n.serviceId || ''),
      serviceDescription: String(n.serviceDescription || ''),
      status: (n.status as NoteStatus) || 'pendente',
      createdAt: String(n.createdAt || ''),
      updatedAt: n.updatedAt ? String(n.updatedAt) : undefined,
      canceladoAt: n.canceladoAt ? String(n.canceladoAt) : undefined,
    }
  })
}
