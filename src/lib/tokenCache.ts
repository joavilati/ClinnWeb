/**
 * Token cache — com httpOnly cookies, o token não é mais acessível no client-side.
 * Este módulo agora gerencia apenas a detecção de sessão via dados do usuário no localStorage.
 */
import { STORAGE_KEYS } from '@/lib/constants'

/**
 * Verifica se há uma sessão ativa (dados do usuário no localStorage).
 * O token real está no cookie httpOnly (inacessível pelo JS).
 */
export function hasSession(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem(STORAGE_KEYS.USER_ID)
}

/**
 * Limpa dados de sessão do localStorage.
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.USER_ID)
  localStorage.removeItem(STORAGE_KEYS.USER_CNPJ)
  localStorage.removeItem(STORAGE_KEYS.USER_NAME)
  localStorage.removeItem(STORAGE_KEYS.USER_EMAIL)
}
