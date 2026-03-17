'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { ChevronDown } from 'lucide-react'

interface Municipality {
  name: string
  state: string
  code: string
}

let municipalitiesCache: Municipality[] | null = null

async function loadMunicipalities(): Promise<Municipality[]> {
  if (municipalitiesCache) return municipalitiesCache
  const res = await fetch('/data/municipalities.json')
  municipalitiesCache = await res.json()
  return municipalitiesCache!
}

interface MunicipioAutocompleteProps {
  value: string
  estado: string
  onChange: (name: string, code: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function MunicipioAutocomplete({
  value,
  estado,
  onChange,
  placeholder = 'Digite para buscar...',
  className = '',
  disabled = false,
}: MunicipioAutocompleteProps) {
  const [all, setAll] = useState<Municipality[]>([])
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMunicipalities().then(setAll)
  }, [])

  // Sync external value
  useEffect(() => {
    setQuery(value)
  }, [value])

  const filtered = useMemo(() => {
    if (!estado || !query) return []
    const uf = estado.toUpperCase()
    const q = query.toLowerCase()
    return all
      .filter((m) => m.state === uf && m.name.toLowerCase().includes(q))
      .slice(0, 50)
  }, [all, estado, query])

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Scroll highlighted item into view
  useEffect(() => {
    if (open && listRef.current) {
      const item = listRef.current.children[highlightIndex] as HTMLElement
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightIndex, open])

  const handleSelect = (m: Municipality) => {
    setQuery(m.name)
    onChange(m.name, m.code)
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || filtered.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      handleSelect(filtered[highlightIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setHighlightIndex(0)
          }}
          onFocus={() => { if (query && estado) setOpen(true) }}
          onKeyDown={handleKeyDown}
          placeholder={!estado ? 'Selecione o estado primeiro' : placeholder}
          disabled={disabled || !estado}
          className={`h-11 bg-white border-gray-300 pr-8 ${!estado ? 'opacity-60' : ''}`}
        />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {open && filtered.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          {filtered.map((m, i) => (
            <button
              key={m.code}
              type="button"
              onClick={() => handleSelect(m)}
              className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                i === highlightIndex
                  ? 'bg-[#7C3AED]/10 text-[#7C3AED]'
                  : 'text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="font-medium">{m.name}</span>
              <span className="text-xs text-gray-400 ml-2">{m.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
