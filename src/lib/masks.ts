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
