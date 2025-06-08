import { getStatusColor, getStatusText, getSlotStatusInfo } from '../../lib/dashboard-utils'

interface SlotCounterProps {
  role: string
  filled: number
  cap: number
  icon: React.ReactNode
}

// Enhanced Slot Counter Component with better UX
export function SlotCounter({ role, filled, cap, icon }: SlotCounterProps) {
  const percentage = (filled / cap) * 100
  const isFull = filled >= cap
  const isOverfilled = filled > cap
  const remaining = cap - filled
  
  const getStatusColor = () => {
    if (isOverfilled) return 'text-red-500'
    if (isFull) return 'text-yellow-600'
    if (filled / cap > 0.7) return 'text-orange-500'
    return 'text-emerald-500'
  }

  const getStatusText = () => {
    if (isOverfilled) return 'Overfilled'
    if (isFull) return 'Full'
    if (remaining === 1) return `Need ${remaining}`
    if (remaining > 1) return `Need ${remaining}`
    return 'Complete'
  }

  return (
    <div className="group relative p-4 rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/80 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
            {icon}
          </div>
          <span className="font-medium text-foreground capitalize">{role}s</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground">{filled}</div>
          <div className="text-xs text-muted-foreground">of {cap}</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className={`font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          <span className="text-muted-foreground">
            {Math.round(percentage)}%
          </span>
        </div>
        
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`progress-bar h-full transition-all duration-500 ease-out rounded-full ${
              isOverfilled 
                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                : isFull 
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' 
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
          {isOverfilled && (
            <div className="absolute inset-0 bg-red-500/20 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  )
}

// Compact Slot Counter for Collapsed State - Mobile Optimized
export function CompactSlotCounter({ role, filled, cap, icon }: SlotCounterProps) {
  const percentage = (filled / cap) * 100
  const isFull = filled >= cap
  const isOverfilled = filled > cap
  const needed = Math.max(0, cap - filled)
  
  const statusInfo = getSlotStatusInfo(filled, cap)

  return (
    <div className={`group relative p-2 rounded-lg border border-border/50 bg-gradient-to-br from-card to-card/80 transition-all duration-300 md:${statusInfo.color} md:hover:shadow-lg md:${statusInfo.bgGlow}`}>
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className={`p-2 rounded-lg border transition-all duration-300 ${statusInfo.color}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${statusInfo.textColor} bg-current/15`}>
                {icon}
              </div>
              <div>
                <div className={`text-sm font-bold ${statusInfo.textColor} capitalize`}>
                  {role}s
                </div>
                <div className="text-xs text-muted-foreground">
                  {statusInfo.status}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xl font-bold ${statusInfo.textColor}`}>
                {filled}
              </div>
              <div className="text-xs text-muted-foreground">
                of {cap}
              </div>
            </div>
          </div>
          
          <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden mb-2">
            <div 
              className={`h-full transition-all duration-700 ease-out rounded-full ${statusInfo.barColor}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
            {isOverfilled && (
              <div className="absolute inset-0 bg-red-500/20 animate-pulse" />
            )}
          </div>
          
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">{Math.round(percentage)}% filled</span>
            {needed > 0 && (
              <span className={`${statusInfo.textColor} font-medium`}>
                {needed} more needed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout - Original Design */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded bg-primary/10 group-hover:bg-primary/15 transition-colors">
              {icon}
            </div>
            <span className="text-xs font-medium text-foreground capitalize">{role}s</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-foreground">{filled}</div>
            <div className="text-xs text-muted-foreground leading-none">of {cap}</div>
          </div>
        </div>
        
        <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ease-out rounded-full ${
              isOverfilled 
                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                : isFull 
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' 
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
          {isOverfilled && (
            <div className="absolute inset-0 bg-red-500/20 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  )
} 