export function isValidCpf(value: string): boolean {
  const d = value.replace(/\D/g, '')
  if (d.length !== 11) return false
  if (/^(\d)\1{10}$/.test(d)) return false
  const calc = (slice: number) => {
    let sum = 0
    for (let i = 0; i < slice; i++) sum += parseInt(d[i], 10) * (slice + 1 - i)
    const r = (sum * 10) % 11
    return r === 10 ? 0 : r
  }
  return calc(9) === parseInt(d[9], 10) && calc(10) === parseInt(d[10], 10)
}

export function isValidCnpj(value: string): boolean {
  const d = value.replace(/\D/g, '')
  if (d.length !== 14) return false
  if (/^(\d)\1{13}$/.test(d)) return false
  const calc = (slice: number) => {
    const weights = slice === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    let sum = 0
    for (let i = 0; i < slice; i++) sum += parseInt(d[i], 10) * weights[i]
    const r = sum % 11
    return r < 2 ? 0 : 11 - r
  }
  return calc(12) === parseInt(d[12], 10) && calc(13) === parseInt(d[13], 10)
}
