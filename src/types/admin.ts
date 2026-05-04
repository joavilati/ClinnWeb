export interface AdminDashboard {
  totalEmpresas: number
  empresasAtivas: number
  licencasAtivas: number
  licencasExpiradas: number
  licencasTrial: number
  licencasSuspensas: number
  receitaMensal: number
  novasEmpresasMes: number
  taxaConversao: number
  revenueData: { month: string; receita: number }[]
  planDistribution: { name: string; value: number }[]
}

export interface AdminEmissor {
  id: string
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  email: string
  telefone: string
  status: string
  dataCadastro: number
  licenca: {
    tipo: string
    status: string
    dataExpiracao: number | null
    diasRestantes: number | null
  } | null
  nfseEmitidas: number
}

export interface AdminEmissorDetail {
  id: string
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  email: string
  telefone: string
  status: string
  logradouro: string
  numero: string
  bairro: string
  cep: string
  cidade: string
  uf: string
  inscricaoMunicipal: string
  dataCadastro: number
  licenca: {
    id: string
    tipo: string
    status: string
    startDate: number
    endDate: number | null
    features: string[]
    diasRestantes: number | null
    createdAt: number
    updatedAt: number
  } | null
  pagamentos: AdminPayment[]
  uso: {
    nfseEmitidas: number
    clientesCadastrados: number
    servicosCadastrados: number
  }
}

export interface AdminLicense {
  emissorId: string
  empresa: string
  cnpj: string
  tipo: string
  status: string
  dataInicio: number
  dataExpiracao: number | null
  diasRestantes: number | null
}

export interface AdminPayment {
  id: string
  emissorId: string
  empresa: string
  licenseId: string
  type: string
  status: string
  method: string | null
  amount: number
  description: string
  licenseType: string
  paidAt: number | null
  createdAt: number
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: number
}

export interface AdminAuditEntry {
  id: string
  admin: string
  action: string
  details: string
  createdAt: number
}
