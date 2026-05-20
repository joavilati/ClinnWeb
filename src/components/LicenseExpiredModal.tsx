'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'

export type LicenseBlockReason = 'quota_exceeded' | 'license_expired' | 'license_suspended'

interface LicenseExpiredModalProps {
  open: boolean
  onClose: () => void
  reason?: LicenseBlockReason
}

const reasonContent: Record<LicenseBlockReason, { title: string; description: string }> = {
  quota_exceeded: {
    title: 'Limite de notas atingido',
    description:
      'Você usou todas as notas grátis deste mês. Assine um plano para emitir notas ilimitadas.',
  },
  license_expired: {
    title: 'Licença Expirada',
    description: 'Sua licença expirou. Renove para continuar emitindo notas.',
  },
  license_suspended: {
    title: 'Licença Suspensa',
    description: 'Sua licença está suspensa. Renove para continuar emitindo notas.',
  },
}

export function LicenseExpiredModal({ open, onClose, reason = 'license_expired' }: LicenseExpiredModalProps) {
  const router = useRouter()
  const content = reasonContent[reason] ?? reasonContent.license_expired

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <DialogTitle className="text-xl">{content.title}</DialogTitle>
            <DialogDescription className="mt-2">
              {content.description}
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-4 flex gap-2 sm:justify-center">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
            onClick={() => { onClose(); router.push('/pagamentos') }}
          >
            Ver Planos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
