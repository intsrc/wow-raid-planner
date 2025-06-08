"use client"

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react'

export type MessageType = 'success' | 'error' | 'info' | 'warning'

interface MessageModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: MessageType
  buttonText?: string
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-400',
    borderColor: 'border-green-500/30',
    bgColor: 'bg-green-500/10'
  },
  error: {
    icon: XCircle,
    iconColor: 'text-red-400',
    borderColor: 'border-red-500/30',
    bgColor: 'bg-red-500/10'
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/30',
    bgColor: 'bg-yellow-500/10'
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/10'
  }
}

export function MessageModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'OK'
}: MessageModalProps) {
  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-slate-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className={`p-2 rounded-full ${config.bgColor} ${config.borderColor} border`}>
              <Icon className={`w-5 h-5 ${config.iconColor}`} />
            </div>
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-slate-300 leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            className="bg-slate-700 hover:bg-slate-600 text-slate-100 w-full"
          >
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 