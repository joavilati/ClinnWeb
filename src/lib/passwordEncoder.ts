/**
 * Codifica a senha em Base64 para transporte.
 * Deve ser aplicado antes de enviar ao backend, conforme padrão do KMP.
 */
export function encodePassword(password: string): string {
  if (typeof window !== 'undefined') {
    return btoa(password)
  }
  return Buffer.from(password).toString('base64')
}
