/**
 * Máscaras monetárias e de percentual.
 * Padrão: input armazena apenas dígitos, exibição é formatada.
 */

/**
 * Formata dígitos como moeda brasileira (R$ 0,00).
 * @param digits String contendo apenas dígitos (ex: "20000" -> "R$ 200,00")
 */
export function formatMoney(digits: string): string {
  const clean = digits.replace(/\D/g, '')
  if (!clean) return ''
  const numericValue = parseInt(clean, 10) / 100
  return numericValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

/**
 * Extrai apenas dígitos de um valor monetário.
 * Usado no onChange do input.
 */
export function extractMoneyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Converte dígitos armazenados para valor numérico (centavos -> reais).
 * @param digits String contendo apenas dígitos (ex: "20000" -> 200.00)
 */
export function moneyDigitsToNumber(digits: string): number {
  const clean = digits.replace(/\D/g, '')
  if (!clean) return 0
  return parseInt(clean, 10) / 100
}

/**
 * Converte número para dígitos armazenáveis (reais -> centavos string).
 * @param value Número em reais (ex: 200.00 -> "20000")
 */
export function numberToMoneyDigits(value: number): string {
  if (!value) return ''
  return Math.round(value * 100).toString()
}

/**
 * Formata dígitos como percentual (ex: "500" -> "5,00%").
 * @param digits String contendo apenas dígitos (ex: "500" -> "5,00%")
 */
export function formatPercent(digits: string): string {
  const clean = digits.replace(/\D/g, '')
  if (!clean) return ''
  const numericValue = parseInt(clean, 10) / 100
  return numericValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + '%'
}

/**
 * Converte dígitos de percentual para número.
 * @param digits String contendo apenas dígitos (ex: "500" -> 5.00)
 */
export function percentDigitsToNumber(digits: string): number {
  const clean = digits.replace(/\D/g, '')
  if (!clean) return 0
  return parseInt(clean, 10) / 100
}

/**
 * Converte número para dígitos de percentual.
 * @param value Número (ex: 5.00 -> "500")
 */
export function numberToPercentDigits(value: number): string {
  if (!value) return ''
  return Math.round(value * 100).toString()
}

/**
 * Formata telefone brasileiro.
 * (XX) XXXXX-XXXX para celular (11 dígitos)
 * (XX) XXXX-XXXX para fixo (10 dígitos)
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
}

/**
 * Extrai apenas dígitos de um telefone (para armazenar).
 */
export function extractPhoneDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11)
}

/**
 * Formata CNPJ: 00.000.000/0000-00
 */
export function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`
}

export function extractCnpjDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 14)
}

/**
 * Formata CEP: 00000-000
 */
export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`
}

export function extractCepDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 8)
}

/**
 * Formata CPF: 000.000.000-00
 */
export function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
}

export function extractCpfDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11)
}
