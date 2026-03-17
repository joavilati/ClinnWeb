// ===== Auth =====
export interface LoginRequest {
  cnpj: string
  password: string
}

export interface LoginResponse {
  token: string
  userId: string
  name?: string
  email?: string
  expiresIn?: number
}

export interface RegisterRequest {
  cnpj: string
  email: string
  password: string
}

// ===== NFS-e =====
export interface NfseNote {
  id: string
  chaveAcesso?: string
  codigoAutorizacao?: string
  numeroNota: string
  valorServico: number
  valorLiquido: number
  clientName: string
  clientDocument: string
  serviceId: string
  serviceDescription: string
  status: NoteStatus
  createdAt: string
  updatedAt?: string
  canceladoAt?: string
}

export type NoteStatus = 'emitida' | 'pendente' | 'cancelada'

export interface CreateNoteRequest {
  clientId: string
  serviceId: string
  valorServico: number
  descricao?: string
  dataEmissao: string
  aliquotaIss: number
  pisCofins?: number
  ir?: number
  sendEmailCopy?: boolean
}

// ===== Client =====
export interface Client {
  id: string
  cpfCnpj: string
  companyName: string
  email?: string
  phone?: string
  documentType: 'CPF' | 'CNPJ'
  address?: ClientAddress
}

export interface ClientAddress {
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  estado?: string
  municipio?: string
}

export interface CreateClientRequest {
  razaoSocial: string
  documentType: 'CPF' | 'CNPJ'
  document: string
  email?: string
  phone?: string
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  estado?: string
  municipio?: string
}

// ===== Service =====
export interface Service {
  id: string
  name: string
  description?: string
  cTribNac: string
  cnae: string
  defaultValue?: number
}

export interface CreateServiceRequest {
  name: string
  code: string
  cnae: string
  defaultValue?: number
}

// ===== Dashboard =====
export interface DashboardData {
  notasEmitidas: DashboardMetric
  receitaTotal: DashboardMetric
  notasCanceladas: DashboardMetric
  taxaSucesso: DashboardMetric
  monthlyData: MonthlyData[]
  recentNotes: RecentNote[]
}

export interface DashboardMetric {
  value: number | string
  change: number
}

export interface MonthlyData {
  month: string
  value: number
  notas: number
}

export interface RecentNote {
  id: string
  client: string
  value: string
  status: NoteStatus
  date: string
}

// ===== Profile =====
export interface ProfileData {
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  inscricaoMunicipal: string
  regimeTributario: string
  cnaes: string[]
  email: string
  telefone: string
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  estado: string
  municipio: string
}

// ===== License =====
export interface License {
  id?: string
  type: string
  status: string
  startDate?: number
  endDate?: number
  features?: string[]
  createdAt?: number
  updatedAt?: number
}

// ===== Fiscal Config =====
export interface FiscalConfig {
  regimeApuracao: 'competencia' | 'caixa' | 'misto'
  simplesNacional: boolean
  exigibilidadeISS: string
}

export interface SerieNumeracao {
  serie: string
  numeroInicial: number
  sequenciaAutomatica: boolean
}

// ===== Certificate =====
export interface CertificateStatus {
  uploaded: boolean
  valid: boolean
  expiresAt?: string
  fileName?: string
}
