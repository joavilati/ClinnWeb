'use client'

import { SWRConfig } from 'swr'
import { ReactNode } from 'react'

interface SWRProviderProps {
  children: ReactNode
}

/**
 * Provider global do SWR com configurações de cache otimizadas.
 */
export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        refreshInterval: 0,
        dedupingInterval: 5000,
        keepPreviousData: true,
        errorRetryCount: 3,
        onError: (error) => {
          if (typeof window !== 'undefined' && 'Sentry' in window) {
            import('@sentry/nextjs').then((Sentry) => Sentry.captureException(error))
          }
        },
      }}
    >
      {children}
    </SWRConfig>
  )
}
