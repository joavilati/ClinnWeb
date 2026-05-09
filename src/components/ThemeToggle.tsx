'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="w-9 h-9" aria-hidden />
  }

  const isDark = resolvedTheme === 'dark'
  const Icon = isDark ? Sun : Moon
  const label = isDark ? 'Tema: Escuro (clique para Claro)' : 'Tema: Claro (clique para Escuro)'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={label}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      <Icon className="h-5 w-5" />
    </button>
  )
}
