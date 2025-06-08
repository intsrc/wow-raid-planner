"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { MessageModal, MessageType } from '../components/ui/message-modal'
import { ConfirmationModal, ConfirmationType } from '../components/ui/confirmation-modal'

interface MessageModalState {
  isOpen: boolean
  title: string
  message: string
  type: MessageType
}

interface ConfirmationModalState {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  type: ConfirmationType
  loading?: boolean
}

interface ModalContextType {
  showMessage: (title: string, message: string, type?: MessageType) => void
  showConfirmation: (title: string, message: string, onConfirm: () => void, type?: ConfirmationType) => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

interface ModalProviderProps {
  children: ReactNode
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [messageModal, setMessageModal] = useState<MessageModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  const [confirmModal, setConfirmModal] = useState<ConfirmationModalState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning'
  })

  const showMessage = (title: string, message: string, type: MessageType = 'info') => {
    setMessageModal({
      isOpen: true,
      title,
      message,
      type
    })
  }

  const showConfirmation = (
    title: string, 
    message: string, 
    onConfirm: () => void, 
    type: ConfirmationType = 'warning'
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      type
    })
  }

  const hideMessage = () => {
    setMessageModal(prev => ({ ...prev, isOpen: false }))
  }

  const hideConfirmation = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }))
  }

  return (
    <ModalContext.Provider value={{ showMessage, showConfirmation }}>
      {children}
      
      {/* Global Modals - only rendered once at the app level */}
      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={hideMessage}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={hideConfirmation}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        loading={confirmModal.loading}
      />
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
} 