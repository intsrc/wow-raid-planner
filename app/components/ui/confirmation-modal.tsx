"use client"

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'

export type ConfirmationType = 'warning' | 'danger' | 'success' | 'info'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: ConfirmationType
  loading?: boolean
}

const typeConfig = {
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-400',
    confirmButtonColor: 'bg-yellow-500 hover:bg-yellow-600'
  },
  danger: {
    icon: XCircle,
    iconColor: 'text-red-400',
    confirmButtonColor: 'bg-red-500 hover:bg-red-600'
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-400',
    confirmButtonColor: 'bg-green-500 hover:bg-green-600'
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-400',
    confirmButtonColor: 'bg-blue-500 hover:bg-blue-600'
  }
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  loading = false
}: ConfirmationModalProps) {
  const config = typeConfig[type]
  const Icon = config.icon

  const handleConfirm = () => {
    onConfirm()
    if (!loading) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-slate-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Icon className={`w-6 h-6 ${config.iconColor}`} />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-slate-300 leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className={`${config.confirmButtonColor} text-white`}
          >
            {loading ? 'Loading...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 