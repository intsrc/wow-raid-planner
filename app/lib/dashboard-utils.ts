import { classColors } from './constants'
import { getRoleFromSpec as getRoleFromSpecUtil } from './character-utils'

// Helper function to determine role from class and spec
export const getRoleFromSpec = (wowClass: string, spec: string): string => {
  return getRoleFromSpecUtil(wowClass, spec)
}

// Get role color utility
export const getRoleColor = (role: string) => {
  switch (role) {
    case 'tank': return 'text-blue-500 bg-blue-500/10'
    case 'heal': return 'text-emerald-500 bg-emerald-500/10'
    case 'melee': return 'text-red-500 bg-red-500/10'
    case 'ranged': return 'text-purple-500 bg-purple-500/10'
    default: return 'text-gray-500 bg-gray-500/10'
  }
}

// Enhanced date formatting utilities
export const getRelativeDate = (date: Date) => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  
  if (date.toDateString() === today.toDateString()) return "Today"
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow"
  
  const diffTime = date.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays <= 7) return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  })
}

export const getDateUrgency = (date: Date) => {
  const today = new Date()
  const diffTime = date.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'tomorrow'
  if (diffDays <= 3) return 'soon'
  return 'normal'
}

// Status information utilities
export const getSlotStatusInfo = (filled: number, cap: number) => {
  const percentage = (filled / cap) * 100
  const isFull = filled >= cap
  const isOverfilled = filled > cap
  const needed = Math.max(0, cap - filled)
  
  if (isOverfilled) return { 
    color: 'border-red-500/30 bg-red-500/10', 
    textColor: 'text-red-600',
    barColor: 'bg-gradient-to-r from-red-500 to-red-600',
    status: 'Over',
    bgGlow: 'shadow-red-500/20'
  }
  if (isFull) return { 
    color: 'border-emerald-500/30 bg-emerald-500/10', 
    textColor: 'text-emerald-600',
    barColor: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
    status: 'Full',
    bgGlow: 'shadow-emerald-500/20'
  }
  if (filled / cap > 0.7) return { 
    color: 'border-yellow-500/30 bg-yellow-500/10', 
    textColor: 'text-yellow-600',
    barColor: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    status: 'Close',
    bgGlow: 'shadow-yellow-500/20'
  }
  return { 
    color: 'border-blue-500/30 bg-blue-500/10', 
    textColor: 'text-blue-600',
    barColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
    status: `Need ${needed}`,
    bgGlow: 'shadow-blue-500/20'
  }
}

export const getStatusColor = (filled: number, cap: number) => {
  const isOverfilled = filled > cap
  const isFull = filled >= cap
  
  if (isOverfilled) return 'text-red-500'
  if (isFull) return 'text-yellow-600'
  if (filled / cap > 0.7) return 'text-orange-500'
  return 'text-emerald-500'
}

export const getStatusText = (filled: number, cap: number) => {
  const isOverfilled = filled > cap
  const isFull = filled >= cap
  const remaining = cap - filled
  
  if (isOverfilled) return 'Overfilled'
  if (isFull) return 'Full'
  if (remaining === 1) return `Need ${remaining}`
  if (remaining > 1) return `Need ${remaining}`
  return 'Complete'
} 